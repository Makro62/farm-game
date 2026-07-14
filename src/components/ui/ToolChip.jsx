'use client';

import { cn } from '@/lib/utils';

export default function ToolChip({
  children,
  active = false,
  onClick,
  className = '',
  emoji,
  type = 'button',
  ...props
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={cn('tool-chip', active && 'tool-chip--active', className)}
      {...props}
    >
      {emoji != null && <span className="tool-chip-emoji">{emoji}</span>}
      {children}
    </button>
  );
}
