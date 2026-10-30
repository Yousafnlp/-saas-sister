import { BookX, FileSpreadsheet, MessagesSquare, NotebookPen, ReceiptText } from 'lucide-react';

const REPLACED = [
  { icon: NotebookPen, label: 'Paper appointment registers' },
  { icon: FileSpreadsheet, label: 'Excel patient lists' },
  { icon: MessagesSquare, label: 'Bookings lost in WhatsApp' },
  { icon: ReceiptText, label: 'Handwritten receipts' },
  { icon: BookX, label: 'Salary notebooks' },
];

export function Retire() {
  return (
    <section aria-labelledby="retire-title" className="border-y border-border bg-surface">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <h2 id="retire-title" className="text-center text-sm font-semibold text-muted-foreground">
          One app instead of
        </h2>
        <ul className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
          {REPLACED.map(({ icon: Icon, label }) => (
            <li
              key={label}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-2 text-sm text-muted-foreground"
            >
              <Icon className="size-4 text-muted-foreground/80" aria-hidden="true" />
              <span className="line-through decoration-primary/60 decoration-2">{label}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
