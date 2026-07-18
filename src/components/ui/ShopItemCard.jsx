'use client';

import QtyControl from './QtyControl';
import Button from './Button';

export function ShopSectionTitle({ icon, children }) {
  return (
    <h3 className="shop-section-title">
      <span aria-hidden>{icon}</span>
      {children}
    </h3>
  );
}

export function ShopItemCard({ icon, name, price, amount, onDecrease, onIncrease, onBuy, dataTutorial }) {
  const total = price * amount;

  return (
    <article className="shop-item-card" data-tutorial={dataTutorial}>
      <div className="shop-item-info">
        <span className="shop-item-icon" aria-hidden>{icon}</span>
        <span className="shop-item-name">{name}</span>
        <span className="shop-item-price">{price} 💰 / pcs</span>
      </div>

      <div className="shop-qty-control">
        <QtyControl value={amount} onDecrease={onDecrease} onIncrease={onIncrease} />
      </div>

      <Button variant="shop" onClick={onBuy}>
        <span className="btn-shop-label">Beli</span>
        <span className="btn-shop-total">{total} 💰</span>
      </Button>
    </article>
  );
}
