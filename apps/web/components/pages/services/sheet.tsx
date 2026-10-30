'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import type { ServiceFormData } from './types';

interface ServiceFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingId: string | null;
  formData: ServiceFormData;
  onFormDataChange: (formData: ServiceFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting?: boolean;
  categories: string[];
}

export function ServiceFormSheet({
  open,
  onOpenChange,
  editingId,
  formData,
  onFormDataChange,
  onSubmit,
  isSubmitting,
  categories,
}: ServiceFormSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{editingId ? 'Edit Service' : 'Add Service'}</SheetTitle>
        </SheetHeader>
        <form onSubmit={onSubmit} className="space-y-4 px-4 pb-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Name</label>
            <Input
              type="text"
              required
              value={formData.name}
              onChange={(e) => onFormDataChange({ ...formData, name: e.target.value })}
              placeholder="e.g. HydraFacial Glow"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Category</label>
            <Input
              type="text"
              required
              list="service-categories"
              value={formData.category}
              onChange={(e) => onFormDataChange({ ...formData, category: e.target.value })}
              placeholder="Pick an existing category or type a new one"
            />
            <datalist id="service-categories">
              {categories.map((category) => (
                <option key={category} value={category} />
              ))}
            </datalist>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Price (Rs)</label>
            <Input
              type="number"
              min={0}
              value={formData.price || ''}
              onChange={(e) => onFormDataChange({ ...formData, price: Number(e.target.value) })}
              placeholder="0"
            />
            <p className="mt-1 text-xs text-muted-foreground">Leave at 0 for price on application (POA).</p>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Note <span className="font-normal text-muted-foreground">(optional)</span>
            </label>
            <Input
              type="text"
              value={formData.note}
              onChange={(e) => onFormDataChange({ ...formData, note: e.target.value })}
              placeholder="e.g. Package: 5 sessions in 30,000"
            />
          </div>

          <div className="space-y-3 rounded-xl border border-border p-4">
            <label className="flex items-start justify-between gap-3">
              <span>
                <span className="block text-sm font-medium text-foreground">Available</span>
                <span className="block text-xs text-muted-foreground">Can be added to bills.</span>
              </span>
              <Switch
                checked={formData.isActive}
                onCheckedChange={(checked) => onFormDataChange({ ...formData, isActive: checked })}
              />
            </label>
            <label className="flex items-start justify-between gap-3">
              <span>
                <span className="block text-sm font-medium text-foreground">Show on booking page</span>
                <span className="block text-xs text-muted-foreground">Clients can pick it when booking online.</span>
              </span>
              <Switch
                checked={formData.showOnline}
                onCheckedChange={(checked) => onFormDataChange({ ...formData, showOnline: checked })}
              />
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : editingId ? 'Update Service' : 'Add Service'}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
