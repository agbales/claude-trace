"use client";

import { filterLabel } from "@/lib/claude-data/filter";
import { useSessionFilter } from "./SessionFilterContext";

export function ClearSelectionButton() {
  const { filter, setFilter } = useSessionFilter();
  if (!filter) return null;

  return (
    <button
      onClick={() => setFilter(null)}
      className="whitespace-nowrap rounded-md border border-indigo-200 bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700 hover:bg-indigo-100 dark:border-indigo-900 dark:bg-indigo-950/40 dark:text-indigo-300 dark:hover:bg-indigo-950/70"
    >
      Clear selection: {filterLabel(filter)}
    </button>
  );
}
