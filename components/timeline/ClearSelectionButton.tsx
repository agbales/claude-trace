"use client";

import { filterLabel } from "@/lib/claude-data/filter";
import { useSessionFilter } from "./SessionFilterContext";

export function ClearSelectionButton() {
  const { filter, setFilter } = useSessionFilter();
  if (!filter) return null;

  return (
    <button
      onClick={() => setFilter(null)}
      className="whitespace-nowrap rounded-full bg-violet-600 px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-violet-700 dark:bg-violet-500 dark:hover:bg-violet-400"
    >
      Clear selection: {filterLabel(filter)}
    </button>
  );
}
