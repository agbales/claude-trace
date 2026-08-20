import type { NormEvent } from "@/lib/claude-data/types";
import { TextEvent } from "./TextEvent";
import { ThinkingBlock } from "./ThinkingBlock";
import { ToolCallNode } from "./ToolCallNode";
import { SystemChip } from "./SystemChip";
import { RawJsonFallback } from "./RawJsonFallback";

export function EventNode({
  event,
  projectDir,
  sessionId,
}: {
  event: NormEvent;
  projectDir: string;
  sessionId: string;
}) {
  switch (event.kind) {
    case "text":
      return <TextEvent event={event} />;
    case "thinking":
      return <ThinkingBlock event={event} />;
    case "tool_call":
      return <ToolCallNode event={event} projectDir={projectDir} sessionId={sessionId} />;
    case "system":
      return <SystemChip event={event} />;
    case "unknown":
      return <RawJsonFallback rawType={event.rawType} raw={event.raw} />;
    default:
      return null;
  }
}
