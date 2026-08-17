import { BILLING_PAYMENT_METHOD_OPTIONS, BILLING_PAYMENT_STATUS_OPTIONS } from '@/lib/select-options';

export interface BillItem {
  name: string;
  category: string;
  price: number;
  quantity: number;
  lineTotal: number;
}

export interface Bill {
  id: string;
  invoiceNumber: string;
  clientName: string;
  clientNumber: string;
  date: string;
  items: BillItem[];
  discount: number;
  subtotal: number;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  amountPaid: number;
  notes: string;
  createdAt: string;
}

export type BillFormData = Omit<Bill, 'id' | 'invoiceNumber' | 'subtotal' | 'total' | 'createdAt'>;

export const emptyBillItem: BillItem = {
  name: '',
  category: '',
  price: 0,
  quantity: 1,
  lineTotal: 0,
};

export const emptyBill: BillFormData = {
  clientName: '',
  clientNumber: '',
  date: '',
  items: [],
  discount: 0,
  paymentMethod: BILLING_PAYMENT_METHOD_OPTIONS[0],
  paymentStatus: BILLING_PAYMENT_STATUS_OPTIONS[0],
  amountPaid: 0,
  notes: '',
};

export function calcSubtotal(items: BillItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

export function calcTotal(items: BillItem[], discount: number): number {
  return Math.max(calcSubtotal(items) - (discount || 0), 0);
}
