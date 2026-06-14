import { S } from '../core/state.js';
import { CROPS } from '../data/crops.js';
import { getInventoryTotal } from '../utils/helpers.js';
import { fulfillOrder } from '../systems/quest-system.js';
import { getBuildingEffect } from '../systems/building-system.js';
import { CRAFTING_RECIPES } from '../data/crafting.js';

export function renderInventory() {
    const el = document.getElementById('inv-list');
    if (!el) return;
    let html = '', total = 0;
    for (const [k, qty] of Object.entries(S.inventory)) {
        if (qty > 0) {
            // Check if it's a crop or crafted item
            const c = CROPS[k] || CRAFTING_RECIPES[k] || { name: k, emoji: '📦', reward: 0 };
            const val = qty * c.reward;
            total += val;
            html += `<div class="inv-row"><span class="inv-ic">${c.emoji}</span>${c.name}<span class="inv-qty">×${qty}</span><span class="inv-val">${val}💰</span></div>`;
        }
    }

    const cap = getBuildingEffect('silo') || 50;
    const used = getInventoryTotal();
    const fillPercent = Math.min(100, (used / cap) * 100);

    if (!html) {
        html = '<div class="text-muted-sm" style="padding:8px">Kosong</div>';
    } else {
        html += `<div style="text-align:right;font-size:12px;font-weight:700;color:var(--primary);margin-top:6px">Total: ${total}💰</div>`;
    }

    // Silo meter
    html += `<div class="text-muted-sm" style="margin-top:8px;">📦 Silo: ${used}/${cap}</div>`;
    html += `<div class="silo-bar-outer"><div class="silo-bar-inner" style="width:${fillPercent}%"></div></div>`;

    el.innerHTML = html;
}

export function renderQuests() {
    const el = document.getElementById('quest-list');
    if (!el) return;
    if (!S.quests || !S.quests.length) { el.innerHTML = '<div class="text-muted-sm">Memuat...</div>'; return; }
    el.innerHTML = S.quests.map(q =>
        `<div class="quest-item ${q.done ? 'done' : ''}">${q.done ? '✅' : '☐'} ${q.desc}<br><small>${q.progress}/${q.target} → ${q.reward}💰</small></div>`
    ).join('');
}

export function renderOrders() {
    const el = document.getElementById('order-board');
    if (!el) return;
    el.innerHTML = '';

    if (!S.orders || S.orders.length === 0) return;

    S.orders.forEach(o => {
        const c = CROPS[o.crop];
        if (!c) return;
        const has = S.inventory[o.crop] || 0;
        const canFulfill = has >= o.qty;

        const card = document.createElement('div');
        card.style.cssText = `
            flex: 1; min-width: 180px; background: var(--panel-bg);
            border-radius: 16px; padding: 16px; text-align: center;
            border: 2px solid ${canFulfill ? 'var(--primary)' : 'rgba(0,0,0,0.1)'};
            box-shadow: 0 4px 12px rgba(0,0,0,0.05);
            transition: transform 0.2s;
        `;
        card.onmouseover = () => card.style.transform = 'translateY(-4px)';
        card.onmouseout = () => card.style.transform = 'translateY(0)';

        card.innerHTML = `
            <div style="font-size: 32px; margin-bottom: 8px;">${c.emoji}</div>
            <div style="font-weight: 800; font-size: 16px; color: var(--text);">${c.name}</div>
            <div style="font-weight: 600; color: ${canFulfill ? 'var(--primary)' : 'var(--accent)'}; margin-bottom: 12px;">
                ${has} / ${o.qty}
            </div>
            <div style="display: flex; justify-content: center; gap: 8px; font-size: 14px; font-weight: 700; margin-bottom: 16px;">
                <span style="color: var(--secondary)">+${o.rewardCoins} 💰</span>
                <span style="color: #3b82f6">+${o.rewardXP} ✨</span>
            </div>
        `;

        const btn = document.createElement('button');
        btn.className = 'act-btn ' + (canFulfill ? 'primary' : '');
        btn.style.width = '100%';
        btn.style.padding = '8px';
        btn.textContent = canFulfill ? 'Kirim 🚚' : 'Belum Cukup';
        if (!canFulfill) btn.style.opacity = '0.5';
        btn.onclick = () => fulfillOrder(o.id);

        card.appendChild(btn);
        el.appendChild(card);
    });
}
