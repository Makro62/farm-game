"use client";

import { useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export type SideDockTab = {
  id: string;
  label: string;
  emoji?: string;
  content: ReactNode;
};

type SideDockProps = {
  tabs?: SideDockTab[];
  defaultTab?: string;
  className?: string;
};

export default function SideDock({
  tabs = [],
  defaultTab,
  className = "",
}: SideDockProps) {
  const firstId = tabs[0]?.id;
  const [active, setActive] = useState(defaultTab || firstId);

  useEffect(() => {
    if (!tabs.some((t) => t.id === active) && firstId) {
      setActive(firstId);
    }
  }, [tabs, active, firstId]);

  const current = tabs.find((t) => t.id === active) || tabs[0];
  if (!tabs.length) return null;

  return (
    <aside className={cn("dock", className)}>
      <div className="dock-head">
        <div className="dock-tabs" role="tablist" aria-label="Panel samping">
          {tabs.map((tab) => {
            const selected = tab.id === current?.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={selected}
                className={cn("dock-tab", selected && "dock-tab--on")}
                onClick={() => setActive(tab.id)}
              >
                {tab.emoji ? (
                  <span className="dock-tab-emoji">{tab.emoji}</span>
                ) : null}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
      <div className="dock-body" role="tabpanel">
        {current?.content}
      </div>
    </aside>
  );
}
