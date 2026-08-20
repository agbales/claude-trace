import type { TextEvent as TextEventType } from "@/lib/claude-data/types";

export function TextEvent({ event }: { event: TextEventType }) {
  return (
    <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-800 dark:text-zinc-200">{event.text}</p>
  );
}
