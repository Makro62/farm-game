import { S, GameState } from '../core/state.js';
import { CROPS } from '../data/crops.js';
import { ANIMALS } from '../data/animals.js';
import { DECORATIONS } from '../data/items.js';
import { FISHES } from '../data/fishes.js';
import { buySeed } from '../systems/crop-system.js';
import { buyAnimal } from '../systems/animal-system.js';
import { buyDecoration } from '../systems/economy-system.js';
import { buyFish } from '../systems/fish-system.js';
import { NotificationManager } from '../managers/notification-manager.js';

export function renderShop() {
    const el = document.getElementById('shop-list');
    if (!el) return;
    el.innerHTML = '';
    for (const [k, c] of Object.entries(CROPS)) {
        const locked = S.level < c.minLv;
        
        const wrap = document.createElement('div');
        wrap.style.display = 'flex';
        wrap.style.gap = '8px';
        wrap.style.marginBottom = '8px';

        const btn = document.createElement('button');
        btn.className = 'shop-btn' + (locked ? ' locked' : '');
        btn.style.flex = '1';
        btn.style.margin = '0';
        btn.innerHTML = `${c.emoji} ${c.name} <span class="price">${c.cost}💰</span>`;
        btn.onclick = () => {
            if (locked) {
                NotificationManager.toast(`Butuh Level ${c.minLv}!`, 'warn');
                return;
            }
            buySeed(k, 1);
        };
        if (locked) btn.title = `Butuh Level ${c.minLv}`;
        wrap.appendChild(btn);

        if (!locked) {
            const moreBtn = document.createElement('button');
            moreBtn.className = 'act-btn';
            moreBtn.style.flex = '0 0 auto';
            moreBtn.style.margin = '0';
            moreBtn.style.width = 'auto';
            moreBtn.style.padding = '0 15px';
            moreBtn.innerHTML = '➕';
            moreBtn.title = 'Beli Banyak';
            moreBtn.onclick = () => {
                promptBuySeed(k, c);
            };
            wrap.appendChild(moreBtn);
        }

        el.appendChild(wrap);
    }
}

/**
 * Open a quantity input box, then buy that many seeds.
 */
function promptBuySeed(key, cropConfig) {
    NotificationManager.showPrompt(
        `Beli Bibit ${cropConfig.emoji} ${cropConfig.name}`,
        `Harga ${cropConfig.cost}💰 / bibit. Masukkan jumlah yang ingin dibeli:`,
        { defaultValue: 1, min: 1, max: 999 },
        (qty) => buySeed(key, qty)
    );
}

export function renderCropList() {
    const el = document.getElementById('crop-list');
    if (!el) return;
    el.innerHTML = '';
    for (const [k, c] of Object.entries(CROPS)) {
        const locked = S.level < c.minLv;
        const btn = document.createElement('button');
        btn.className = 'crop-btn' + (locked ? ' locked' : '') + (GameState.selectedCrop === k ? ' selected' : '');
        btn.innerHTML = `${c.emoji} ${c.name} <span class="price">×${S.seeds[k] || 0}</span>`;
        btn.onclick = () => {
            if (locked) { NotificationManager.toast(`Butuh Level ${c.minLv}!`, 'warn'); return; }
            GameState.selectedCrop = k;
            renderCropList();
        };
        el.appendChild(btn);
    }
}

export function renderDecorations() {
    const el = document.getElementById('deco-list');
    if (!el) return;
    el.innerHTML = '';

    const farmArea = document.getElementById('farm-decorations-area');
    if (farmArea) farmArea.innerHTML = '';

    if (S.level < 5) {
        el.innerHTML = '<div class="text-muted-sm">Terbuka di Level 5</div>';
        return;
    }

    for (const [k, d] of Object.entries(DECORATIONS)) {
        const owned = S.decorations && S.decorations.includes(k);
        const btn = document.createElement('button');
        btn.className = 'shop-btn' + (owned ? ' locked' : '');
        btn.innerHTML = `<img src="img/${k}.png" alt="${k}" style="width:28px; height:28px; object-fit:cover; border-radius:8px; margin-right:4px; vertical-align:middle;" onerror="this.style.display='none'; this.nextSibling.style.display='inline'"><span style="display:none; font-size:22px;">${d.emoji}</span> ${d.name} (+${d.prestige}✨) <span class="price">${owned ? '✅ Dimiliki' : d.cost + '💰'}</span>`;
        if (!owned) {
            btn.onclick = () => buyDecoration(k);
        } else {
            btn.style.borderColor = 'var(--primary)';
            btn.style.background = 'rgba(74, 222, 128, 0.2)';

            if (farmArea) {
                const decoEl = document.createElement('div');
                decoEl.style.cssText = 'display: inline-block; transition: transform 0.3s; cursor: pointer;';
                decoEl.innerHTML = `<img src="img/${k}.png" alt="${d.name}" style="width:70px; height:70px; object-fit:contain; filter: drop-shadow(0 6px 8px rgba(0,0,0,0.3));" onerror="this.parentElement.textContent='${d.emoji}'; this.parentElement.style.fontSize='50px';">`;
                decoEl.onmouseover = () => decoEl.style.transform = 'scale(1.2) translateY(-5px)';
                decoEl.onmouseout = () => decoEl.style.transform = 'scale(1) translateY(0)';
                farmArea.appendChild(decoEl);
            }
        }
        el.appendChild(btn);
    }
}

