'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { api, ApiError } from '@/lib/api';
import { toDateOnly } from '@/lib/date-utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StatCard } from '@/components/stat-card';
import DataTable from '@/components/data-table';
import { Search, Plus, Users, UserCheck, UserX } from 'lucide-react';
import { EmployeeFormSheet, Employee, emptyEmployee } from './sheet';
import { getEmployeeColumns } from './column';

interface EmployeeListResponse {
  success: boolean;
  data: Employee[];
}

interface EmployeeResponse {
  success: boolean;
  data: Employee;
}

export default function Employees() {
  const [searchTerm, setSearchTerm] = useState('');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDrawer, setShowDrawer] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<Employee, 'id'>>(emptyEmployee);

  useEffect(() => {
    let cancelled = false;

    api
      .get<EmployeeListResponse>('/employees?limit=100')
      .then((res) => {
        if (cancelled) return;
        setEmployees(res.data.map((emp) => ({ ...emp, joinDate: toDateOnly(emp.joinDate) })));
      })
      .catch((err) => {
        toast.error(err instanceof ApiError ? err.message : 'Failed to load employees');
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredData = employees.filter(emp =>
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddClick = () => {
    setEditingId(null);
    setFormData(emptyEmployee);
    setShowDrawer(true);
  };

  const handleEditClick = (employee: Employee) => {
    setEditingId(employee.id);
    setFormData(employee);
    setShowDrawer(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this employee?')) return;

    try {
      await api.delete(`/employees/${id}`);
      setEmployees(employees.filter(emp => emp.id !== id));
      toast.success('Employee deleted');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to delete employee');
    }
  };

  const handleSave = async () => {
    try {
      if (editingId) {
        const res = await api.put<EmployeeResponse>(`/employees/${editingId}`, formData);
        setEmployees(employees.map(emp =>
          emp.id === editingId ? { ...res.data, joinDate: toDateOnly(res.data.joinDate) } : emp
        ));
        toast.success('Employee updated');
      } else {
        const res = await api.post<EmployeeResponse>('/employees', formData);
        setEmployees([...employees, { ...res.data, joinDate: toDateOnly(res.data.joinDate) }]);
        toast.success('Employee added');
      }
      setShowDrawer(false);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to save employee');
    }
  };

  const columns = getEmployeeColumns({ onEdit: handleEditClick, onDelete: handleDelete });

  return (
    <div className="min-h-full bg-card">
      {/* Summary */}
      <div className="grid grid-cols-2 gap-3 border-b border-border p-3 md:grid-cols-3">
        <StatCard icon={Users} label="Total Employees" value={employees.length} tone="primary" />
        <StatCard icon={UserCheck} label="Active" value={employees.filter(e => e.status === 'Active').length} tone="success" />
        <StatCard icon={UserX} label="Inactive" value={employees.filter(e => e.status === 'Inactive').length} tone="danger" />
      </div>

      {/* Table */}
      <DataTable
        flush
        columns={columns}
        data={filteredData}
        emptyMessage={isLoading ? 'Loading employees...' : 'No employees found.'}
        toolbar={
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative sm:w-72">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by name or email"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button className="gap-2 whitespace-nowrap sm:ml-auto" onClick={handleAddClick}>
              <Plus className="size-4" /> Add Employee
            </Button>
          </div>
        }
        footer={
          <>
            Showing <span className="font-medium text-foreground">{filteredData.length}</span> of {employees.length} employees
          </>
        }
      />

      {/* Side Drawer */}
      <EmployeeFormSheet
        open={showDrawer}
        onOpenChange={setShowDrawer}
        editingId={editingId}
        formData={formData}
        onFormDataChange={setFormData}
        onSave={handleSave}
      />
    </div>
  );
}
