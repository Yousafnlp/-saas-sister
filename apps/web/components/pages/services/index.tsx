'use client';

import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Download, Edit, Globe, Layers, Plus, Search, Tags, Trash2 } from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatCard } from '@/components/stat-card';
import { EmptyState } from '@/components/empty-state';
import DataTable, { type DataTableColumn } from '@/components/data-table';
import { ServiceFormSheet } from './sheet';
import { emptyService, formatServicePrice, type Service, type ServiceFormData, type ServiceListResponse } from './types';

interface ServiceResponse {
  success: boolean;
  data: Service;
}

interface ImportResponse {
  success: boolean;
  data: { added: number; total: number };
}

export default function Services() {
  const { can } = useAuth();
  const canEdit = can('services');
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showSheet, setShowSheet] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<ServiceFormData>(emptyService);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const loadServices = () =>
    api.get<ServiceListResponse>('/services').then((res) => setServices(res.data));

  useEffect(() => {
    loadServices()
      .catch((err) => toast.error(err instanceof ApiError ? err.message : 'Failed to load services'))
      .finally(() => setIsLoading(false));
  }, []);

  const categories = useMemo(() => Array.from(new Set(services.map((s) => s.category))).sort(), [services]);

  const filteredServices = services.filter((service) => {
    const term = searchQuery.toLowerCase();
    const matchesSearch =
      service.name.toLowerCase().includes(term) || service.note.toLowerCase().includes(term);
    const matchesCategory = categoryFilter === 'all' || service.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const replaceService = (updated: Service) =>
    setServices((prev) => prev.map((service) => (service.id === updated.id ? updated : service)));

  const handleAddClick = () => {
    setEditingId(null);
    setFormData({ ...emptyService, category: categoryFilter === 'all' ? '' : categoryFilter });
    setShowSheet(true);
  };

  const handleEditClick = (service: Service) => {
    setEditingId(service.id);
    setFormData(
      Object.fromEntries(Object.keys(emptyService).map((key) => [key, service[key as keyof ServiceFormData]])) as ServiceFormData,
    );
    setShowSheet(true);
  };

  const handleToggle = async (service: Service, field: 'isActive' | 'showOnline', value: boolean) => {
    replaceService({ ...service, [field]: value });
    try {
      const res = await api.put<ServiceResponse>(`/services/${service.id}`, { [field]: value });
      replaceService(res.data);
    } catch (err) {
      replaceService(service);
      toast.error(err instanceof ApiError ? err.message : 'Failed to update service');
    }
  };

  const handleDelete = async (service: Service) => {
    if (!confirm(`Delete "${service.name}"? Existing bills keep their line items.`)) return;

    try {
      await api.delete(`/services/${service.id}`);
      setServices((prev) => prev.filter((s) => s.id !== service.id));
      toast.success('Service deleted');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to delete service');
    }
  };

  const handleImport = async () => {
    if (
      services.length > 0 &&
      !confirm('Add any services from the default d.Aesthetics price list that are missing? Your existing services and prices will not change.')
    ) {
      return;
    }

    setIsImporting(true);
    try {
      const res = await api.post<ImportResponse>('/services/import-defaults');
      await loadServices();
      toast.success(res.data.added > 0 ? `Added ${res.data.added} services` : 'Your price list already has every default service');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to import price list');
    } finally {
      setIsImporting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editingId) {
        const res = await api.put<ServiceResponse>(`/services/${editingId}`, formData);
        replaceService(res.data);
        toast.success('Service updated');
      } else {
        const res = await api.post<ServiceResponse>('/services', formData);
        setServices((prev) =>
          [...prev, res.data].sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name)),
        );
        toast.success('Service added');
      }
      setShowSheet(false);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to save service');
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns: DataTableColumn<Service>[] = [
    {
      key: 'name',
      label: 'Service',
      render: (value: string, service) => (
        <div className="min-w-0">
          <p className={service.isActive ? 'font-medium text-foreground' : 'font-medium text-muted-foreground line-through'}>
            {value}
          </p>
          {service.note && <p className="text-xs text-muted-foreground">{service.note}</p>}
        </div>
      ),
    },
    { key: 'category', label: 'Category', hideBelow: 'md' },
    {
      key: 'price',
      label: 'Price',
      align: 'right',
      cellClassName: 'whitespace-nowrap tabular-nums font-medium text-foreground',
      render: (value: number) => formatServicePrice(value),
    },
    {
      key: 'isActive',
      label: 'Available',
      align: 'center',
      hideBelow: 'sm',
      render: (value: boolean, service) => (
        <Switch
          checked={value}
          disabled={!canEdit}
          onCheckedChange={(checked) => handleToggle(service, 'isActive', checked)}
          aria-label={`${service.name} available for billing`}
        />
      ),
    },
    {
      key: 'showOnline',
      label: 'Online',
      align: 'center',
      hideBelow: 'sm',
      render: (value: boolean, service) => (
        <Switch
          checked={value}
          disabled={!canEdit}
          onCheckedChange={(checked) => handleToggle(service, 'showOnline', checked)}
          aria-label={`Show ${service.name} on the booking page`}
        />
      ),
    },
  ];

  if (canEdit) {
    columns.push({
      key: 'actions',
      label: 'Actions',
      align: 'right',
      render: (_value, service) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="text-muted-foreground hover:text-foreground"
            onClick={() => handleEditClick(service)}
            aria-label={`Edit ${service.name}`}
            title={`Edit ${service.name}`}
          >
            <Edit className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="text-muted-foreground hover:text-destructive"
            onClick={() => handleDelete(service)}
            aria-label={`Delete ${service.name}`}
            title={`Delete ${service.name}`}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      ),
    });
  }

  const actions = canEdit && (
    <div className="flex gap-3 sm:ml-auto">
      <Button variant="outline" className="flex-1 gap-2 whitespace-nowrap sm:flex-none" onClick={handleImport} disabled={isImporting}>
        <Download className="size-4" /> {isImporting ? 'Importing...' : 'Import default list'}
      </Button>
      <Button className="flex-1 gap-2 whitespace-nowrap sm:flex-none" onClick={handleAddClick}>
        <Plus className="size-4" /> Add Service
      </Button>
    </div>
  );

  return (
    <div className="min-h-full bg-card">
      <div className="grid grid-cols-2 gap-3 border-b border-border p-3 md:grid-cols-3">
        <StatCard icon={Tags} label="Services" value={services.length} tone="primary" />
        <StatCard icon={Layers} label="Categories" value={categories.length} tone="info" />
        <StatCard
          icon={Globe}
          label="On booking page"
          value={services.filter((s) => s.isActive && s.showOnline).length}
          tone="success"
        />
      </div>

      {!isLoading && services.length === 0 ? (
        <>
          {actions && <div className="flex border-b border-border p-3">{actions}</div>}
          <EmptyState
            bordered={false}
            icon={Tags}
            title="No services yet"
            description={
              canEdit
                ? 'Import the default d.Aesthetics price list, or add services one by one.'
                : 'Ask an Admin to set up the price list.'
            }
          />
        </>
      ) : (
        <DataTable
          flush
          columns={columns}
          data={filteredServices}
          emptyMessage={isLoading ? 'Loading services...' : 'No services match your search'}
          toolbar={
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative sm:w-72">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search services"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-56" aria-label="Filter by category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {actions}
            </div>
          }
          footer={
            <>
              Showing <span className="font-medium text-foreground">{filteredServices.length}</span> of {services.length} services
            </>
          }
        />
      )}

      <ServiceFormSheet
        open={showSheet}
        onOpenChange={setShowSheet}
        editingId={editingId}
        formData={formData}
        onFormDataChange={setFormData}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        categories={categories}
      />
    </div>
  );
}
