import asyncHandler from '../utils/asyncHandler.js';
import Employee from '../models/Employee.js';
import Expense from '../models/Expense.js';

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

async function buildStats() {
  const [totalEmployees, expensesAgg, pendingExpenses] = await Promise.all([
    Employee.countDocuments({ status: 'Active' }),
    Expense.aggregate([
      { $match: { status: 'Approved' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
    Expense.countDocuments({ status: 'Pending' }),
  ]);

  // No leave/attendance tracking exists, so every active employee counts as present.
  // No sales tracking exists either, so there is no revenue figure to report.
  return {
    totalEmployees,
    presentToday: totalEmployees,
    onLeave: 0,
    totalRevenue: 0,
    totalExpenses: expensesAgg[0]?.total || 0,
    averageAttendance: totalEmployees > 0 ? 100 : 0,
    pendingApprovals: pendingExpenses,
  };
}

async function buildChart(monthsBack = 6) {
  const now = new Date();
  const rangeStart = new Date(now.getFullYear(), now.getMonth() - (monthsBack - 1), 1);

  const expensesByMonth = await Expense.aggregate([
    { $match: { date: { $gte: rangeStart }, status: 'Approved' } },
    {
      $group: {
        _id: { year: { $year: '$date' }, month: { $month: '$date' } },
        total: { $sum: '$amount' },
      },
    },
  ]);

  const expensesMap = new Map(expensesByMonth.map((e) => [`${e._id.year}-${e._id.month}`, e.total]));

  const chart = [];
  for (let i = monthsBack - 1; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
    chart.push({
      month: MONTH_LABELS[d.getMonth()],
      revenue: 0,
      expenses: expensesMap.get(key) || 0,
    });
  }

  return chart;
}

export const getDashboard = asyncHandler(async (req, res) => {
  const [stats, chart] = await Promise.all([buildStats(), buildChart()]);
  res.status(200).json({ success: true, data: { stats, chart } });
});
