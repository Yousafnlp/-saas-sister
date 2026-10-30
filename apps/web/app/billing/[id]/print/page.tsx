'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { api, ApiError } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { ArrowLeft, Printer } from 'lucide-react';
import { Invoice } from '@/components/pages/billing/invoice';
import type { Bill } from '@/components/pages/billing/types';

interface BillResponse {
  success: boolean;
  data: Bill;
}

export default function PrintBillPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [bill, setBill] = useState<Bill | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    api
      .get<BillResponse>(`/bills/${id}`)
      .then((res) => {
        if (!cancelled) setBill(res.data);
      })
      .catch((err) => {
        toast.error(err instanceof ApiError ? err.message : 'Failed to load bill');
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  return (
    <div className="min-h-screen bg-muted/40 py-8 print:bg-white print:py-0">
      <div className="mx-auto mb-4 flex w-[80mm] max-w-full items-center justify-between px-1 print:hidden">
        <Link href="/billing" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> Back to Billing
        </Link>
        {bill && (
          <Button size="sm" className="gap-2" onClick={() => window.print()}>
            <Printer className="size-4" /> Print
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-24">
          <Spinner className="size-6 text-muted-foreground" />
        </div>
      ) : bill ? (
        <Invoice bill={bill} />
      ) : (
        <p className="text-center text-sm text-muted-foreground">Bill not found.</p>
      )}
    </div>
  );
}
