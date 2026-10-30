'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { api, ApiError } from '@/lib/api';
import { toDateOnly } from '@/lib/date-utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StatCard } from '@/components/stat-card';
import DataTable from '@/components/data-table';
import { Plus, Search, Receipt, CheckCircle, Clock } from 'lucide-react';
import { BillFormSheet, type ClientOption } from './sheet';
import { getBillColumns } from './column';
import { emptyBill, type Bill, type BillFormData } from './types';

interface BillListResponse {
  success: boolean;
  data: Bill[];
}

interface BillResponse {
  success: boolean;
  data: Bill;
}

interface ClientListResponse {
  success: boolean;
  data: ClientOption[];
}

function normalize(bill: Bill): Bill {
  return { ...bill, date: toDateOnly(bill.date) };
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function Billing() {
  const [searchQuery, setSearchQuery] = useState('');
  const [bills, setBills] = useState<Bill[]>([]);
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSheet, setShowSheet] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<BillFormData>(emptyBill);

  useEffect(() => {
    let cancelled = false;

    api
      .get<BillListResponse>('/bills?limit=100')
      .then((res) => {
        if (cancelled) return;
        setBills(res.data.map(normalize));
      })
      .catch((err) => {
        toast.error(err instanceof ApiError ? err.message : 'Failed to load bills');
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    api
      .get<ClientListResponse>('/clients?limit=100')
      .then((res) => {
        if (!cancelled) setClients(res.data);
      })
      .catch(() => {
        if (!cancelled) setClients([]);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredBills = bills.filter(
    (bill) =>
      bill.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bill.clientNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bill.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const totalBilled = bills.reduce((sum, b) => sum + b.total, 0);
  const totalPaid = bills.reduce((sum, b) => sum + b.amountPaid, 0);
  const totalOutstanding = totalBilled - totalPaid;

  const handleAddClick = () => {
    setEditingId(null);
    setFormData({ ...emptyBill, date: today() });
    setShowSheet(true);
  };

  const handleEditClick = (bill: Bill) => {
    setEditingId(bill.id);
    setFormData({
      clientName: bill.clientName,
      clientNumber: bill.clientNumber,
      date: bill.date,
      items: bill.items,
      discount: bill.discount,
      paymentMethod: bill.paymentMethod,
      paymentStatus: bill.paymentStatus,
      amountPaid: bill.amountPaid,
      notes: bill.notes,
    });
    setShowSheet(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this bill?')) return;

    try {
      await api.delete(`/bills/${id}`);
      setBills(bills.filter((bill) => bill.id !== id));
      toast.success('Bill deleted');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to delete bill');
    }
  };

  const handleStatusChange = async (bill: Bill, paymentStatus: string) => {
    try {
      const res = await api.put<BillResponse>(`/bills/${bill.id}`, { paymentStatus });
      setBills(bills.map((b) => (b.id === bill.id ? normalize(res.data) : b)));
      toast.success(`Payment status updated to ${paymentStatus}`);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to update payment status');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.items.length === 0) {
      toast.error('Add at least one service before saving.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingId) {
        const res = await api.put<BillResponse>(`/bills/${editingId}`, formData);
        setBills(bills.map((bill) => (bill.id === editingId ? normalize(res.data) : bill)));
        toast.success('Bill updated');
      } else {
        const res = await api.post<BillResponse>('/bills', formData);
        setBills([normalize(res.data), ...bills]);
        toast.success('Bill created');
      }
      setShowSheet(false);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to save bill');
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns = getBillColumns({
    onEdit: handleEditClick,
    onDelete: handleDelete,
    onStatusChange: handleStatusChange,
  });

  return (
    <div className="min-h-full bg-card">
      <div className="grid grid-cols-2 gap-3 border-b border-border p-3 md:grid-cols-3">
        <StatCard icon={Receipt} label="Total Billed" value={`Rs ${totalBilled.toLocaleString()}`} tone="primary" />
        <StatCard icon={CheckCircle} label="Total Collected" value={`Rs ${totalPaid.toLocaleString()}`} tone="success" />
        <StatCard icon={Clock} label="Outstanding" value={`Rs ${totalOutstanding.toLocaleString()}`} tone="warning" />
      </div>

      <DataTable
        flush
        columns={columns}
        data={filteredBills}
        emptyMessage={isLoading ? 'Loading bills...' : 'No bills found matching your search'}
        toolbar={
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative sm:w-72">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by client, number, or invoice #"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button className="gap-2 whitespace-nowrap sm:ml-auto" onClick={handleAddClick}>
              <Plus className="size-4" /> New Bill
            </Button>
          </div>
        }
        footer={
          <>
            Showing <span className="font-medium text-foreground">{filteredBills.length}</span> of {bills.length} bills
          </>
        }
      />

      <BillFormSheet
        open={showSheet}
        onOpenChange={setShowSheet}
        editingId={editingId}
        formData={formData}
        onFormDataChange={setFormData}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        clients={clients}
      />
    </div>
  );
}
