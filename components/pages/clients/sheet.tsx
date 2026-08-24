'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import FormSelect from '@/components/form-select';
import { DatePicker } from '@/components/date-picker';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { GENDER_OPTIONS } from '@/lib/select-options';

export interface Client {
  id: string;
  name: string;
  number: string;
  date: string;
  age: number;
  gender: string;
  concern: string;
  nextVisit: string;
  treatmentPlan: string;
  treatmentHistory: string;
}

export const emptyClient: Omit<Client, 'id'> = {
  name: '',
  number: '',
  date: '',
  age: 0,
  gender: GENDER_OPTIONS[0],
  concern: '',
  nextVisit: '',
  treatmentPlan: '',
  treatmentHistory: '',
};

interface ClientFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingId: string | null;
  formData: Omit<Client, 'id'>;
  onFormDataChange: (formData: Omit<Client, 'id'>) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function ClientFormSheet({ open, onOpenChange, editingId, formData, onFormDataChange, onSubmit }: ClientFormSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{editingId ? 'Edit Client' : 'Add Client'}</SheetTitle>
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
              value={formData.number}
              onChange={(e) => onFormDataChange({ ...formData, number: e.target.value })}
              placeholder="0300-1234567"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Date</label>
            <DatePicker
              required
              value={formData.date}
              onChange={(value) => onFormDataChange({ ...formData, date: value })}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Age</label>
            <Input
              type="number"
              min={0}
              value={formData.age || ''}
              onChange={(e) => onFormDataChange({ ...formData, age: Number(e.target.value) })}
            />
          </div>
          <FormSelect
            label="Gender"
            value={formData.gender}
            onChange={(value) => onFormDataChange({ ...formData, gender: value })}
            options={GENDER_OPTIONS}
          />
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Concern</label>
            <Textarea
              value={formData.concern}
              onChange={(e) => onFormDataChange({ ...formData, concern: e.target.value })}
              rows={3}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Next Visit</label>
            <DatePicker
              value={formData.nextVisit}
              onChange={(value) => onFormDataChange({ ...formData, nextVisit: value })}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Treatment Plan</label>
            <Textarea
              value={formData.treatmentPlan}
              onChange={(e) => onFormDataChange({ ...formData, treatmentPlan: e.target.value })}
              rows={3}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Treatment History</label>
            <Textarea
              value={formData.treatmentHistory}
              onChange={(e) => onFormDataChange({ ...formData, treatmentHistory: e.target.value })}
              rows={3}
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              {editingId ? 'Update Client' : 'Add Client'}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
