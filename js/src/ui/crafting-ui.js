import { S } from '../core/state.js';
import { CRAFTING_RECIPES } from '../data/crafting.js';
import { startCrafting, claimCraftedItem } from '../systems/crafting-system.js';

export function renderCrafting() {
    const rFarm = document.getElementById('crafting-recipes-farm');
    const qFarm = document.getElementById('crafting-queue-farm');
    const rAnim = document.getElementById('crafting-recipes-animal');
    const qAnim = document.getElementById('crafting-queue-animal');

    if (rFarm) rFarm.innerHTML = '';
    if (qFarm) qFarm.innerHTML = '';
    if (rAnim) rAnim.innerHTML = '';
    if (qAnim) qAnim.innerHTML = '';

    // Track if queues are empty
    let hasFarmQueue = false;
    let hasAnimQueue = false;

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
        info.innerHTML = `<div style="font-weight: 800; font-size: 16px;"><span style="font-size: 24px; vertical-align: middle;">${recipe.emoji}</span> ${recipe.name}</div>`;

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

    // Render Recipes
    for (const [id, recipe] of Object.entries(CRAFTING_RECIPES)) {
        const card = createRecipeCard(id, recipe);
        if (recipe.tab === 'farm' && rFarm) rFarm.appendChild(card);
        else if (recipe.tab === 'animal' && rAnim) rAnim.appendChild(card);
    }

    // Render Queue
    if (S.craftingQueue && S.craftingQueue.length > 0) {
        S.craftingQueue.forEach(task => {
            const recipe = CRAFTING_RECIPES[task.recipeId];
            if (!recipe) return;
            const card = createQueueCard(task, recipe);
            
            if (recipe.tab === 'farm' && qFarm) {
                qFarm.appendChild(card);
                hasFarmQueue = true;
            } else if (recipe.tab === 'animal' && qAnim) {
                qAnim.appendChild(card);
                hasAnimQueue = true;
            }
        });
    }

    if (!hasFarmQueue && qFarm) {
        qFarm.innerHTML = '<div class="text-muted-sm" style="text-align:center; padding: 10px;">Dapur sedang kosong.</div>';
    }
    if (!hasAnimQueue && qAnim) {
        qAnim.innerHTML = '<div class="text-muted-sm" style="text-align:center; padding: 10px;">Dapur sedang kosong.</div>';
    }
}
