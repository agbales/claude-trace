"use client";

import { useState } from "react";

export function RawJsonFallback({ rawType, raw }: { rawType: string; raw: unknown }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-md border border-zinc-200 text-xs dark:border-zinc-800">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2 px-2 py-1 text-left text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
      >
        <span>{open ? "▾" : "▸"}</span>
        <span>Unrecognized event ({rawType})</span>
      </button>
      {open && <pre className="overflow-x-auto px-2 pb-2 text-zinc-500">{JSON.stringify(raw, null, 2)}</pre>}
    </div>
  );
}