export function renderAnimalsList() {
    const el = document.getElementById('animal-list');
    if (!el) return;
    el.innerHTML = '';

    for (const [k, a] of Object.entries(ANIMALS)) {
        const locked = S.level < a.minLv;
        const count = S.animals ? S.animals.filter(x => x.type === k).length : 0;
        const btn = document.createElement('button');
        btn.className = 'shop-btn' + (locked ? ' locked' : '');
        
        let iconHtml = `<span style="font-size:22px; vertical-align:middle; margin-right:4px;">${a.emoji}</span>`;
        if (a.img) {
            iconHtml = `<img src="${a.img}" alt="${a.name}" style="width:28px; height:28px; object-fit:contain; vertical-align:middle; margin-right:4px;" onerror="this.style.display='none'; this.nextSibling.style.display='inline'"><span style="display:none; font-size:22px; vertical-align:middle; margin-right:4px;">${a.emoji}</span>`;
        }
        
        btn.innerHTML = `${iconHtml} ${a.name} <span class="price">${a.cost}💰</span>`;
        if (locked) {
            btn.innerHTML += `<div class="text-muted-sm" style="margin-top:4px; color:var(--secondary)">Lv ${a.minLv} Terbuka</div>`;
        }
        if (count > 0) {
            btn.innerHTML += `<div class="text-muted-sm" style="color:var(--primary)">Dimiliki: ${count}</div>`;
        }
        btn.onclick = () => buyAnimal(k);
        el.appendChild(btn);
    }
}

export function renderFishShopList() {
    const el = document.getElementById('fish-shop-list');
    if (!el) return;
    el.innerHTML = '';
    
    for (const [k, f] of Object.entries(FISHES)) {
        const locked = S.level < f.minLv;
        const count = S.fishes ? S.fishes.filter(x => x.type === k).length : 0;
        const btn = document.createElement('button');
        btn.className = 'shop-btn' + (locked ? ' locked' : '');
        
        let iconHtml = `<span style="font-size:22px; vertical-align:middle; margin-right:4px;">${f.emoji}</span>`;
        if (f.img) {
            iconHtml = `<img src="${f.img}" alt="${f.name}" style="width:28px; height:28px; object-fit:contain; vertical-align:middle; margin-right:4px;" onerror="this.style.display='none'; this.nextSibling.style.display='inline'"><span style="display:none; font-size:22px; vertical-align:middle; margin-right:4px;">${f.emoji}</span>`;
        }
        
        btn.innerHTML = `${iconHtml} ${f.name} <span class="price">${f.cost}💰</span>`;
        if (locked) {
            btn.innerHTML += `<div class="text-muted-sm" style="margin-top:4px; color:var(--secondary)">Lv ${f.minLv} Terbuka</div>`;
        }
        if (count > 0) {
            btn.innerHTML += `<div class="text-muted-sm" style="color:var(--primary)">Dimiliki: ${count}</div>`;
        }
        btn.onclick = () => buyFish(k);
        el.appendChild(btn);
    }
}

export function renderFishMarket() {
    const el = document.getElementById('fish-market-list');
    if (!el) return;
    el.innerHTML = '';
    
    let hasFish = false;
    for (const [k, f] of Object.entries(FISHES)) {
        const qty = S.inventory[k] || 0;
        if (qty > 0) {
            hasFish = true;
            const btn = document.createElement('button');
            btn.className = 'shop-btn';
            btn.style.flex = '1';
            btn.style.minWidth = '200px';
            const value = f.reward * qty;
            
            btn.innerHTML = `
                <div class="text-left">
                    <div style="font-size:15px; font-weight:800;">${f.productEmoji} ${f.product} <span class="text-muted-sm" style="font-weight:700;">×${qty}</span></div>
                    <div class="text-muted-sm" style="color:var(--secondary); font-weight:800; margin-top:4px;">Total Harga: ${value}💰</div>
                </div>
                <div class="act-btn primary" style="width:auto; padding:8px 16px; margin:0;">Jual</div>
            `;
            
            btn.onclick = () => {
                import('../managers/audio-manager.js').then(({ AudioManager }) => AudioManager.playSound('coin'));
                S.coins += value;
                S.totalEarned = (S.totalEarned || 0) + value;
                S.inventory[k] = 0;
                NotificationManager.toast(`Berhasil menjual ${f.product}! (+${value}💰)`, 'success');
                if (typeof window.render === 'function') window.render();
                import('../core/save-manager.js').then(({ queueSave }) => queueSave());
            };
            el.appendChild(btn);
        }
    }
    
    if (!hasFish) {
        el.innerHTML = '<div class="text-muted-sm" style="padding:16px; text-align:center; width:100%; background:rgba(255,255,255,0.4); border-radius:12px;">Belum ada hasil tangkapan di gudang.</div>';
    }
}
