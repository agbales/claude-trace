"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import type { SessionFilter } from "@/lib/claude-data/filter";

interface SessionFilterContextValue {
  filter: SessionFilter;
  setFilter: (filter: SessionFilter) => void;
}

const SessionFilterContext = createContext<SessionFilterContextValue | null>(null);

export function SessionFilterProvider({ children }: { children: ReactNode }) {
  const [filter, setFilter] = useState<SessionFilter>(null);
  return <SessionFilterContext.Provider value={{ filter, setFilter }}>{children}</SessionFilterContext.Provider>;
}

export function useSessionFilter(): SessionFilterContextValue {
  const ctx = useContext(SessionFilterContext);
  if (!ctx) throw new Error("useSessionFilter must be used within a SessionFilterProvider");
  return ctx;
}
