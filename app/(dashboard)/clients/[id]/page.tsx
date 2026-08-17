'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { api, ApiError } from '@/lib/api';
import { toDateOnly } from '@/lib/date-utils';
import type { Client } from '@/components/pages/clients/sheet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Calendar, ClipboardList, User } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface ClientResponse {
  success: boolean;
  data: Client;
}

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

  useEffect(() => {
    let cancelled = false;

    api
      .get<ClientResponse>(`/clients/${id}`)
      .then((res) => {
        if (cancelled) return;
        setClient({ ...res.data, date: toDateOnly(res.data.date), nextVisit: toDateOnly(res.data.nextVisit) });
        setStatus('ready');
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
    return <div className="p-8 text-sm text-muted-foreground">Loading client...</div>;
  }

  if (status === 'not-found' || status === 'error') {
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

  const initials = client!.name
    .split(' ')
    .map(part => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="min-h-screen space-y-6 bg-background p-4 md:p-8">
      <Link
        href="/clients"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Back to Clients
      </Link>

      {/* Header */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-primary/10 text-lg font-semibold text-primary">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Client</p>
            <h1 className="truncate text-2xl font-bold text-foreground md:text-3xl">{client!.name}</h1>
          </div>
        </div>
      </div>

      {/* Details */}
      <Card>
        <CardHeader>
          <CardTitle>Client Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <Field icon={Calendar} label="Date" value={client!.date} />
            <Field icon={User} label="Age" value={String(client!.age)} />
            <Field icon={User} label="Gender" value={client!.gender} />
            <Field icon={Calendar} label="Next Visit" value={client!.nextVisit || '—'} />
            <div className="sm:col-span-2">
              <Field icon={ClipboardList} label="Concern" value={client!.concern || '—'} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
