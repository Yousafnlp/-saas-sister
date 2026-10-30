'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Plus } from 'lucide-react';
import { api } from '@/lib/api';
import {
  formatServicePrice,
  groupByCategory,
  type Service,
  type ServiceListResponse,
} from '@/components/pages/services/types';
import type { BillItem } from './types';

interface ServicePickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (item: BillItem) => void;
}

export function ServicePicker({ open, onOpenChange, onSelect }: ServicePickerProps) {
  const [query, setQuery] = useState('');
  const [services, setServices] = useState<Service[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');

  // Reload each time the picker opens so price changes made on the Services page show up straight away.
  useEffect(() => {
    if (!open) return;
    let cancelled = false;

    api
      .get<ServiceListResponse>('/services?isActive=true')
      .then((res) => {
        if (cancelled) return;
        setServices(res.data);
        setStatus('ready');
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });

    return () => {
      cancelled = true;
    };
  }, [open]);

  const filteredCategories = useMemo(() => {
    const term = query.trim().toLowerCase();
    const matches = term
      ? services.filter(
          (service) => service.name.toLowerCase().includes(term) || service.category.toLowerCase().includes(term),
        )
      : services;
    return groupByCategory(matches);
  }, [query, services]);

  const handleSelect = (name: string, category: string, price: number) => {
    onSelect({ name, category, price, quantity: 1, lineTotal: price });
    onOpenChange(false);
    setQuery('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] flex-col sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Service</DialogTitle>
        </DialogHeader>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            autoFocus
            placeholder="Search services..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <ScrollArea className="-mx-2 h-[55vh] px-2">
          <div className="space-y-4 pb-2">
            {status === 'loading' && services.length === 0 && (
              <p className="py-8 text-center text-sm text-muted-foreground">Loading services...</p>
            )}
            {status === 'error' && (
              <p className="py-8 text-center text-sm text-muted-foreground">Couldn&apos;t load the price list. Close and try again.</p>
            )}
            {status === 'ready' && services.length === 0 && (
              <p className="py-8 text-center text-sm text-muted-foreground">
                The price list is empty. Add services on the{' '}
                <Link href="/services" className="font-medium text-primary hover:underline">
                  Services &amp; Prices
                </Link>{' '}
                page.
              </p>
            )}
            {status === 'ready' && services.length > 0 && filteredCategories.length === 0 && (
              <p className="py-8 text-center text-sm text-muted-foreground">No services match your search.</p>
            )}
            {filteredCategories.map((category) => (
              <div key={category.category}>
                <h4 className="mb-1.5 px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {category.category}
                </h4>
                <div className="space-y-1">
                  {category.services.map((service) => (
                    <button
                      key={service.id}
                      type="button"
                      onClick={() => handleSelect(service.name, service.category, service.price)}
                      className="flex w-full items-center justify-between gap-3 rounded-lg border border-transparent px-2.5 py-2 text-left transition-colors hover:border-border hover:bg-muted/60"
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium text-foreground">{service.name}</span>
                        {service.note && (
                          <span className="block truncate text-xs text-muted-foreground">{service.note}</span>
                        )}
                      </span>
                      <span className="flex shrink-0 items-center gap-2">
                        <span className="text-sm font-semibold tabular-nums text-foreground">
                          {formatServicePrice(service.price)}
                        </span>
                        <Plus className="size-4 text-primary" />
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        <Button
          type="button"
          variant="outline"
          className="gap-2"
          onClick={() => handleSelect('Custom Service', 'Custom', 0)}
        >
          <Plus className="size-4" /> Add Custom Item
        </Button>
      </DialogContent>
    </Dialog>
  );
}
