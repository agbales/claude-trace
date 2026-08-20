"use client";

import { useState } from "react";
import type { SystemEvent } from "@/lib/claude-data/types";
import { SystemChip } from "./SystemChip";

export function SystemEventsGroup({ events }: { events: SystemEvent[] }) {
  const [open, setOpen] = useState(false);

  if (events.length === 1) return <SystemChip event={events[0]} />;

  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
      >
        {open ? "▾" : "▸"} {events.length} system events{open ? "" : " hidden"}
      </button>
      {open && (
        <div className="mt-1 flex flex-wrap gap-1">
          {events.map((e) => (
            <SystemChip key={e.uuid} event={e} />
          ))}
        </div>
      )}
    </div>
  );
}
