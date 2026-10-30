'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import FormSelect from '@/components/form-select';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ClientSelect, type ClientOption } from '@/components/client-select';
import { DatePicker } from '@/components/date-picker';
import { Plus, Trash2 } from 'lucide-react';
import { BILLING_PAYMENT_METHOD_OPTIONS, BILLING_PAYMENT_STATUS_OPTIONS } from '@/lib/select-options';
import { ServicePicker } from './service-picker';
import { calcSubtotal, calcTotal, type BillFormData, type BillItem } from './types';

export type { ClientOption };

interface BillFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingId: string | null;
  formData: BillFormData;
  onFormDataChange: (formData: BillFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting?: boolean;
  clients: ClientOption[];
}

export function BillFormSheet({
  open,
  onOpenChange,
  editingId,
  formData,
  onFormDataChange,
  onSubmit,
  isSubmitting,
  clients,
}: BillFormSheetProps) {
  const [showPicker, setShowPicker] = useState(false);

  const subtotal = calcSubtotal(formData.items);
  const total = calcTotal(formData.items, formData.discount);
  const due = formData.paymentStatus === 'Paid' ? 0 : Math.max(total - (formData.amountPaid || 0), 0);

  const handleDueChange = (rawDue: number) => {
    const clampedDue = Math.min(Math.max(Number.isNaN(rawDue) ? 0 : rawDue, 0), total);
    const amountPaid = Math.max(total - clampedDue, 0);
    const paymentStatus = clampedDue <= 0 ? 'Paid' : 'Pending';
    onFormDataChange({ ...formData, amountPaid, paymentStatus });
  };

  const updateItem = (index: number, patch: Partial<BillItem>) => {
    const items = formData.items.map((item, i) => {
      if (i !== index) return item;
      const next = { ...item, ...patch };
      next.lineTotal = next.price * next.quantity;
      return next;
    });
    onFormDataChange({ ...formData, items });
  };

  const removeItem = (index: number) => {
    onFormDataChange({ ...formData, items: formData.items.filter((_, i) => i !== index) });
  };

  const addItem = (item: BillItem) => {
    onFormDataChange({ ...formData, items: [...formData.items, item] });
  };
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>{editingId ? 'Edit Bill' : 'New Bill'}</SheetTitle>
        </SheetHeader>
        <form onSubmit={onSubmit} className="space-y-5 px-4 pb-4">
          <ClientSelect
            clients={clients}
            name={formData.clientName}
            number={formData.clientNumber}
            onSelect={(client) =>
              onFormDataChange({ ...formData, clientName: client?.name ?? '', clientNumber: client?.number ?? '' })
            }
            required
          />

          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Date</label>
            <DatePicker
              required
              value={formData.date}
              onChange={(value) => onFormDataChange({ ...formData, date: value })}
            />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="block text-sm font-medium text-foreground">Services</label>
              <Button type="button" size="sm" variant="outline" className="gap-1.5" onClick={() => setShowPicker(true)}>
                <Plus className="size-4" /> Add Service
              </Button>
            </div>

            {formData.items.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                No services added yet.
              </div>
            ) : (
              <div className="space-y-2">
                {formData.items.map((item, index) => (
                  <div key={`${item.name}-${index}`} className="rounded-lg border border-border p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">{item.name}</p>
                        {item.category && <p className="truncate text-xs text-muted-foreground">{item.category}</p>}
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="shrink-0 text-muted-foreground hover:text-destructive"
                        onClick={() => removeItem(index)}
                        aria-label={`Remove ${item.name}`}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                    <div className="mt-2 grid grid-cols-3 gap-2">
                      <div>
                        <label className="mb-1 block text-xs text-muted-foreground">Price</label>
                        <Input
                          type="number"
                          min={0}
                          value={item.price || ''}
                          onChange={(e) => updateItem(index, { price: Number(e.target.value) })}
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs text-muted-foreground">Qty</label>
                        <Input
                          type="number"
                          min={1}
                          value={item.quantity || 1}
                          onChange={(e) => updateItem(index, { quantity: Math.max(1, Number(e.target.value)) })}
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs text-muted-foreground">Line Total</label>
                        <div className="flex h-9 items-center rounded-lg border border-input bg-muted/40 px-3 text-sm tabular-nums text-foreground">
                          {(item.price * item.quantity).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <FormSelect
              label="Payment Method"
              value={formData.paymentMethod}
              onChange={(value) => onFormDataChange({ ...formData, paymentMethod: value })}
              options={BILLING_PAYMENT_METHOD_OPTIONS}
            />
            <FormSelect
              label="Payment Status"
              value={formData.paymentStatus}
              onChange={(value) => onFormDataChange({ ...formData, paymentStatus: value })}
              options={BILLING_PAYMENT_STATUS_OPTIONS}
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Discount</label>
              <Input
                type="number"
                min={0}
                value={formData.discount || ''}
                onChange={(e) => onFormDataChange({ ...formData, discount: Number(e.target.value) })}
                placeholder="0"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Due</label>
              <Input
                type="number"
                min={0}
                max={total}
                value={due || ''}
                onChange={(e) => handleDueChange(Number(e.target.value))}
                placeholder="0"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Notes</label>
            <Textarea
              value={formData.notes}
              onChange={(e) => onFormDataChange({ ...formData, notes: e.target.value })}
              rows={2}
            />
          </div>

          <div className="rounded-xl border border-border bg-muted/40 p-4">
            <div className="space-y-1.5">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Subtotal</span>
                <span className="tabular-nums">Rs {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Discount</span>
                <span className="tabular-nums">-Rs {(formData.discount || 0).toLocaleString()}</span>
              </div>
              <div className="mt-2 flex justify-between border-t border-border pt-2 font-semibold text-foreground">
                <span>Total</span>
                <span className="tabular-nums">Rs {total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm text-success">
                <span>Paid</span>
                <span className="tabular-nums">Rs {(formData.amountPaid || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm text-destructive">
                <span>Due</span>
                <span className="tabular-nums">Rs {due.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || formData.items.length === 0}>
              {isSubmitting ? 'Saving...' : editingId ? 'Update Bill' : 'Create Bill'}
            </Button>
          </div>
        </form>
      </SheetContent>

      <ServicePicker open={showPicker} onOpenChange={setShowPicker} onSelect={addItem} />
    </Sheet>
  );
}
