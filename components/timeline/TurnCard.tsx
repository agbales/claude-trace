import type { NormEvent, SystemEvent, Turn } from "@/lib/claude-data/types";
import { EventNode } from "./EventNode";
import { SystemEventsGroup } from "./SystemEventsGroup";

type RenderGroup = { kind: "system-group"; events: SystemEvent[] } | { kind: "single"; event: NormEvent };

function groupEvents(events: NormEvent[]): RenderGroup[] {
  const groups: RenderGroup[] = [];
  for (const event of events) {
    if (event.kind === "system") {
      const last = groups[groups.length - 1];
      if (last && last.kind === "system-group") {
        last.events.push(event);
        continue;
      }
      groups.push({ kind: "system-group", events: [event] });
    } else {
      groups.push({ kind: "single", event });
    }
  }
  return groups;
}

export function TurnCard({ turn, projectDir, sessionId }: { turn: Turn; projectDir: string; sessionId: string }) {
  const groups = groupEvents(turn.events);

  return (
    <div className="space-y-3 border-b border-black/5 pb-6 last:border-b-0 dark:border-white/5">
      <p className="font-medium text-zinc-900 dark:text-zinc-50">{turn.question || "(no text)"}</p>
      <div className="space-y-2 pl-1">
        {groups.map((g, i) =>
          g.kind === "system-group" ? (
            <SystemEventsGroup key={`sys-${i}`} events={g.events} />
          ) : (
            <EventNode key={g.event.uuid} event={g.event} projectDir={projectDir} sessionId={sessionId} />
          )
        )}
      </div>
    </div>
  );
}
