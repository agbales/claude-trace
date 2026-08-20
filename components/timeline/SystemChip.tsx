import type { SystemEvent } from "@/lib/claude-data/types";

export function SystemChip({ event }: { event: SystemEvent }) {
  return (
    <span className="inline-block rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-500 dark:bg-zinc-800">
      {event.label}
    </span>
  );
}
