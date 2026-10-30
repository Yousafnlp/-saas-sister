'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import FormSelect from '@/components/form-select';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { LEAD_SOURCE_OPTIONS, CITY_OPTIONS, GENDER_OPTIONS, LEAD_CATEGORY_OPTIONS } from '@/lib/select-options';

export interface Lead {
  id: string;
  name: string;
  number: string;
  source: string;
  city: string;
  gender: string;
  category: string;
  createdAt: string;
}

export type LeadFormData = Omit<Lead, 'id' | 'createdAt'>;

export const emptyLead: LeadFormData = {
  name: '',
  number: '',
  source: LEAD_SOURCE_OPTIONS[0],
  city: CITY_OPTIONS[0],
  gender: GENDER_OPTIONS[0],
  category: LEAD_CATEGORY_OPTIONS[0],
};

interface LeadFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingId: string | null;
  formData: LeadFormData;
  onFormDataChange: (formData: LeadFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function LeadFormSheet({ open, onOpenChange, editingId, formData, onFormDataChange, onSubmit }: LeadFormSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{editingId ? 'Edit Lead' : 'Add Lead'}</SheetTitle>
        </SheetHeader>
        <form onSubmit={onSubmit} className="space-y-4 px-4 pb-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Name</label>
            <Input
              type="text"
              required
              value={formData.name}
              onChange={(e) => onFormDataChange({ ...formData, name: e.target.value })}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Number</label>
            <Input
              type="tel"
              required
              value={formData.number}
              onChange={(e) => onFormDataChange({ ...formData, number: e.target.value })}
              placeholder="0300-1234567"
            />
          </div>
          <FormSelect
            label="Source"
            value={formData.source}
            onChange={(value) => onFormDataChange({ ...formData, source: value })}
            options={LEAD_SOURCE_OPTIONS}
          />
          <FormSelect
            label="City"
            value={formData.city}
            onChange={(value) => onFormDataChange({ ...formData, city: value })}
            options={CITY_OPTIONS}
          />
          <FormSelect
            label="Gender"
            value={formData.gender}
            onChange={(value) => onFormDataChange({ ...formData, gender: value })}
            options={GENDER_OPTIONS}
          />
          <FormSelect
            label="Category"
            value={formData.category}
            onChange={(value) => onFormDataChange({ ...formData, category: value })}
            options={LEAD_CATEGORY_OPTIONS}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              {editingId ? 'Update Lead' : 'Add Lead'}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
