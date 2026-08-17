'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import FormSelect from '@/components/form-select';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { GENDER_OPTIONS } from '@/lib/select-options';

export interface Client {
  id: string;
  name: string;
  date: string;
  age: number;
  gender: string;
  concern: string;
  nextVisit: string;
}

export const emptyClient: Omit<Client, 'id'> = {
  name: '',
  date: '',
  age: 0,
  gender: GENDER_OPTIONS[0],
  concern: '',
  nextVisit: '',
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
            <label className="mb-1.5 block text-sm font-medium text-foreground">Date</label>
            <Input
              type="date"
              required
              value={formData.date}
              onChange={(e) => onFormDataChange({ ...formData, date: e.target.value })}
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
            <Input
              type="date"
              value={formData.nextVisit}
              onChange={(e) => onFormDataChange({ ...formData, nextVisit: e.target.value })}
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
