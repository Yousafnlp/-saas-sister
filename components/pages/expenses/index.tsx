'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { api, ApiError } from '@/lib/api';
import { toDateOnly } from '@/lib/date-utils';
import DataTable from '@/components/data-table';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/page-header';
import { StatCard } from '@/components/stat-card';
import { Plus, Receipt, CheckCircle, Clock } from 'lucide-react';
import { ExpenseFormSheet, emptyExpense, type ExpenseFormData } from './sheet';
import { expenseColumns } from './column';

const months = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

interface Expense extends ExpenseFormData {
  id: string;
  status: string;
}

interface ExpenseListResponse {
  success: boolean;
  data: Expense[];
}

interface ExpenseResponse {
  success: boolean;
  data: Expense;
}

export default function Expenses() {
  const [filterType, setFilterType] = useState('thisWeek');
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDrawer, setShowDrawer] = useState(false);
  const [formData, setFormData] = useState(emptyExpense);

  useEffect(() => {
    let cancelled = false;

    api
      .get<ExpenseListResponse>('/expenses?limit=100')
      .then((res) => {
        if (cancelled) return;
        setExpenses(res.data.map((e) => ({ ...e, date: toDateOnly(e.date) })));
      })
      .catch((err) => {
        toast.error(err instanceof ApiError ? err.message : 'Failed to load expenses');
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const getFilteredExpenses = () => {
    if (filterType === 'thisWeek') {
      return expenses;
    }
    if (filterType === 'month' && selectedMonth) {
      return expenses;
    }
    return expenses;
  };

  const filteredExpenses = getFilteredExpenses();
  const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  const approvedExpenses = filteredExpenses.filter(e => e.status === 'Approved').reduce((sum, e) => sum + e.amount, 0);
  const pendingExpenses = filteredExpenses.filter(e => e.status === 'Pending').reduce((sum, e) => sum + e.amount, 0);

  const handleSave = async () => {
    try {
      const res = await api.post<ExpenseResponse>('/expenses', formData);
      setExpenses([...expenses, { ...res.data, date: toDateOnly(res.data.date) }]);
      toast.success('Expense submitted');
      setShowDrawer(false);
      setFormData(emptyExpense);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to submit expense');
    }
  };

  return (
    <div className="p-4 md:p-8 bg-background space-y-6 min-h-screen">
      <PageHeader title="Expenses" description="Track and manage employee expense claims." />

      {/* Filters */}
      <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm md:flex-row md:items-center md:justify-between md:p-6">
        <label className="font-semibold text-foreground">Filter By</label>
        <div className="flex gap-3 w-full md:w-auto">
          <select
            value={selectedMonth || 'thisWeek'}
            onChange={(e) => {
              if (e.target.value === 'thisWeek') {
                setFilterType('thisWeek');
                setSelectedMonth(null);
              } else {
                setFilterType('month');
                setSelectedMonth(e.target.value);
              }
            }}
            className="flex-1 md:flex-none rounded-lg border border-input bg-transparent h-9 px-3 text-sm text-foreground shadow-xs focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
          >
            <option value="thisWeek">This Week</option>
            {months.map(month => (
              <option key={month} value={month}>{month}</option>
            ))}
          </select>
          <Button
            className="bg-primary hover:bg-primary/90 text-white gap-2"
            onClick={() => setShowDrawer(true)}
          >
            <Plus className="w-4 h-4" /> <span className="hidden sm:inline">New Expense</span>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard icon={Receipt} label="Total Expenses" value={`$${totalExpenses.toLocaleString()}`} tone="primary" />
        <StatCard icon={CheckCircle} label="Approved" value={`$${approvedExpenses.toLocaleString()}`} tone="success" />
        <StatCard icon={Clock} label="Pending Review" value={`$${pendingExpenses.toLocaleString()}`} tone="warning" />
      </div>

      {/* Table */}
      <DataTable
        columns={expenseColumns}
        data={filteredExpenses}
        emptyMessage={isLoading ? 'Loading expenses...' : 'No expenses found.'}
      />

      {/* Side Sheet */}
      <ExpenseFormSheet
        open={showDrawer}
        onOpenChange={setShowDrawer}
        formData={formData}
        onFormDataChange={setFormData}
        onSubmit={handleSave}
      />
    </div>
  );
}
