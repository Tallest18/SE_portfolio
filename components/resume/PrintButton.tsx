"use client";

import { Download } from "lucide-react";

/** Opens the browser's print dialog, where "Save as PDF" produces the résumé file. */
export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex items-center gap-2 rounded-full bg-copper px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-copper-dark"
    >
      <Download size={15} aria-hidden="true" />
      Download PDF
    </button>
  );
}
