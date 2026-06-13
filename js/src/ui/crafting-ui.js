import { S } from '../core/state.js';
import { CRAFTING_RECIPES } from '../data/crafting.js';
import { startCrafting, claimCraftedItem } from '../systems/crafting-system.js';

export function renderCrafting() {
    const recipesEl = document.getElementById('crafting-recipes');
    const queueEl = document.getElementById('crafting-queue');
    if (!recipesEl || !queueEl) return;

    // Render Recipes
    recipesEl.innerHTML = '';
    for (const [id, recipe] of Object.entries(CRAFTING_RECIPES)) {
        const isLocked = S.level < recipe.minLv;
        const card = document.createElement('div');
        card.style.cssText = `
            background: var(--panel-bg); border-radius: 12px; padding: 12px;
            display: flex; flex-direction: column; gap: 8px;
            border: 2px solid ${isLocked ? 'rgba(0,0,0,0.05)' : 'var(--primary)'};
            opacity: ${isLocked ? '0.6' : '1'};
        `;

        // Ingredients HTML
        let reqs = [];
        for (const [item, qty] of Object.entries(recipe.ingredients)) {
            const has = S.inventory[item] || 0;
            const color = has >= qty ? 'var(--primary)' : 'var(--accent)';
            reqs.push(`<span style="color: ${color}">${has}/${qty} ${item}</span>`);
        }

        card.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div style="font-weight: 800; font-size: 16px;">
                    <span style="font-size: 24px; vertical-align: middle;">${recipe.emoji}</span> ${recipe.name}
                </div>
                <div class="text-muted-sm">⏱️ ${recipe.time / 1000}s</div>
            </div>
            <div class="text-muted-sm">${recipe.desc}</div>
            <div style="font-size: 12px; font-weight: bold; background: rgba(0,0,0,0.05); padding: 4px 8px; border-radius: 6px;">
                Bahan: ${reqs.join(', ')}
            </div>
            <div style="color: var(--secondary); font-weight: bold; font-size: 14px;">
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
        recipesEl.appendChild(card);
    }

    // Render Queue
    queueEl.innerHTML = '';
    if (!S.craftingQueue || S.craftingQueue.length === 0) {
        queueEl.innerHTML = '<div class="text-muted-sm" style="text-align:center; padding: 20px;">Dapur sedang kosong.</div>';
    } else {
        S.craftingQueue.forEach(task => {
            const recipe = CRAFTING_RECIPES[task.recipeId];
            if (!recipe) return;

            const qCard = document.createElement('div');
            qCard.style.cssText = `
                background: var(--panel-bg); border-radius: 12px; padding: 12px; margin-bottom: 8px;
                display: flex; justify-content: space-between; align-items: center;
                border: 2px solid ${task.ready ? 'var(--primary)' : 'rgba(0,0,0,0.1)'};
            `;

            const info = document.createElement('div');
            info.innerHTML = `
                <div style="font-weight: 800; font-size: 16px;"><span style="font-size: 24px; vertical-align: middle;">${recipe.emoji}</span> ${recipe.name}</div>
            `;

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
                
                // We could do a live countdown here but for simplicity we show simple state
                prog.textContent = 'Sedang dimasak... ⏳';
                action.appendChild(prog);
            }

            qCard.appendChild(info);
            qCard.appendChild(action);
            queueEl.appendChild(qCard);
        });
    }
}
