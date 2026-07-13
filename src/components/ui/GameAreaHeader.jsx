'use client';

export function GameAreaHeader({ icon, title, children }) {
  return (
    <div className="game-area-header">
      <h2 className="game-area-title">
        <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-black/25 border border-white/15 text-xl" aria-hidden>
          {icon}
        </span>
        <span className="text-shadow">{title}</span>
      </h2>
      {children && <div className="game-area-actions">{children}</div>}
    </div>
  );
}

export function GameActionButton({ children, onClick, variant = 'default', active = false, className = '' }) {
  const variants = {
    default: active ? 'game-action-btn--muted' : '',
    edit: active ? 'game-action-btn--edit' : '',
    auto: active ? 'game-action-btn--auto' : '',
    miner: active ? 'game-action-btn--miner' : '',
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`game-action-btn ${variants[variant] || ''} ${className}`}
    >
      {children}
    </button>
  );
}
