'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Check, Copy, MessageCircle } from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import FormSelect from '@/components/form-select';
import { describeRole, type Role } from './types';

export interface Invite {
  id: string;
  email: string;
  name: string;
  role: string;
  expiresAt: string;
  createdAt: string;
  invitedBy: { id: string; name: string; email: string } | null;
}

export interface InviteResponse {
  success: boolean;
  token: string;
  data: Invite;
}

export function inviteUrl(token: string) {
  return `${window.location.origin}/invite/${token}`;
}

/** Shows a freshly issued invite link with copy and WhatsApp share buttons. */
export function InviteLink({ invite, token }: { invite: Invite; token: string }) {
  const [copied, setCopied] = useState(false);
  const link = inviteUrl(token);
  const message = `Hi${invite.name ? ` ${invite.name}` : ''}! You've been invited to join d.Aesthetics as ${invite.role}. Set up your account here: ${link}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Could not copy. Select the link and copy it manually.');
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-muted/50 p-3">
        <p className="text-xs font-medium text-muted-foreground">
          Invite for {invite.email} · {invite.role}
        </p>
        <p className="mt-1 select-all break-all font-mono text-xs text-foreground">{link}</p>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button type="button" className="flex-1 gap-2" onClick={handleCopy}>
          {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
          {copied ? 'Copied' : 'Copy link'}
        </Button>
        <Button asChild type="button" variant="outline" className="flex-1 gap-2">
          <a href={`https://wa.me/?text=${encodeURIComponent(message)}`} target="_blank" rel="noreferrer">
            <MessageCircle className="size-4" /> Share on WhatsApp
          </a>
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        The link works once and expires in 7 days. For security it is only shown now. If it gets lost, use
        &quot;New link&quot; in the pending invites list.
      </p>
    </div>
  );
}

interface InviteDialogProps {
  open: boolean;
  roles: Role[];
  onOpenChange: (open: boolean) => void;
  onInvited: (invite: Invite) => void;
}

export function InviteDialog({ open, roles, onOpenChange, onInvited }: InviteDialogProps) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('Staff');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{ invite: Invite; token: string } | null>(null);

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setEmail('');
      setName('');
      setRole('Staff');
      setResult(null);
    }
    onOpenChange(next);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await api.post<InviteResponse>('/invites', { email, name, role });
      setResult({ invite: res.data, token: res.token });
      onInvited(res.data);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to create invite');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{result ? 'Invite link ready' : 'Invite a team member'}</DialogTitle>
          <DialogDescription>
            {result
              ? 'Send this link to them. They open it, choose a password, and they’re in.'
              : 'You’ll get a link to send them on WhatsApp or anywhere else.'}
          </DialogDescription>
        </DialogHeader>

        {result ? (
          <div className="space-y-4">
            <InviteLink invite={result.invite} token={result.token} />
            <div className="flex justify-end">
              <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                Done
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Email</label>
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
              />
              <p className="mt-1 text-xs text-muted-foreground">They’ll use this to sign in.</p>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Name <span className="font-normal text-muted-foreground">(optional)</span>
              </label>
              <Input type="text" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <FormSelect label="Role" value={role} onChange={setRole} options={roles.map((r) => r.name)} />
              <p className="mt-1 text-xs text-muted-foreground">{describeRole(roles.find((r) => r.name === role))}</p>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Create invite link'}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
