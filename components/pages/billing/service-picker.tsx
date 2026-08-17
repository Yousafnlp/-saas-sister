'use client';

import { useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Plus } from 'lucide-react';
import { SERVICE_CATALOG } from '@/lib/services-catalog';
import type { BillItem } from './types';

interface ServicePickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (item: BillItem) => void;
}

export function ServicePicker({ open, onOpenChange, onSelect }: ServicePickerProps) {
  const [query, setQuery] = useState('');

  const filteredCategories = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return SERVICE_CATALOG;

    return SERVICE_CATALOG.map((category) => ({
      category: category.category,
      services: category.services.filter(
        (service) =>
          service.name.toLowerCase().includes(term) ||
          category.category.toLowerCase().includes(term),
      ),
    })).filter((category) => category.services.length > 0);
  }, [query]);

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
            {filteredCategories.length === 0 && (
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
                      key={service.name}
                      type="button"
                      onClick={() => handleSelect(service.name, category.category, service.price)}
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
                          {service.price > 0 ? `Rs ${service.price.toLocaleString()}` : 'POA'}
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
