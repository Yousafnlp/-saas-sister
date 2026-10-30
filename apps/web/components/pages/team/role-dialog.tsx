'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { PERMISSION_GROUPS, normalizePermissions, withoutPermission, type Permission } from '@daesthetics/shared';
import { api, ApiError } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { Role, RoleResponse } from './types';

interface RoleDialogProps {
  open: boolean;
  /** The role being edited, or null to create a new one. */
  role: Role | null;
  onOpenChange: (open: boolean) => void;
  /** previousName is set when an existing role was saved, so a rename can be applied to members. */
  onSaved: (role: Role, previousName?: string) => void;
}

export function RoleDialog({ open, role, onOpenChange, onSaved }: RoleDialogProps) {
  const [name, setName] = useState('');
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setName(role?.name ?? '');
    setPermissions(role?.permissions ?? []);
  }, [open, role]);

  const toggle = (key: Permission, checked: boolean) =>
    setPermissions((prev) => (checked ? normalizePermissions([...prev, key]) : withoutPermission(prev, key)));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = role
        ? await api.put<RoleResponse>(`/roles/${encodeURIComponent(role.name)}`, { name, permissions })
        : await api.post<RoleResponse>('/roles', { name, permissions });
      onSaved(res.data, role?.name);
      toast.success(role ? `${res.data.name} updated` : `${res.data.name} role created`);
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to save role');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{role ? `Edit ${role.name}` : 'New role'}</DialogTitle>
          <DialogDescription>
            Everyone can see the dashboard. Pick what else people with this role can use.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="role-name" className="mb-1.5 block text-sm font-medium text-foreground">
              Name
            </label>
            <Input
              id="role-name"
              required
              maxLength={40}
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={role?.builtIn}
              placeholder="e.g. Receptionist"
            />
            {role?.builtIn && <p className="mt-1 text-xs text-muted-foreground">Built-in roles keep their name.</p>}
          </div>

          {PERMISSION_GROUPS.map((group) => (
            <fieldset key={group.label} className="space-y-1">
              <legend className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {group.label}
              </legend>
              {group.permissions.map((permission) => {
                const id = `permission-${permission.key}`;
                return (
                  <label
                    key={permission.key}
                    htmlFor={id}
                    className="-mx-2 flex cursor-pointer items-start gap-3 rounded-lg px-2 py-2 hover:bg-muted/50"
                  >
                    <Checkbox
                      id={id}
                      className="mt-0.5"
                      checked={permissions.includes(permission.key)}
                      onCheckedChange={(checked) => toggle(permission.key, checked === true)}
                    />
                    <span className="min-w-0">
                      <span className="block text-sm font-medium text-foreground">{permission.label}</span>
                      <span className="block text-xs text-muted-foreground">{permission.description}</span>
                    </span>
                  </label>
                );
              })}
            </fieldset>
          ))}

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : role ? 'Save changes' : 'Create role'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
