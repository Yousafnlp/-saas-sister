'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export interface Branch {
  id: string;
  name: string;
  slug: string;
  city: string;
  address: string;
  phone: string;
  openingTime: string;
  closingTime: string;
  workingDays: string[];
  slotMinutes: number;
  slotCapacity: number;
  bookingEnabled: boolean;
  isActive: boolean;
}

export interface BranchListResponse {
  success: boolean;
  data: Branch[];
}

/** Public booking URL for a branch, e.g. https://app.example.com/book/lahore */
export function bookingUrl(slug?: string) {
  const origin = typeof window === 'undefined' ? '' : window.location.origin;
  return slug ? `${origin}/book/${slug}` : `${origin}/book`;
}

/** Loads all branches once. Failures leave the list empty: branches are optional everywhere they're used. */
export function useBranches() {
  const [branches, setBranches] = useState<Branch[]>([]);

  useEffect(() => {
    let cancelled = false;
    api
      .get<BranchListResponse>('/branches?limit=100&sort=name')
      .then((res) => {
        if (!cancelled) setBranches(res.data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  return branches;
}
