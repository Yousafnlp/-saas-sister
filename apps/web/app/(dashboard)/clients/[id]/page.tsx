'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { api, ApiError } from '@/lib/api';
import { toDateOnly } from '@/lib/date-utils';
import type { Client } from '@/components/pages/clients/sheet';
import type { Bill } from '@/components/pages/billing/types';
import { StatusBadge, type StatusTone } from '@/components/status-badge';
import { ArrowLeft, Calendar, ClipboardList, Phone, Printer, User } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface ClientResponse {
  success: boolean;
  data: Client;
}

interface BillListResponse {
  success: boolean;
  data: Bill[];
}

const PAYMENT_STATUS_TONE: Record<string, StatusTone> = {
  Paid: 'success',
  Pending: 'danger',
};

function Field({ icon: Icon, label, value }: { icon?: LucideIcon; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      {Icon && (
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-4" />
        </div>
      )}
      <div className="min-w-0">
        <p className="text-xs font-medium text-muted-foreground md:text-sm">{label}</p>
        <p className="mt-0.5 font-medium text-foreground">{value}</p>
      </div>
    </div>
  );
}

export default function ClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [client, setClient] = useState<Client | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'not-found' | 'error'>('loading');
  const [bills, setBills] = useState<Bill[]>([]);
  const [billsLoading, setBillsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    api
      .get<ClientResponse>(`/clients/${id}`)
      .then((res) => {
        if (cancelled) return;
        setClient({ ...res.data, date: toDateOnly(res.data.date), nextVisit: toDateOnly(res.data.nextVisit) });
        setStatus('ready');

        if (res.data.number) {
          api
            .get<BillListResponse>(`/bills?clientNumber=${encodeURIComponent(res.data.number)}`)
            .then((billRes) => {
              if (!cancelled) setBills(billRes.data);
            })
            .catch(() => {
              if (!cancelled) setBills([]);
            })
            .finally(() => {
              if (!cancelled) setBillsLoading(false);
            });
        } else {
          setBillsLoading(false);
        }
      })
      .catch((err) => {
        if (cancelled) return;
        setStatus(err instanceof ApiError && err.status === 404 ? 'not-found' : 'error');
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (status === 'loading') {
    return <div className="p-3 text-sm text-muted-foreground">Loading client...</div>;
  }

  if (status === 'not-found' || status === 'error') {
    return (
      <div className="min-h-screen space-y-3 bg-background p-3">
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

  const initials = client!.name
    .split(' ')
    .map(part => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="min-h-full bg-card">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border p-3">
        <Link
          href="/clients"
          className="flex size-9 shrink-0 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Back to Clients"
          title="Back to Clients"
        >
          <ArrowLeft className="size-4" />
        </Link>
        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
          {initials}
        </div>
        <h1 className="min-w-0 truncate text-base font-semibold text-foreground">{client!.name}</h1>
      </div>

      {/* Details */}
      <section className="border-b border-border">
        <h2 className="border-b border-border p-3 text-sm font-semibold text-foreground">Client Details</h2>
        <div className="grid grid-cols-1 gap-3 p-3 sm:grid-cols-2">
          <Field icon={Phone} label="Number" value={client!.number || '—'} />
          <Field icon={Calendar} label="Date" value={client!.date} />
          <Field icon={User} label="Age" value={String(client!.age)} />
          <Field icon={User} label="Gender" value={client!.gender} />
          <Field icon={Calendar} label="Next Visit" value={client!.nextVisit || '—'} />
          <div className="sm:col-span-2">
            <Field icon={ClipboardList} label="Concern" value={client!.concern || '—'} />
          </div>
          <div className="sm:col-span-2">
            <Field icon={ClipboardList} label="Treatment Plan" value={client!.treatmentPlan || '—'} />
          </div>
          <div className="sm:col-span-2">
            <Field icon={ClipboardList} label="Treatment History" value={client!.treatmentHistory || '—'} />
          </div>
        </div>
      </section>

      {/* Bills */}
      <section>
        <h2 className="border-b border-border p-3 text-sm font-semibold text-foreground">Bills</h2>
        {billsLoading ? (
          <p className="p-3 text-sm text-muted-foreground">Loading bills...</p>
        ) : bills.length === 0 ? (
          <p className="p-3 text-sm text-muted-foreground">
            {client!.number ? 'No bills found for this client.' : 'Add a phone number to this client to match bills.'}
          </p>
        ) : (
          <div className="divide-y divide-border border-b border-border">
            {bills.map((bill) => (
              <div key={bill.id} className="flex flex-wrap items-center justify-between gap-3 p-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{bill.invoiceNumber}</p>
                  <p className="truncate text-xs text-muted-foreground">{toDateOnly(bill.date)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold tabular-nums text-foreground">
                    Rs {bill.total.toLocaleString()}
                  </span>
                  <StatusBadge label={bill.paymentStatus} tone={PAYMENT_STATUS_TONE[bill.paymentStatus] ?? 'neutral'} />
                  <Link
                    href={`/billing/${bill.id}/print`}
                    target="_blank"
                    className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    aria-label={`Print bill ${bill.invoiceNumber}`}
                    title={`Print bill ${bill.invoiceNumber}`}
                  >
                    <Printer className="size-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
