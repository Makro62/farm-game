import { S } from '../core/state.js';
import { CRAFTING_RECIPES } from '../data/crafting.js';
import { getItemData } from '../data/items.js';
import { startCrafting, claimCraftedItem } from '../systems/crafting-system.js';

export function renderCrafting() {
    const recipeEls = {
        farm: document.getElementById('crafting-recipes-farm'),
        animal: document.getElementById('crafting-recipes-animal'),
        fish: document.getElementById('crafting-recipes-fish')
    };
    const queueEls = {
        farm: document.getElementById('crafting-queue-farm'),
        animal: document.getElementById('crafting-queue-animal'),
        fish: document.getElementById('crafting-queue-fish')
    };

    Object.values(recipeEls).forEach(el => { if (el) el.innerHTML = ''; });
    Object.values(queueEls).forEach(el => { if (el) el.innerHTML = ''; });

    const queueCount = { farm: 0, animal: 0, fish: 0 };

    // Helper to render recipe card
    const createRecipeCard = (id, recipe) => {
        const isLocked = S.level < recipe.minLv;
        const card = document.createElement('div');
        card.style.cssText = `
            background: var(--panel-bg); border-radius: 12px; padding: 12px;
            display: flex; flex-direction: column; gap: 8px;
            border: 2px solid ${isLocked ? 'rgba(0,0,0,0.05)' : 'var(--primary)'};
            opacity: ${isLocked ? '0.6' : '1'};
        `;

        let reqs = [];
        for (const [item, qty] of Object.entries(recipe.ingredients)) {
            const has = S.inventory[item] || 0;
            const color = has >= qty ? 'var(--primary)' : 'var(--accent)';
            const itemInfo = getItemData(item);
            reqs.push(`<span style="color: ${color}">${itemInfo.emoji} ${has}/${qty} ${itemInfo.name}</span>`);
        }

        card.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div class="ui-card-title">
                    <span class="ui-card-emoji">${recipe.emoji}</span> ${recipe.name}
                </div>
                <div class="text-muted-sm">⏱️ ${recipe.time / 1000}s</div>
            </div>
            <div class="text-muted-sm">${recipe.desc}</div>
            <div class="ui-card-reqs">
                Bahan: ${reqs.join(', ')}
            </div>
            <div class="ui-card-value">
                Nilai Jual: ${recipe.reward}💰 (+${recipe.xp}✨)
            </div>
        `;

        const btn = document.createElement('button');
        btn.className = 'act-btn primary';
        if (isLocked) {
            btn.textContent = `Terkunci (Lv ${recipe.minLv})`;
            btn.style.background = 'var(--muted)';
            btn.disabled = true;
        } else {
            btn.textContent = 'Mulai Produksi';
            btn.onclick = () => startCrafting(id);
        }
        card.appendChild(btn);
        return card;
    };

    // Helper to render queue card
    const createQueueCard = (task, recipe) => {
        const qCard = document.createElement('div');
        qCard.style.cssText = `
            background: var(--panel-bg); border-radius: 12px; padding: 12px;
            display: flex; justify-content: space-between; align-items: center;
            border: 2px solid ${task.ready ? 'var(--primary)' : 'rgba(0,0,0,0.1)'};
        `;

        const info = document.createElement('div');
        info.innerHTML = `<div class="ui-card-title"><span class="ui-card-emoji">${recipe.emoji}</span> ${recipe.name}</div>`;

        const action = document.createElement('div');
        if (task.ready) {
            const btn = document.createElement('button');
            btn.className = 'act-btn primary';
            btn.textContent = 'Ambil 🎉';
            btn.onclick = () => claimCraftedItem(task.id);
            action.appendChild(btn);
        } else {
            const prog = document.createElement('div');
            prog.className = 'text-muted-sm';
            prog.style.fontWeight = 'bold';
            prog.textContent = 'Sedang dimasak... ⏳';
            action.appendChild(prog);
        }

        qCard.appendChild(info);
        qCard.appendChild(action);
        return qCard;
    };

    // Render Recipes by tab
    for (const [id, recipe] of Object.entries(CRAFTING_RECIPES)) {
        const target = recipeEls[recipe.tab];
        if (target) target.appendChild(createRecipeCard(id, recipe));
    }

    // Render Queue by tab
    if (S.craftingQueue && S.craftingQueue.length > 0) {
        S.craftingQueue.forEach(task => {
            const recipe = CRAFTING_RECIPES[task.recipeId];
            if (!recipe) return;
            const target = queueEls[recipe.tab];
            if (target) {
                target.appendChild(createQueueCard(task, recipe));
                queueCount[recipe.tab]++;
            }
        });
    }

    // Empty-state message per kitchen
    Object.keys(queueEls).forEach(tab => {
        const el = queueEls[tab];
        if (el && queueCount[tab] === 0) {
            el.innerHTML = '<div class="text-muted-sm" style="text-align:center; padding: 10px;">Dapur sedang kosong.</div>';
        }
    });
}
