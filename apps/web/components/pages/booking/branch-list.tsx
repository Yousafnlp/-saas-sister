'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronRight, MapPin } from 'lucide-react';
import { api } from '@/lib/api';
import type { Branch } from '@/lib/branches';
import { BookingShell } from './shell';

type PublicBranch = Pick<Branch, 'id' | 'name' | 'slug' | 'city' | 'address'>;

export default function BookingBranchList() {
  const router = useRouter();
  const [branches, setBranches] = useState<PublicBranch[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    api
      .get<{ data: PublicBranch[] }>('/public/branches')
      .then((res) => {
        // With a single branch there is nothing to choose: go straight to its booking page.
        if (res.data.length === 1) router.replace(`/book/${res.data[0].slug}`);
        else setBranches(res.data);
      })
      .catch(() => setFailed(true));
  }, [router]);

  return (
    <BookingShell>
      <div className="rounded-2xl border border-border bg-card p-6">
        <h1 className="text-xl font-bold text-foreground">Book an appointment</h1>
        <p className="mt-1 text-sm text-muted-foreground">Choose the branch you’d like to visit.</p>

        <div className="mt-5 space-y-2">
          {failed && <p className="text-sm text-destructive">Something went wrong. Please refresh the page.</p>}
          {!failed && branches === null && <p className="text-sm text-muted-foreground">Loading...</p>}
          {branches?.length === 0 && (
            <p className="text-sm text-muted-foreground">Online booking isn’t available right now. Please call the clinic.</p>
          )}
          {branches?.map((branch) => (
            <Link
              key={branch.id}
              href={`/book/${branch.slug}`}
              className="flex items-center justify-between gap-3 rounded-xl border border-border p-4 transition-colors hover:border-primary/50 hover:bg-primary/5"
            >
              <span className="min-w-0">
                <span className="block font-semibold text-foreground">{branch.name}</span>
                {(branch.address || branch.city) && (
                  <span className="mt-0.5 flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="size-3.5 shrink-0" />
                    <span className="truncate">{branch.address || branch.city}</span>
                  </span>
                )}
              </span>
              <ChevronRight className="size-5 shrink-0 text-muted-foreground" />
            </Link>
          ))}
        </div>
      </div>
    </BookingShell>
  );
}
