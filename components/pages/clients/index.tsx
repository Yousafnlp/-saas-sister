'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { api, ApiError } from '@/lib/api';
import { toDateOnly } from '@/lib/date-utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/page-header';
import { StatCard } from '@/components/stat-card';
import DataTable from '@/components/data-table';
import { Plus, Search, Users } from 'lucide-react';
import { ClientFormSheet, Client, emptyClient } from './sheet';
import { getClientColumns } from './column';

interface ClientListResponse {
  success: boolean;
  data: Client[];
}

interface ClientResponse {
  success: boolean;
  data: Client;
}

function normalize(client: Client): Client {
  return { ...client, date: toDateOnly(client.date), nextVisit: toDateOnly(client.nextVisit) };
}

export default function Clients() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showSheet, setShowSheet] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<Client, 'id'>>(emptyClient);

  useEffect(() => {
    let cancelled = false;

    api
      .get<ClientListResponse>('/clients?limit=100')
      .then((res) => {
        if (cancelled) return;
        setClients(res.data.map(normalize));
      })
      .catch((err) => {
        toast.error(err instanceof ApiError ? err.message : 'Failed to load clients');
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.concern.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddClick = () => {
    setEditingId(null);
    setFormData(emptyClient);
    setShowSheet(true);
  };

  const handleViewClick = (client: Client) => {
    router.push(`/clients/${client.id}`);
  };

  const handleEditClick = (client: Client) => {
    setEditingId(client.id);
    setFormData(client);
    setShowSheet(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this client?')) return;

    try {
      await api.delete(`/clients/${id}`);
      setClients(clients.filter(client => client.id !== id));
      toast.success('Client deleted');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to delete client');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingId) {
        const res = await api.put<ClientResponse>(`/clients/${editingId}`, formData);
        setClients(clients.map(client => client.id === editingId ? normalize(res.data) : client));
        toast.success('Client updated');
      } else {
        const res = await api.post<ClientResponse>('/clients', formData);
        setClients([...clients, normalize(res.data)]);
        toast.success('Client added');
      }
      setShowSheet(false);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to save client');
    }
  };

  const columns = getClientColumns({
    onView: handleViewClick,
    onEdit: handleEditClick,
    onDelete: handleDelete,
  });

  return (
    <div className="min-h-screen space-y-6 bg-background p-4 md:p-8">
      <PageHeader
        title="Clients"
        description="Manage client records and upcoming visits."
        actions={
          <>
            <div className="relative w-full sm:w-64">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by name or concern"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button className="gap-2 whitespace-nowrap" onClick={handleAddClick}>
              <Plus className="size-4" /> Add Client
            </Button>
          </>
        }
      />

      {/* Table */}
      <DataTable
        columns={columns}
        data={filteredClients}
        emptyMessage={isLoading ? 'Loading clients...' : 'No clients found matching your search'}
      />

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        <StatCard icon={Users} label="Total Clients" value={clients.length} />
      </div>

      {/* Add/Edit Client Sheet */}
      <ClientFormSheet
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
