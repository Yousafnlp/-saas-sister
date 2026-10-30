'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import FormSelect from '@/components/form-select';
import { bookingUrl, type Branch } from '@/lib/branches';
import { BOOKING_SLOT_MINUTE_OPTIONS, WEEKDAY_OPTIONS } from '@/lib/select-options';

export type BranchFormData = Omit<Branch, 'id'>;

export const emptyBranch: BranchFormData = {
  name: '',
  slug: '',
  city: '',
  address: '',
  phone: '',
  openingTime: '10:00',
  closingTime: '20:00',
  workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  slotMinutes: 30,
  slotCapacity: 1,
  bookingEnabled: true,
  isActive: true,
};

export function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

interface BranchFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingId: string | null;
  formData: BranchFormData;
  onFormDataChange: (formData: BranchFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting?: boolean;
}

export function BranchFormSheet({
  open,
  onOpenChange,
  editingId,
  formData,
  onFormDataChange,
  onSubmit,
  isSubmitting,
}: BranchFormSheetProps) {
  // While adding a branch, the link name follows the branch name until the admin edits it.
  const [slugEdited, setSlugEdited] = useState(false);
  const autoSlug = !editingId && !slugEdited;

  // The parent opens the sheet by setting `open`, so reset here rather than in onOpenChange.
  useEffect(() => {
    if (open) setSlugEdited(false);
  }, [open]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{editingId ? 'Edit Branch' : 'Add Branch'}</SheetTitle>
        </SheetHeader>
        <form onSubmit={onSubmit} className="space-y-5 px-4 pb-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Branch name</label>
            <Input
              type="text"
              required
              value={formData.name}
              onChange={(e) =>
                onFormDataChange({
                  ...formData,
                  name: e.target.value,
                  slug: autoSlug ? slugify(e.target.value) : formData.slug,
                })
              }
              placeholder="e.g. d.Aesthetics Gulberg"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Booking link</label>
            <Input
              type="text"
              required
              pattern="[a-z0-9]+(-[a-z0-9]+)*"
              title="Lowercase letters, numbers and dashes only"
              value={formData.slug}
              onChange={(e) => {
                setSlugEdited(true);
                onFormDataChange({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') });
              }}
              placeholder="gulberg"
            />
            <p className="mt-1 break-all text-xs text-muted-foreground">
              {bookingUrl(formData.slug || 'your-branch')}
              {editingId && ' · changing this breaks links you have already shared'}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">City</label>
              <Input
                type="text"
                value={formData.city}
                onChange={(e) => onFormDataChange({ ...formData, city: e.target.value })}
                placeholder="Lahore"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Phone</label>
              <Input
                type="tel"
                value={formData.phone}
                onChange={(e) => onFormDataChange({ ...formData, phone: e.target.value })}
                placeholder="0300-1234567"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Address</label>
            <Input
              type="text"
              value={formData.address}
              onChange={(e) => onFormDataChange({ ...formData, address: e.target.value })}
              placeholder="Shown to clients on the booking page"
            />
          </div>

          <fieldset className="space-y-4 rounded-xl border border-border p-4">
            <legend className="px-1 text-sm font-semibold text-foreground">Online booking hours</legend>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Opens</label>
                <Input
                  type="time"
                  required
                  value={formData.openingTime}
                  onChange={(e) => onFormDataChange({ ...formData, openingTime: e.target.value })}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Closes</label>
                <Input
                  type="time"
                  required
                  value={formData.closingTime}
                  onChange={(e) => onFormDataChange({ ...formData, closingTime: e.target.value })}
                />
              </div>
            </div>

            <div>
              <span className="mb-1.5 block text-sm font-medium text-foreground">Open on</span>
              <ToggleGroup
                type="multiple"
                variant="outline"
                value={formData.workingDays}
                onValueChange={(days) =>
                  onFormDataChange({
                    ...formData,
                    workingDays: WEEKDAY_OPTIONS.filter((day) => days.includes(day)),
                  })
                }
                className="flex w-full flex-wrap"
                aria-label="Working days"
              >
                {WEEKDAY_OPTIONS.map((day) => (
                  <ToggleGroupItem key={day} value={day} className="flex-1 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
                    {day}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <FormSelect
                label="Slot length"
                value={String(formData.slotMinutes)}
                onChange={(value) => onFormDataChange({ ...formData, slotMinutes: Number(value) })}
                options={BOOKING_SLOT_MINUTE_OPTIONS.map(String)}
              />
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Clients per slot</label>
                <Input
                  type="number"
                  min={1}
                  max={50}
                  required
                  value={formData.slotCapacity}
                  onChange={(e) => onFormDataChange({ ...formData, slotCapacity: Math.max(1, Number(e.target.value)) })}
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Slot length is in minutes. &quot;Clients per slot&quot; is how many online bookings one time slot can take.
            </p>
          </fieldset>

          <div className="space-y-3 rounded-xl border border-border p-4">
            <label className="flex items-start justify-between gap-3">
              <span>
                <span className="block text-sm font-medium text-foreground">Take online bookings</span>
                <span className="block text-xs text-muted-foreground">Turn off to pause this branch&apos;s booking link.</span>
              </span>
              <Switch
                checked={formData.bookingEnabled}
                onCheckedChange={(checked) => onFormDataChange({ ...formData, bookingEnabled: checked })}
              />
            </label>
            <label className="flex items-start justify-between gap-3">
              <span>
                <span className="block text-sm font-medium text-foreground">Branch is open</span>
                <span className="block text-xs text-muted-foreground">Closed branches are hidden from booking.</span>
              </span>
              <Switch
                checked={formData.isActive}
                onCheckedChange={(checked) => onFormDataChange({ ...formData, isActive: checked })}
              />
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : editingId ? 'Update Branch' : 'Add Branch'}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
