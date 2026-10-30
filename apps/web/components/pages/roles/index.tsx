'use client';

import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Plus, ShieldCheck } from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/empty-state';
import { RoleDialog } from '@/components/pages/team/role-dialog';
import { RolesMatrix } from '@/components/pages/team/roles-matrix';
import type { Role } from '@/components/pages/team/types';

interface Member {
  id: string;
  role: string;
}

export default function Roles() {
  const { userRole } = useAuth();
  const [roles, setRoles] = useState<Role[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  // undefined: dialog closed, null: creating a new role.
  const [editingRole, setEditingRole] = useState<Role | null | undefined>(undefined);

  const memberCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const member of members) counts[member.role] = (counts[member.role] ?? 0) + 1;
    return counts;
  }, [members]);

  useEffect(() => {
    if (userRole !== 'Admin') return;
    let cancelled = false;

    Promise.all([api.get<{ data: Role[] }>('/roles'), api.get<{ data: Member[] }>('/users?limit=100')])
      .then(([rolesRes, usersRes]) => {
        if (cancelled) return;
        setRoles(rolesRes.data);
        setMembers(usersRes.data);
      })
      .catch((err) => toast.error(err instanceof ApiError ? err.message : 'Failed to load roles'))
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [userRole]);

  if (userRole !== 'Admin') {
    return (
      <div className="p-3">
        <EmptyState icon={ShieldCheck} title="Admins only" description="Ask an Admin to change roles and permissions." />
      </div>
    );
  }

  const handleRoleSaved = (role: Role, previousName?: string) => {
    if (previousName === undefined) {
      setRoles((prev) => [...prev, role]);
      return;
    }
    setRoles((prev) => prev.map((r) => (r.name === previousName ? role : r)));
    if (previousName !== role.name) {
      setMembers((prev) => prev.map((m) => (m.role === previousName ? { ...m, role: role.name } : m)));
    }
  };

  const handleDeleteRole = async (role: Role) => {
    if (!confirm(`Delete the ${role.name} role?`)) return;
    try {
      await api.delete(`/roles/${encodeURIComponent(role.name)}`);
      setRoles((prev) => prev.filter((r) => r.name !== role.name));
      toast.success(`${role.name} role deleted`);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to delete role');
    }
  };

  return (
    <div className="min-h-full bg-card">
      <div className="flex flex-col gap-3 border-b border-border p-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="min-w-0 text-sm text-muted-foreground">
          Everyone can see the dashboard. Only Admins can manage the team and roles.
        </p>
        <Button className="gap-2 whitespace-nowrap" onClick={() => setEditingRole(null)}>
          <Plus className="size-4" /> New role
        </Button>
      </div>

      {roles.length > 0 ? (
        <RolesMatrix roles={roles} memberCounts={memberCounts} onEdit={setEditingRole} onDelete={handleDeleteRole} />
      ) : (
        <p className="p-3 text-sm text-muted-foreground">{isLoading ? 'Loading roles...' : 'No roles found'}</p>
      )}

      <RoleDialog
        open={editingRole !== undefined}
        role={editingRole ?? null}
        onOpenChange={(open) => !open && setEditingRole(undefined)}
        onSaved={handleRoleSaved}
      />
    </div>
  );
}
