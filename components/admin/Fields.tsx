"use client";

import { Plus, Trash2 } from "lucide-react";

export function Field({
  label,
  value,
  onChange,
  placeholder = ""
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="block text-xs font-mono text-ink-600 mb-1.5">{label}</span>
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-ink-500 bg-ink-100 px-3 py-2 text-sm text-ink-950 focus:border-copper outline-none"
      />
    </label>
  );
}

export function TextAreaField({
  label,
  value,
  onChange,
  rows = 3
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
}) {
  return (
    <label className="block">
      <span className="block text-xs font-mono text-ink-600 mb-1.5">{label}</span>
      <textarea
        value={value}
        rows={rows}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-ink-500 bg-ink-100 px-3 py-2 text-sm text-ink-950 focus:border-copper outline-none resize-y"
      />
    </label>
  );
}

/** Editable list of plain strings (e.g. skill tags, bullet points, roles). */
export function StringListField({
  label,
  items,
  onChange
}: {
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
}) {
  return (
    <div>
      <span className="block text-xs font-mono text-ink-600 mb-1.5">{label}</span>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex gap-2">
            <input
              type="text"
              value={item}
              onChange={(e) => {
                const next = [...items];
                next[i] = e.target.value;
                onChange(next);
              }}
              className="flex-1 rounded-lg border border-ink-500 bg-ink-100 px-3 py-2 text-sm text-ink-950 focus:border-copper outline-none"
            />
            <button
              type="button"
              onClick={() => onChange(items.filter((_, idx) => idx !== i))}
              className="shrink-0 rounded-lg border border-ink-400 px-2.5 text-ink-600 hover:text-[#ef5350] hover:border-[#ef5350]/50 transition-colors"
              aria-label={`Remove ${label} item ${i + 1}`}
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => onChange([...items, ""])}
        className="mt-2 inline-flex items-center gap-1.5 text-xs font-mono text-copper hover:text-copper-light transition-colors"
      >
        <Plus size={14} /> add
      </button>
    </div>
  );
}

export function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-ink-400 bg-ink-200/40 p-6 space-y-4">
      <h3 className="font-display text-base font-semibold text-ink-950">{title}</h3>
      {children}
    </div>
  );
}

export function RemovableCard({
  title,
  onRemove,
  children
}: {
  title: string;
  onRemove: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-ink-400 bg-ink-200/40 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-base font-semibold text-ink-950">{title}</h3>
        <button
          type="button"
          onClick={onRemove}
          className="inline-flex items-center gap-1.5 text-xs font-mono text-ink-600 hover:text-[#ef5350] transition-colors"
        >
          <Trash2 size={14} /> remove
        </button>
      </div>
      {children}
    </div>
  );
}

export function AddButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-ink-500 px-4 py-2.5 text-xs font-mono text-ink-700 hover:border-copper hover:text-copper transition-colors w-full justify-center"
    >
      <Plus size={14} /> {label}
    </button>
  );
}
