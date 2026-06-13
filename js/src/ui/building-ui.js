import { S } from '../core/state.js';
import { BUILDINGS } from '../data/buildings.js';
import { getBuildingLevel, upgradeBuilding } from '../systems/building-system.js';

export function renderBuildings() {
    const el = document.getElementById('building-list');
    if (!el) return;
    el.innerHTML = '';

    for (const [id, b] of Object.entries(BUILDINGS)) {
        const currentLevel = getBuildingLevel(id);
        const isMax = currentLevel >= b.maxLevel;
        const nextLvData = isMax ? null : b.levels[currentLevel + 1];

        const card = document.createElement('div');
        card.style.cssText = `
            background: var(--panel-bg);
            border-radius: 12px; padding: 12px;
            display: flex; justify-content: space-between; align-items: center;
            border: 2px solid rgba(0,0,0,0.05);
        `;

        const info = document.createElement('div');
        info.innerHTML = `
            <div style="font-weight: 800; font-size: 16px; color: var(--text);">
                <span style="font-size: 24px; vertical-align: middle;">${b.emoji}</span> ${b.name} <span class="text-muted-sm">(Lv ${currentLevel}/${b.maxLevel})</span>
            </div>
            <div class="text-muted-sm" style="margin-top: 4px;">${b.desc}</div>
        `;

        const action = document.createElement('div');
        
        if (isMax) {
            const maxBadge = document.createElement('div');
            maxBadge.className = 'text-muted-sm';
            maxBadge.style.color = 'var(--primary)';
            maxBadge.style.fontWeight = 'bold';
            maxBadge.textContent = 'MAX LEVEL';
            action.appendChild(maxBadge);
        } else {
            const btn = document.createElement('button');
            btn.className = 'act-btn primary';
            btn.innerHTML = `Upgrade<br><small>${nextLvData.cost}💰</small>`;
            btn.onclick = () => upgradeBuilding(id);
            action.appendChild(btn);
        }

        card.appendChild(info);
        card.appendChild(action);
        el.appendChild(card);
    }
}
