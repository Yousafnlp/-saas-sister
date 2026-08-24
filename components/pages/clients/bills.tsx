'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { api, ApiError } from '@/lib/api';
import { toDateOnly } from '@/lib/date-utils';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/page-header';
import DataTable, { type DataTableColumn } from '@/components/data-table';
import { StatusBadge, type StatusTone } from '@/components/status-badge';
import { BillFormSheet, type ClientOption } from '@/components/pages/billing/sheet';
import { emptyBill, type Bill, type BillFormData } from '@/components/pages/billing/types';
import type { Client } from './sheet';
import { ArrowLeft, Edit, Plus, Printer } from 'lucide-react';

interface ClientResponse {
  success: boolean;
  data: Client;
}

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

const PAYMENT_STATUS_TONE: Record<string, StatusTone> = {
  Paid: 'success',
  Pending: 'danger',
};

function normalizeBill(bill: Bill): Bill {
  return { ...bill, date: toDateOnly(bill.date) };
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function ClientBills() {
  const { id } = useParams<{ id: string }>();
  const [client, setClient] = useState<Client | null>(null);
  const [bills, setBills] = useState<Bill[]>([]);
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'not-found' | 'error'>('loading');
  const [showSheet, setShowSheet] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<BillFormData>(emptyBill);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    api
      .get<ClientResponse>(`/clients/${id}`)
      .then((res) => {
        if (cancelled) return;
        setClient(res.data);
        setStatus('ready');

        if (!res.data.number) return;
        api
          .get<BillListResponse>(`/bills?clientNumber=${encodeURIComponent(res.data.number)}`)
          .then((billRes) => {
            if (!cancelled) setBills(billRes.data.map(normalizeBill));
          })
          .catch(() => {
            if (!cancelled) setBills([]);
          });
      })
      .catch((err) => {
        if (cancelled) return;
        setStatus(err instanceof ApiError && err.status === 404 ? 'not-found' : 'error');
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
  }, [id]);

  const handleAddClick = () => {
    if (!client) return;
    setEditingId(null);
    setFormData({ ...emptyBill, clientName: client.name, clientNumber: client.number, date: today() });
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
        setBills(bills.map((bill) => (bill.id === editingId ? normalizeBill(res.data) : bill)));
        toast.success('Bill updated');
      } else {
        const res = await api.post<BillResponse>('/bills', formData);
        setBills([normalizeBill(res.data), ...bills]);
        toast.success('Bill created');
      }
      setShowSheet(false);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to save bill');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === 'loading') {
    return <div className="p-8 text-sm text-muted-foreground">Loading bills...</div>;
  }

  if (status === 'not-found' || status === 'error' || !client) {
    return (
      <div className="min-h-screen space-y-6 bg-background p-4 md:p-8">
        <Link
          href="/clients"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Back to Clients
        </Link>
        <p className="text-sm text-muted-foreground">
          {status === 'not-found' ? 'Client not found.' : 'Failed to load client.'}
        </p>
      </div>
    );
  }

  const columns: DataTableColumn<Bill>[] = [
    { key: 'invoiceNumber', label: 'Invoice #', cellClassName: 'font-medium text-foreground whitespace-nowrap' },
    { key: 'date', label: 'Date' },
    {
      key: 'total',
      label: 'Total',
      align: 'right',
      render: (value: number) => <span className="tabular-nums">Rs {value.toLocaleString()}</span>,
    },
    {
      key: 'paymentStatus',
      label: 'Status',
      render: (value: string) => <StatusBadge label={value} tone={PAYMENT_STATUS_TONE[value] ?? 'neutral'} />,
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'right',
      render: (_value, bill) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="text-muted-foreground hover:text-foreground"
            onClick={() => handleEditClick(bill)}
            aria-label={`Edit bill ${bill.invoiceNumber}`}
            title={`Edit bill ${bill.invoiceNumber}`}
          >
            <Edit className="size-4" />
          </Button>
          <Button
            asChild
            type="button"
            variant="ghost"
            size="icon-sm"
            className="text-muted-foreground hover:text-foreground"
          >
            <Link
              href={`/billing/${bill.id}/print`}
              target="_blank"
              aria-label={`Print bill ${bill.invoiceNumber}`}
              title={`Print bill ${bill.invoiceNumber}`}
            >
              <Printer className="size-4" />
            </Link>
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen space-y-6 bg-background p-4 md:p-8">
      <Link
        href={`/clients/${client.id}`}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Back to {client.name}
      </Link>

      <PageHeader
        title={`Bills — ${client.name}`}
        description="All invoices for this client."
        actions={
          <Button className="gap-2 whitespace-nowrap" onClick={handleAddClick}>
            <Plus className="size-4" /> New Bill
          </Button>
        }
      />

      <DataTable columns={columns} data={bills} emptyMessage="No bills found for this client" />

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
