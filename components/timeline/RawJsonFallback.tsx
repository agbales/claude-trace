"use client";

import { useState } from "react";

export function RawJsonFallback({ rawType, raw }: { rawType: string; raw: unknown }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-lg border border-zinc-200 text-xs dark:border-white/10">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2 px-2.5 py-1.5 text-left text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
      >
        <span>{open ? "▾" : "▸"}</span>
        <span>Unrecognized event ({rawType})</span>
      </button>
      {open && <pre className="overflow-x-auto px-2.5 pb-2.5 text-zinc-500">{JSON.stringify(raw, null, 2)}</pre>}
    </div>
  );
}
