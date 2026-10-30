export interface Service {
  id: string;
  name: string;
  category: string;
  /** 0 means price on application (POA). */
  price: number;
  note: string;
  isActive: boolean;
  showOnline: boolean;
}

export type ServiceFormData = Omit<Service, 'id'>;

export interface ServiceListResponse {
  success: boolean;
  data: Service[];
}

export const emptyService: ServiceFormData = {
  name: '',
  category: '',
  price: 0,
  note: '',
  isActive: true,
  showOnline: true,
};

export function formatServicePrice(price: number) {
  return price > 0 ? `Rs ${price.toLocaleString()}` : 'POA';
}

/** Groups services by category, keeping the API's category/name order. */
export function groupByCategory<T extends { category: string }>(services: T[]) {
  const groups = new Map<string, T[]>();
  for (const service of services) {
    const list = groups.get(service.category) ?? [];
    list.push(service);
    groups.set(service.category, list);
  }
  return Array.from(groups, ([category, items]) => ({ category, services: items }));
}
