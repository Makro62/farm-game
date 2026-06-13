import { S, GameState } from '../core/state.js';
import { CROPS } from '../data/crops.js';
import { ANIMALS } from '../data/animals.js';

export function renderGrid() {
    const grid = document.getElementById('farm-grid');
    if (!grid) return;
    grid.innerHTML = '';
    S.plots.forEach((p, i) => {
        const d = document.createElement('div');
        d.className = 'plot ' + p.state + (p.watered ? ' watered' : '');
        d.dataset.idx = i;

        const emojiContainer = document.createElement('div');
        emojiContainer.className = 'plot-emoji';

        if (p.state === 'grass') emojiContainer.textContent = '🌿';
        else if (p.state === 'empty') emojiContainer.textContent = '🟫';
        else if (p.state === 'growing') {
            const elapsed = Date.now() - p.plantedAt;
            const progress = Math.min(100, (elapsed / p.growTime) * 100);
            emojiContainer.textContent = progress < 50 ? '🌱' : '🌿';
            if (p.watered) emojiContainer.textContent += '💧';

            const bar = document.createElement('div');
            bar.className = 'plot-progress';
            bar.innerHTML = `<div class="plot-progress-bar" style="width:${progress}%"></div>`;
            d.appendChild(bar);
        }
        else if (p.state === 'ready') {
            emojiContainer.textContent = CROPS[p.crop]?.emoji || '🌽';
        }

        d.appendChild(emojiContainer);
        if (typeof window.clickPlot === 'function') {
            d.onclick = () => window.clickPlot(i);
        }
        grid.appendChild(d);
    });

    // Gnome farmer
    if (S.gnomeActive) {
        const gnome = document.createElement('div');
        gnome.style.cssText = 'position: absolute; bottom: -20px; right: 20px; font-size: 50px; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.4)); animation: gnomeWalk 5s linear infinite; z-index: 50; pointer-events: none;';
        gnome.innerHTML = '🧑‍🌾<div class="text-muted-sm" style="font-weight:bold; color:white; background:rgba(0,0,0,0.5); border-radius:4px; padding:2px; text-align:center;">Petani</div>';
        grid.appendChild(gnome);
        grid.style.position = 'relative';
    }
}

export function renderWanderingAnimals() {
    const area = document.getElementById('farm-animals-area');
    if (!area) return;
    area.innerHTML = '';
    if (!S.animals || S.animals.length === 0) return;

    S.animals.forEach(a => {
        const conf = ANIMALS[a.type];
        if (!conf) return;

        const d = document.createElement('div');
        d.className = 'animal' + (a.flip ? ' flipped' : '') + (a.readyToCollect ? ' ready-to-collect' : '');
        d.id = `animal-${a.id}`;

        let progress = 100;
        if (!a.readyToCollect) {
            const elapsed = conf.time - (a.nextProduceAt - Date.now());
            progress = Math.max(0, Math.min(100, (elapsed / conf.time) * 100));
        }

        const imgSrc = a.type === 'chicken' ? 'img/chicken.png' : (a.type === 'cow' ? 'img/cow.png' : '');
        const imgSize = a.type === 'cow' ? '75px' : '55px';
        let emojiHtml;
        if (imgSrc) {
            emojiHtml = `<img src="${imgSrc}" style="width:${imgSize}; height:${imgSize}; object-fit:contain; filter: drop-shadow(0 4px 4px rgba(0,0,0,0.4));" onerror="this.style.display='none'; this.nextSibling.style.display='block'"><div class="animal-emoji" style="display:none; font-size:50px;">${conf.emoji}</div>`;
        } else {
            emojiHtml = `<div class="animal-emoji" style="font-size:50px;">${conf.emoji}</div>`;
        }

        d.innerHTML = `
            <div class="animal-progress">
                <div class="animal-progress-bar" style="width: ${progress}%"></div>
            </div>
            ${emojiHtml}
        `;

        d.style.left = a.x + '%';
        d.style.top = a.y + '%';

        area.appendChild(d);

        if (a.readyToCollect) {
            const prod = document.createElement('div');
            prod.className = 'animal-product';
            prod.textContent = conf.productEmoji;
            prod.style.left = (a.x + 2) + '%';
            prod.style.top = (a.y - 15) + '%';
            if (typeof window.collectAnimalProduct === 'function') {
                prod.onclick = (e) => { e.stopPropagation(); window.collectAnimalProduct(a.id); };
            }
            area.appendChild(prod);
        }
    });

    if (S.gnomeActive) {
        const gnome = document.createElement('div');
        gnome.style.cssText = 'position: absolute; bottom: 10px; left: 10px; font-size: 50px; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.4)); animation: gnomeWalk 6s linear infinite; z-index: 50; pointer-events: none;';
        gnome.innerHTML = '🧑‍🍳<div class="text-muted-sm" style="font-weight:bold; color:white; background:rgba(0,0,0,0.5); border-radius:4px; padding:2px; text-align:center;">Peternak</div>';
        area.appendChild(gnome);
    }
}
