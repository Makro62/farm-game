"use client";

import { cn } from "@/lib/utils";

export function GameAreaHeader({ icon, title, children }) {
  return (
    <div className="game-area-header">
      <h2 className="game-area-title">
        <span
          className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-black/25 border border-white/15 text-xl"
          aria-hidden
        >
          {icon}
        </span>
        <span className="text-shadow">{title}</span>
      </h2>
      {children && <div className="game-area-actions">{children}</div>}
    </div>
  );
}

const ACTIVE_VARIANTS = {
  default: "game-action-btn--muted",
  edit: "game-action-btn--edit",
  toggle: "game-action-btn--edit",
  auto: "game-action-btn--auto",
  miner: "game-action-btn--miner",
};

export function GameActionButton({
  children,
  onClick,
  variant = "default",
  active = false,
  className = "",
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "game-action-btn",
        active && (ACTIVE_VARIANTS[variant] || ACTIVE_VARIANTS.default),
        className,
      )}
    >
      {children}
    </button>
  );
}
