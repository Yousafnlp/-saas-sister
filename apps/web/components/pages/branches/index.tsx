'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Building2, Clock, Copy, Edit, ExternalLink, Link2, MapPin, Phone, Plus, Trash2 } from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { bookingUrl, type Branch, type BranchListResponse } from '@/lib/branches';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/empty-state';
import { StatusBadge } from '@/components/status-badge';
import { BranchFormSheet, emptyBranch, type BranchFormData } from './sheet';

interface BranchResponse {
  success: boolean;
  data: Branch;
}

const formatTime = (time: string) => format(new Date(`2000-01-01T${time}`), 'h:mm a');

async function copyLink(url: string) {
  try {
    await navigator.clipboard.writeText(url);
    toast.success('Booking link copied');
  } catch {
    toast.error('Could not copy. Select the link and copy it manually.');
  }
}

export default function Branches() {
  const { can } = useAuth();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showSheet, setShowSheet] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<BranchFormData>(emptyBranch);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    api
      .get<BranchListResponse>('/branches?limit=100&sort=name')
      .then((res) => {
        if (!cancelled) setBranches(res.data);
      })
      .catch((err) => toast.error(err instanceof ApiError ? err.message : 'Failed to load branches'))
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!can('branches')) {
    return (
      <div className="p-3">
        <EmptyState icon={Building2} title="No access" description="Your role can't manage branches. Ask an Admin if you need it." />
      </div>
    );
  }

  const handleAddClick = () => {
    setEditingId(null);
    setFormData(emptyBranch);
    setShowSheet(true);
  };

  const handleEditClick = (branch: Branch) => {
    setEditingId(branch.id);
    setFormData(
      Object.fromEntries(Object.keys(emptyBranch).map((key) => [key, branch[key as keyof BranchFormData]])) as BranchFormData,
    );
    setShowSheet(true);
  };

  const handleDelete = async (branch: Branch) => {
    if (
      !confirm(
        `Delete ${branch.name}? Its booking link stops working. Past appointments stay, but will no longer show a branch. To pause bookings instead, edit the branch and turn off online bookings.`,
      )
    ) {
      return;
    }

    try {
      await api.delete(`/branches/${branch.id}`);
      setBranches((prev) => prev.filter((b) => b.id !== branch.id));
      toast.success('Branch deleted');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to delete branch');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.workingDays.length === 0) {
      toast.error('Pick at least one day the branch is open.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingId) {
        const res = await api.put<BranchResponse>(`/branches/${editingId}`, formData);
        setBranches((prev) => prev.map((b) => (b.id === editingId ? res.data : b)));
        toast.success('Branch updated');
      } else {
        const res = await api.post<BranchResponse>('/branches', formData);
        setBranches((prev) => [...prev, res.data].sort((a, b) => a.name.localeCompare(b.name)));
        toast.success('Branch added');
      }
      setShowSheet(false);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to save branch');
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasBookableBranch = branches.some((b) => b.isActive && b.bookingEnabled);

  return (
    <div className="min-h-full bg-card">
      <div className="flex items-center gap-3 border-b border-border p-3">
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{branches.length}</span> {branches.length === 1 ? 'branch' : 'branches'}
        </p>
        <Button className="ml-auto gap-2 whitespace-nowrap" onClick={handleAddClick}>
          <Plus className="size-4" /> Add Branch
        </Button>
      </div>

      {hasBookableBranch && (
        <div className="flex flex-col gap-3 border-b border-border p-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground">Main booking link</p>
            <p className="text-sm text-muted-foreground">
              Put this in your Instagram bio. Clients pick a branch, then book.
            </p>
            <p className="mt-1 break-all font-mono text-xs text-primary">{bookingUrl()}</p>
          </div>
          <div className="flex shrink-0 gap-2">
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => copyLink(bookingUrl())}>
              <Copy className="size-4" /> Copy
            </Button>
            <Button asChild variant="outline" size="sm" className="gap-1.5">
              <a href={bookingUrl()} target="_blank" rel="noreferrer">
                <ExternalLink className="size-4" /> Open
              </a>
            </Button>
          </div>
        </div>
      )}

      {isLoading ? (
        <p className="p-3 text-sm text-muted-foreground">Loading branches...</p>
      ) : branches.length === 0 ? (
        <EmptyState
          bordered={false}
          icon={Building2}
          title="No branches yet"
          description="Add your first branch to get an online booking link."
        />
      ) : (
        <div className="grid grid-cols-1 gap-3 p-3 lg:grid-cols-2 2xl:grid-cols-3">
          {branches.map((branch) => {
            const link = bookingUrl(branch.slug);
            const live = branch.isActive && branch.bookingEnabled;
            return (
              <div key={branch.id} className="flex flex-col rounded-xl border border-border bg-card p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate text-base font-semibold text-foreground">{branch.name}</h3>
                    {branch.city && <p className="text-sm text-muted-foreground">{branch.city}</p>}
                  </div>
                  <StatusBadge
                    label={!branch.isActive ? 'Closed' : branch.bookingEnabled ? 'Taking bookings' : 'Bookings paused'}
                    tone={!branch.isActive ? 'neutral' : branch.bookingEnabled ? 'success' : 'warning'}
                  />
                </div>

                <dl className="mt-3 space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-start gap-2">
                    <Clock className="mt-0.5 size-4 shrink-0" />
                    <dd>
                      {formatTime(branch.openingTime)} – {formatTime(branch.closingTime)} ·{' '}
                      {branch.workingDays.join(', ')}
                      <span className="block text-xs">
                        {branch.slotMinutes}-minute slots · {branch.slotCapacity} client{branch.slotCapacity === 1 ? '' : 's'} per slot
                      </span>
                    </dd>
                  </div>
                  {branch.address && (
                    <div className="flex items-start gap-2">
                      <MapPin className="mt-0.5 size-4 shrink-0" />
                      <dd>{branch.address}</dd>
                    </div>
                  )}
                  {branch.phone && (
                    <div className="flex items-start gap-2">
                      <Phone className="mt-0.5 size-4 shrink-0" />
                      <dd>{branch.phone}</dd>
                    </div>
                  )}
                </dl>

                <div className="mt-3 rounded-lg bg-muted/50 p-3">
                  <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    <Link2 className="size-3.5" /> Booking link
                  </p>
                  <p className={live ? 'mt-1 break-all font-mono text-xs text-foreground' : 'mt-1 break-all font-mono text-xs text-muted-foreground line-through'}>
                    {link}
                  </p>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border pt-3">
                  <Button variant="outline" size="sm" className="gap-1.5" onClick={() => copyLink(link)} disabled={!live}>
                    <Copy className="size-4" /> Copy link
                  </Button>
                  {live && (
                    <Button asChild variant="outline" size="sm" className="gap-1.5">
                      <a href={link} target="_blank" rel="noreferrer">
                        <ExternalLink className="size-4" /> Open
                      </a>
                    </Button>
                  )}
                  <div className="ml-auto flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="text-muted-foreground hover:text-foreground"
                      onClick={() => handleEditClick(branch)}
                      aria-label={`Edit ${branch.name}`}
                      title={`Edit ${branch.name}`}
                    >
                      <Edit className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => handleDelete(branch)}
                      aria-label={`Delete ${branch.name}`}
                      title={`Delete ${branch.name}`}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <BranchFormSheet
        open={showSheet}
        onOpenChange={setShowSheet}
        editingId={editingId}
        formData={formData}
        onFormDataChange={setFormData}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
