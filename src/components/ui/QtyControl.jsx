'use client';

export default function QtyControl({
  value,
  onDecrease,
  onIncrease,
  onChange,
  min = 1,
  max,
  size = 'md',
  editable = false,
}) {
  const clamp = (n) => {
    let next = Number.isFinite(n) ? n : min;
    if (max != null) next = Math.min(max, next);
    return Math.max(min, next);
  };

  const isLg = size === 'lg';

  return (
    <div className={`qty-control ${isLg ? 'qty-control--lg' : ''}`}>
      <button
        type="button"
        onClick={onDecrease}
        aria-label="Kurangi jumlah"
        className="btn-qty"
      >
        −
      </button>
      {editable || onChange ? (
        <input
          type="number"
          value={value}
          min={min}
          max={max}
          onChange={(e) => onChange?.(clamp(parseInt(e.target.value, 10)))}
          className="qty-control-input"
        />
      ) : (
        <span className="shop-qty-value">{value}</span>
      )}
      <button
        type="button"
        onClick={onIncrease}
        aria-label="Tambah jumlah"
        className="btn-qty"
      >
        +
      </button>
    </div>
  );
}
