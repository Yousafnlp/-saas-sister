'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { api, ApiError } from '@/lib/api';
import { toDateOnly } from '@/lib/date-utils';
import DataTable from '@/components/data-table';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
    <div className="min-h-full bg-card">
      {/* Stats */}
      <div className="grid grid-cols-1 gap-3 border-b border-border p-3 md:grid-cols-3">
        <StatCard icon={Receipt} label="Total Expenses" value={`Rs ${totalExpenses.toLocaleString()}`} tone="primary" />
        <StatCard icon={CheckCircle} label="Approved" value={`Rs ${approvedExpenses.toLocaleString()}`} tone="success" />
        <StatCard icon={Clock} label="Pending Review" value={`Rs ${pendingExpenses.toLocaleString()}`} tone="warning" />
      </div>

      {/* Table */}
      <DataTable
        flush
        columns={expenseColumns}
        data={filteredExpenses}
        emptyMessage={isLoading ? 'Loading expenses...' : 'No expenses found.'}
        toolbar={
          <div className="flex gap-3">
            <Select
              value={selectedMonth || 'thisWeek'}
              onValueChange={(value) => {
                if (value === 'thisWeek') {
                  setFilterType('thisWeek');
                  setSelectedMonth(null);
                } else {
                  setFilterType('month');
                  setSelectedMonth(value);
                }
              }}
            >
              <SelectTrigger className="flex-1 sm:w-44 sm:flex-none" aria-label="Filter by period">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="thisWeek">This Week</SelectItem>
                {months.map((month) => (
                  <SelectItem key={month} value={month}>
                    {month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button className="gap-2 whitespace-nowrap sm:ml-auto" onClick={() => setShowDrawer(true)}>
              <Plus className="size-4" /> <span className="hidden sm:inline">New Expense</span>
            </Button>
          </div>
        }
        footer={
          <>
            Showing <span className="font-medium text-foreground">{filteredExpenses.length}</span> expenses
          </>
        }
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
