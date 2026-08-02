'use client';

import { useState, ReactNode } from 'react';
import { ChevronDown, type LucideIcon } from 'lucide-react';

/**
 * Profile section that starts collapsed, so game grids don't push the rest
 * of the page out of view. The header always shows the count.
 */
export default function CollapsibleSection({
  title,
  count,
  icon: Icon,
  defaultOpen = false,
  emptyLabel,
  children,
}: {
  title: string;
  count: number;
  icon: LucideIcon;
  defaultOpen?: boolean;
  emptyLabel: ReactNode;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className="card overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full flex items-center gap-3 p-5 text-left hover:bg-dark-surface/60"
      >
        <Icon className="w-6 h-6 text-primary shrink-0" />
        <h2 className="text-xl font-bold flex-grow">
          {title} <span className="text-dark-text font-normal">({count})</span>
        </h2>
        <ChevronDown
          className={`w-5 h-5 text-dark-text shrink-0 transition-transform ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      {open && (
        <div className="px-5 pb-5 pt-1 border-t border-dark-border">
          {count === 0 ? <p className="text-dark-text pt-4">{emptyLabel}</p> : children}
        </div>
      )}
    </section>
  );
}
