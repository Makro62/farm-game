'use client';

import { useState } from 'react';
import { getAnimalEmoji, getShopAnimal } from '../../lib/data/item-helpers';

export function AnimalIcon({ type }) {
  const data = getShopAnimal(type);
  const [imgFailed, setImgFailed] = useState(false);

  if (data?.image && !imgFailed) {
    return (
      <img
        src={data.image}
        alt={data.name}
        className="animal-cell-img"
        onError={() => setImgFailed(true)}
      />
    );
  }

  return (
    <span className="plot-emoji select-none" aria-hidden>
      {getAnimalEmoji(type)}
    </span>
  );
}
