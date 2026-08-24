'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export interface ClientOption {
  id: string;
  name: string;
  number: string;
}

interface ClientSelectProps {
  clients: ClientOption[];
  name: string;
  number: string;
  onSelect: (client: ClientOption | null) => void;
  label?: string;
  required?: boolean;
}

export function ClientSelect({ clients, name, number, onSelect, label = 'Client', required }: ClientSelectProps) {
  const selectedId = clients.find((client) => client.number === number)?.id ?? '';

  const handleChange = (id: string) => {
    onSelect(clients.find((client) => client.id === id) ?? null);
  };

  return (
    <div>
      {label && <label className="mb-1.5 block text-sm font-medium text-foreground">{label}</label>}
      <Select value={selectedId} onValueChange={handleChange} required={required}>
        <SelectTrigger className="w-full border-2">
          <SelectValue
            placeholder={selectedId === '' && name ? `${name} — ${number} (not in Clients)` : 'Select client'}
          />
        </SelectTrigger>
        <SelectContent>
          {clients.map((client) => (
            <SelectItem key={client.id} value={client.id}>
              {client.name} — {client.number}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
