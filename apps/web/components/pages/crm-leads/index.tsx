'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { api, ApiError } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import DataTable from '@/components/data-table';
import { LEAD_CATEGORY_OPTIONS } from '@/lib/select-options';
import { CalendarClock, Plus, Search } from 'lucide-react';
import { LeadFormSheet, Lead, emptyLead } from './sheet';
import { getLeadColumns } from './column';

interface LeadListResponse {
  success: boolean;
  data: Lead[];
}

interface LeadResponse {
  success: boolean;
  data: Lead;
}

export default function CRMLeads() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showSheet, setShowSheet] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState(emptyLead);

  useEffect(() => {
    let cancelled = false;

    api
      .get<LeadListResponse>('/leads?limit=100')
      .then((res) => {
        if (cancelled) return;
        setLeads(res.data);
      })
      .catch((err) => {
        toast.error(err instanceof ApiError ? err.message : 'Failed to load leads');
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.number.includes(searchQuery);
    const matchesCategory = categoryFilter === 'all' || lead.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleAddClick = () => {
    setEditingId(null);
    setFormData(emptyLead);
    setShowSheet(true);
  };

  const handleEditClick = (lead: Lead) => {
    setEditingId(lead.id);
    setFormData({
      name: lead.name,
      number: lead.number,
      source: lead.source,
      city: lead.city,
      gender: lead.gender,
      category: lead.category,
    });
    setShowSheet(true);
  };

  const handleAddAppointment = (lead: Lead) => {
    const params = new URLSearchParams({
      leadId: lead.id,
      name: lead.name,
      number: lead.number,
    });
    router.push(`/appointments/new?${params.toString()}`);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this lead?')) return;

    try {
      await api.delete(`/leads/${id}`);
      setLeads(leads.filter(lead => lead.id !== id));
      toast.success('Lead deleted');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to delete lead');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingId) {
        const res = await api.put<LeadResponse>(`/leads/${editingId}`, formData);
        setLeads(leads.map(lead => lead.id === editingId ? res.data : lead));
        toast.success('Lead updated');
      } else {
        const res = await api.post<LeadResponse>('/leads', formData);
        setLeads([...leads, res.data]);
        toast.success('Lead added');
      }
      setShowSheet(false);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to save lead');
    }
  };

  const columns = getLeadColumns({
    onEdit: handleEditClick,
    onDelete: handleDelete,
    onAddAppointment: handleAddAppointment,
  });

  return (
    <div className="min-h-full bg-card">
      <DataTable
        flush
        columns={columns}
        data={filteredLeads}
        emptyMessage={isLoading ? 'Loading leads...' : 'No leads found matching your search'}
        toolbar={
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative sm:w-72">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by name or number"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-44" aria-label="Filter by category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {LEAD_CATEGORY_OPTIONS.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex gap-3 sm:ml-auto">
              <Button
                variant="outline"
                onClick={() => router.push('/appointments')}
                className="flex-1 gap-2 whitespace-nowrap sm:flex-none"
              >
                <CalendarClock className="size-4" /> Appointments
              </Button>
              <Button onClick={handleAddClick} className="flex-1 gap-2 whitespace-nowrap sm:flex-none">
                <Plus className="size-4" /> Add Lead
              </Button>
            </div>
          </div>
        }
        footer={
          <>
            Showing <span className="font-medium text-foreground">{filteredLeads.length}</span> of {leads.length} leads
          </>
        }
      />

      {/* Add/Edit Lead Sheet */}
      <LeadFormSheet
        open={showSheet}
        onOpenChange={setShowSheet}
        editingId={editingId}
        formData={formData}
        onFormDataChange={setFormData}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
