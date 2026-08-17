'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { api, ApiError } from '@/lib/api';
import DataTable from '@/components/data-table';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/page-header';
import { StatCard } from '@/components/stat-card';
import { Download, DollarSign, CheckCircle, TrendingUp, Clock } from 'lucide-react';
import { ProcessPayrollSheet, emptyProcessPayrollData } from './sheet';
import { payrollColumns } from './column';

interface Payroll {
  id: string;
  employeeName: string;
  employeeEmail: string;
  month: string;
  baseSalary: number;
  bonus: number;
  deductions: number;
  netSalary: number;
  status: string;
}

interface PayrollListResponse {
  success: boolean;
  data: Payroll[];
}

interface PayrollResponse {
  success: boolean;
  data: Payroll;
}

export default function Payroll() {
  const [payroll, setPayroll] = useState<Payroll[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDrawer, setShowDrawer] = useState(false);
  const [formData, setFormData] = useState(emptyProcessPayrollData);

  useEffect(() => {
    let cancelled = false;

    api
      .get<PayrollListResponse>('/payroll?limit=100')
      .then((res) => {
        if (cancelled) return;
        setPayroll(res.data);
      })
      .catch((err) => {
        toast.error(err instanceof ApiError ? err.message : 'Failed to load payroll');
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const totalSalaries = payroll.reduce((sum, p) => sum + p.netSalary, 0);
  const processedCount = payroll.filter(p => p.status === 'Processed').length;
  const totalBonus = payroll.reduce((sum, p) => sum + p.bonus, 0);
  const pendingCount = payroll.filter(p => p.status === 'Pending').length;

  const handleProcessPayroll = async () => {
    try {
      const res = await api.post<PayrollResponse>('/payroll', {
        employeeEmail: formData.email,
        month: formData.month,
        baseSalary: formData.salary,
        bonus: formData.bonus,
        deductions: formData.deductions,
      });
      setPayroll([...payroll, res.data]);
      toast.success('Payroll processed');
      setShowDrawer(false);
      setFormData(emptyProcessPayrollData);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to process payroll');
    }
  };

  return (
    <div className="p-4 md:p-8 bg-background space-y-6 min-h-screen">
      <PageHeader
        title="Payroll"
        description="Manage employee salaries and payments."
        actions={
          <>
            <Button
              className="bg-primary hover:bg-primary/90 text-white w-full md:w-auto"
              onClick={() => setShowDrawer(true)}
            >
              Process Payroll
            </Button>
            <Button variant="outline" className="border-border gap-2 w-full md:w-auto">
              <Download className="w-4 h-4" /> <span className="hidden sm:inline">Export</span>
            </Button>
          </>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={DollarSign} label="Total Payroll" value={`$${(totalSalaries / 1000).toFixed(0)}K`} tone="primary" />
        <StatCard icon={CheckCircle} label="Processed" value={processedCount} tone="success" />
        <StatCard icon={TrendingUp} label="Total Bonus" value={`$${totalBonus.toLocaleString()}`} tone="info" />
        <StatCard icon={Clock} label="Pending" value={pendingCount} tone="warning" />
      </div>

      {/* Table */}
      <DataTable
        columns={payrollColumns}
        data={payroll}
        emptyMessage={isLoading ? 'Loading payroll...' : 'No payroll records found.'}
      />

      {/* Side Sheet */}
      <ProcessPayrollSheet
        open={showDrawer}
        onOpenChange={setShowDrawer}
        formData={formData}
        onFormDataChange={setFormData}
        onSubmit={handleProcessPayroll}
      />
    </div>
  );
}
