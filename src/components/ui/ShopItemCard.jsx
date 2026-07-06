'use client';

export function ShopSectionTitle({ icon, children }) {
  return (
    <h3 className="shop-section-title">
      <span aria-hidden>{icon}</span>
      {children}
    </h3>
  );
}

export function ShopItemCard({ icon, name, price, amount, onDecrease, onIncrease, onBuy }) {
  const total = price * amount;

  return (
    <article className="shop-item-card">
      <div className="shop-item-info">
        <span className="shop-item-icon" aria-hidden>{icon}</span>
        <span className="shop-item-name">{name}</span>
        <span className="shop-item-price">{price} 💰 / pcs</span>
      </div>

      <div className="shop-qty-control">
        <button type="button" onClick={onDecrease} aria-label="Kurangi jumlah" className="btn-qty">
          −
        </button>
        <span className="shop-qty-value">{amount}</span>
        <button type="button" onClick={onIncrease} aria-label="Tambah jumlah" className="btn-qty">
          +
        </button>
      </div>

      <button type="button" onClick={onBuy} className="btn-shop">
        <span className="btn-shop-label">Beli</span>
        <span className="btn-shop-total">{total} 💰</span>
      </button>
    </article>
  );
}
