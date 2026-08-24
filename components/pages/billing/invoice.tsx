import { CLINIC_INFO } from '@/lib/clinic-info';
import type { Bill } from './types';

function formatDate(value: string) {
  if (!value) return '';
  const date = new Date(`${value.slice(0, 10)}T00:00:00`);
  return date.toLocaleDateString('en-GB', { year: '2-digit', month: '2-digit', day: '2-digit' }).replace(/\//g, '-');
}

function formatTime(value: string) {
  if (!value) return '';
  return new Date(value).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

interface InvoiceProps {
  bill: Bill;
}

export function Invoice({ bill }: InvoiceProps) {
  const balance = Math.max(bill.total - bill.amountPaid, 0);
  const contactLine = [CLINIC_INFO.address, CLINIC_INFO.phone && `Contact: ${CLINIC_INFO.phone}`].filter(Boolean);

  return (
    <div className="invoice-paper mx-auto w-[80mm] max-w-full border border-gray-200 bg-white p-4 font-mono text-[11px] leading-snug text-gray-900 shadow-sm print:w-full print:border-0 print:p-0 print:shadow-none">
      <div className="text-center">
        <h1 className="text-base font-bold tracking-wide text-gray-900">{CLINIC_INFO.name.toUpperCase()}</h1>
        <p className="mt-0.5 text-[10px] text-gray-600">{CLINIC_INFO.tagline}</p>
        {contactLine.map((line) => (
          <p key={line} className="text-[10px] text-gray-600">
            {line}
          </p>
        ))}
      </div>

      <div className="invoice-divider my-2 border-t border-dashed border-gray-400" />

      <div className="flex justify-between text-[10px]">
        <span>Invoice#: {bill.invoiceNumber}</span>
      </div>
      <div className="flex justify-between text-[10px]">
        <span>Date: {formatDate(bill.date)}</span>
        <span>Time: {formatTime(bill.createdAt)}</span>
      </div>
      <div className="mt-1 text-[10px]">
        <p>Client: {bill.clientName}</p>
        <p>Number: {bill.clientNumber}</p>
      </div>

      <div className="invoice-divider my-2 border-t border-dashed border-gray-400" />

      <div className="flex justify-between text-[10px] font-semibold uppercase tracking-wide text-gray-600">
        <span>Service</span>
        <span>Amount</span>
      </div>

      <div className="invoice-divider my-1.5 border-t border-dashed border-gray-400" />

      <div className="space-y-1.5">
        {bill.items.map((item, index) => (
          <div key={`${item.name}-${index}`} className="invoice-row">
            <p className="text-gray-900">{item.name}</p>
            <div className="flex justify-between text-gray-600">
              <span>
                {item.quantity} x {item.price.toLocaleString()}
              </span>
              <span className="tabular-nums text-gray-900">{(item.price * item.quantity).toLocaleString()}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="invoice-divider my-2 border-t border-dashed border-gray-400" />

      <div className="invoice-row space-y-1 text-[10px]">
        <div className="flex justify-between text-gray-600">
          <span>Subtotal</span>
          <span className="tabular-nums">{bill.subtotal.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>Discount</span>
          <span className="tabular-nums">-{bill.discount.toLocaleString()}</span>
        </div>
        <div className="flex justify-between border-t border-gray-400 pt-1 text-sm font-bold text-gray-900">
          <span>TOTAL</span>
          <span className="tabular-nums">Rs {bill.total.toLocaleString()}</span>
        </div>
        {bill.paymentStatus !== 'Paid' && (
          <>
            <div className="flex justify-between text-gray-600">
              <span>Paid</span>
              <span className="tabular-nums">{bill.amountPaid.toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-semibold text-gray-900">
              <span>Balance Due</span>
              <span className="tabular-nums">{balance.toLocaleString()}</span>
            </div>
          </>
        )}
      </div>

      <div className="invoice-divider my-2 border-t border-dashed border-gray-400" />

      <div className="invoice-row space-y-1 text-[10px]">
        <div className="flex justify-between text-gray-600">
          <span>Payment Method</span>
          <span className="font-semibold text-gray-900">{bill.paymentMethod}</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>Status</span>
          <span className="font-semibold uppercase text-gray-900">{bill.paymentStatus}</span>
        </div>
      </div>

      {bill.notes && (
        <>
          <div className="invoice-divider my-2 border-t border-dashed border-gray-400" />
          <p className="invoice-row text-[10px] text-gray-600">{bill.notes}</p>
        </>
      )}

      <div className="invoice-divider my-2 border-t border-dashed border-gray-400" />

      <div className="invoice-row text-center">
        <p className="text-xs font-bold tracking-wide text-gray-900">THANK YOU FOR VISITING US</p>
      </div>
    </div>
  );
}
