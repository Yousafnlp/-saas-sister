'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { RefreshCw, Trash2, UserPlus, Users } from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { toDateOnly } from '@/lib/date-utils';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { EmptyState } from '@/components/empty-state';
import { StatusBadge } from '@/components/status-badge';
import { StatusSelect } from '@/components/status-select';
import DataTable, { type DataTableColumn } from '@/components/data-table';
import { InviteDialog, InviteLink, type Invite, type InviteResponse } from './invite-dialog';
import { ROLE_TONE, type Role } from './types';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

interface UserResponse {
  success: boolean;
  data: User;
}

const formatDate = (value: string) => format(new Date(`${toDateOnly(value)}T00:00:00`), 'MMM d, yyyy');

export default function Team() {
  const { userRole, userEmail } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [newLink, setNewLink] = useState<{ invite: Invite; token: string } | null>(null);

  useEffect(() => {
    if (userRole !== 'Admin') return;
    let cancelled = false;

    Promise.all([
      api.get<{ data: User[] }>('/users?limit=100&sort=name'),
      api.get<{ data: Invite[] }>('/invites'),
      api.get<{ data: Role[] }>('/roles'),
    ])
      .then(([usersRes, invitesRes, rolesRes]) => {
        if (cancelled) return;
        setUsers(usersRes.data);
        setInvites(invitesRes.data);
        setRoles(rolesRes.data);
      })
      .catch((err) => toast.error(err instanceof ApiError ? err.message : 'Failed to load team'))
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
        <EmptyState icon={Users} title="Admins only" description="Ask an Admin to invite people or change roles." />
      </div>
    );
  }

  const updateUser = async (user: User, changes: Partial<Pick<User, 'role' | 'isActive'>>, message: string) => {
    try {
      const res = await api.patch<UserResponse>(`/users/${user.id}`, changes);
      setUsers((prev) => prev.map((u) => (u.id === user.id ? res.data : u)));
      toast.success(message);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to update user');
    }
  };

  const handleRemoveUser = async (user: User) => {
    if (!confirm(`Remove ${user.name}'s account? They will no longer be able to sign in. To block access temporarily, switch them to inactive instead.`)) {
      return;
    }
    try {
      await api.delete(`/users/${user.id}`);
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
      toast.success('Account removed');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to remove account');
    }
  };

  const handleNewLink = async (invite: Invite) => {
    try {
      const res = await api.post<InviteResponse>(`/invites/${invite.id}/regenerate`);
      setInvites((prev) => prev.map((i) => (i.id === invite.id ? res.data : i)));
      setNewLink({ invite: res.data, token: res.token });
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to create a new link');
    }
  };

  const handleRevoke = async (invite: Invite) => {
    if (!confirm(`Cancel the invite for ${invite.email}? Their link will stop working.`)) return;
    try {
      await api.delete(`/invites/${invite.id}`);
      setInvites((prev) => prev.filter((i) => i.id !== invite.id));
      toast.success('Invite cancelled');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to cancel invite');
    }
  };

  const userColumns: DataTableColumn<User>[] = [
    {
      key: 'name',
      label: 'Name',
      render: (value: string, user) => (
        <div className="min-w-0">
          <p className="font-medium text-foreground">
            {value}
            {user.email === userEmail && <span className="ml-2 text-xs font-normal text-muted-foreground">(you)</span>}
          </p>
          <p className="truncate text-xs text-muted-foreground">{user.email}</p>
        </div>
      ),
    },
    {
      key: 'role',
      label: 'Role',
      render: (value: string, user) => (
        <StatusSelect
          value={value}
          options={roles.length > 0 ? roles.map((r) => r.name) : [value]}
          toneMap={ROLE_TONE}
          disabled={user.email === userEmail}
          onChange={(role) => updateUser(user, { role }, `${user.name} is now ${role}`)}
          aria-label={`Role for ${user.name}`}
        />
      ),
    },
    {
      key: 'isActive',
      label: 'Can sign in',
      align: 'center',
      render: (value: boolean, user) => (
        <Switch
          checked={value}
          disabled={user.email === userEmail}
          onCheckedChange={(isActive) =>
            updateUser(user, { isActive }, isActive ? `${user.name} can sign in again` : `${user.name} can no longer sign in`)
          }
          aria-label={`Allow ${user.name} to sign in`}
        />
      ),
    },
    { key: 'createdAt', label: 'Joined', hideBelow: 'md', render: (value: string) => formatDate(value) },
    {
      key: 'actions',
      label: 'Actions',
      align: 'right',
      render: (_value, user) =>
        user.email === userEmail ? null : (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="text-muted-foreground hover:text-destructive"
            onClick={() => handleRemoveUser(user)}
            aria-label={`Remove ${user.name}`}
            title={`Remove ${user.name}`}
          >
            <Trash2 className="size-4" />
          </Button>
        ),
    },
  ];

  const now = new Date().toISOString();
  const inviteColumns: DataTableColumn<Invite>[] = [
    {
      key: 'email',
      label: 'Invited',
      render: (value: string, invite) => (
        <div className="min-w-0">
          <p className="font-medium text-foreground">{invite.name || value}</p>
          {invite.name && <p className="truncate text-xs text-muted-foreground">{value}</p>}
        </div>
      ),
    },
    { key: 'role', label: 'Role', render: (value: string) => <StatusBadge label={value} tone={ROLE_TONE[value] ?? 'neutral'} /> },
    {
      key: 'expiresAt',
      label: 'Status',
      render: (value: string) =>
        value < now ? (
          <StatusBadge label="Expired" tone="danger" />
        ) : (
          <span className="text-xs text-muted-foreground">Link valid until {formatDate(value)}</span>
        ),
    },
    {
      key: 'invitedBy',
      label: 'Invited by',
      hideBelow: 'lg',
      render: (value: Invite['invitedBy']) => value?.name ?? '—',
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'right',
      render: (_value, invite) => (
        <div className="flex items-center justify-end gap-1">
          <Button type="button" variant="ghost" size="sm" className="gap-1.5" onClick={() => handleNewLink(invite)}>
            <RefreshCw className="size-4" /> New link
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="text-muted-foreground hover:text-destructive"
            onClick={() => handleRevoke(invite)}
            aria-label={`Cancel invite for ${invite.email}`}
            title={`Cancel invite for ${invite.email}`}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-full bg-card">
      <DataTable
        flush
        columns={userColumns}
        data={users}
        emptyMessage={isLoading ? 'Loading team...' : 'No accounts yet'}
        toolbar={
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-semibold text-foreground">Members</h2>
            <Button className="ml-auto gap-2 whitespace-nowrap" onClick={() => setShowInvite(true)}>
              <UserPlus className="size-4" /> Invite
            </Button>
          </div>
        }
      />

      {invites.length > 0 && (
        <div className="border-t border-border">
          <DataTable
            flush
            columns={inviteColumns}
            data={invites}
            toolbar={<h2 className="text-sm font-semibold text-foreground">Pending invites</h2>}
          />
        </div>
      )}

      <InviteDialog
        open={showInvite}
        roles={roles}
        onOpenChange={setShowInvite}
        onInvited={(invite) => setInvites((prev) => [invite, ...prev.filter((i) => i.email !== invite.email)])}
      />

      <Dialog open={newLink !== null} onOpenChange={(open) => !open && setNewLink(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>New invite link</DialogTitle>
            <DialogDescription>The previous link for this person no longer works.</DialogDescription>
          </DialogHeader>
          {newLink && <InviteLink invite={newLink.invite} token={newLink.token} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}
