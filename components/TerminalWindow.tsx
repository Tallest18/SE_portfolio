import type { ReactNode } from "react";

export function TerminalWindow({
  tabs,
  activeTab = 0,
  children
}: {
  tabs: string[];
  activeTab?: number;
  children: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-ink-300 bg-white/80 backdrop-blur shadow-xl shadow-ink-900/10 overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-ink-400 bg-ink-300/60">
        <span className="h-2.5 w-2.5 rounded-full bg-[#ef5350]/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#f2a93b]/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#2fd9b8]/70" />
        <div className="ml-4 flex gap-1">
          {tabs.map((tab, i) => (
            <span
              key={tab}
              className={`font-mono text-[11px] px-3 py-1 rounded-t-md border-b-2 ${
                i === activeTab
                  ? "text-ink-900 border-copper bg-ink-200"
                  : "text-ink-600 border-transparent"
              }`}
            >
              {tab}
            </span>
          ))}
        </div>
      </div>
      <div className="p-5 sm:p-7">{children}</div>
    </div>
  );
}
