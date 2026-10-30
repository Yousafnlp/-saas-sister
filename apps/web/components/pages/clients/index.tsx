'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { api, ApiError } from '@/lib/api';
import { toDateOnly } from '@/lib/date-utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

  const handleViewBills = (client: Client) => {
    router.push(`/clients/${client.id}/bills`);
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

    const number = formData.number.trim();
    if (number && clients.some((client) => client.id !== editingId && client.number.trim() === number)) {
      toast.error('A client with this number already exists');
      return;
    }

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
    onViewBills: handleViewBills,
  });

  return (
    <div className="min-h-full bg-card">
      {/* Summary */}
      <div className="grid grid-cols-2 gap-3 border-b border-border p-3 md:grid-cols-3">
        <StatCard icon={Users} label="Total Clients" value={clients.length} />
      </div>

      {/* Table */}
      <DataTable
        flush
        columns={columns}
        data={filteredClients}
        emptyMessage={isLoading ? 'Loading clients...' : 'No clients found matching your search'}
        toolbar={
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative sm:w-72">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by name or concern"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button className="gap-2 whitespace-nowrap sm:ml-auto" onClick={handleAddClick}>
              <Plus className="size-4" /> Add Client
            </Button>
          </div>
        }
        footer={
          <>
            Showing <span className="font-medium text-foreground">{filteredClients.length}</span> of {clients.length} clients
          </>
        }
      />

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
