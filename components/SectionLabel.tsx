export function SectionLabel({ index, name }: { index: string; name: string }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <span className="font-mono text-xs text-copper">{index}</span>
      <span className="font-mono text-xs text-ink-700">{name}</span>
      <span className="h-px flex-1 bg-ink-400" />
    </div>
  );
}
