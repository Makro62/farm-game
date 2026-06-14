import { S, GameState } from '../core/state.js';
import { CROPS } from '../data/crops.js';
import { ANIMALS } from '../data/animals.js';
import { clickPlot } from '../systems/crop-system.js';
import { collectAnimalProduct } from '../systems/animal-system.js';

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
        d.onclick = () => clickPlot(i);
        grid.appendChild(d);
    });

    // Gnome farmer
    if (S.gnomeFarmActive) {
        const gnome = document.createElement('div');
        gnome.style.cssText = 'position: absolute; bottom: -20px; right: 20px; font-size: 50px; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.4)); animation: gnomeWalk 5s linear infinite; z-index: 50; pointer-events: none;';
        gnome.innerHTML = '🧙‍♂️<div class="text-muted-sm" style="font-weight:bold; color:white; background:rgba(0,0,0,0.5); border-radius:4px; padding:2px; text-align:center;">Petani</div>';
        grid.appendChild(gnome);
        grid.style.position = 'relative';
    }
}

export function renderAnimals() {
    const area = document.getElementById('farm-animals-area');
    if (!area) return;

    // We don't want to clear the whole area because it contains the background decorations now (barn, fence).
    // Instead we will clear only the animal elements. We can give animals a class 'animal-el' to remove them.
    const existingAnimals = area.querySelectorAll('.animal');
    existingAnimals.forEach(el => el.remove());
    const existingProducts = area.querySelectorAll('.animal-product');
    existingProducts.forEach(el => el.remove());
    const existingGnome = area.querySelectorAll('.gnome-el');
    existingGnome.forEach(el => el.remove());

    if (!S.animals || S.animals.length === 0) return;

    S.animals.forEach(a => {
        const conf = ANIMALS[a.type];
        if (!conf) return;

        const d = document.createElement('div');
        d.className = 'animal animal-el' + (a.flip ? ' flipped' : '') + (a.readyToCollect ? ' ready-to-collect' : '');
        d.id = `animal-${a.id}`;

        let progress = 100;
        if (!a.readyToCollect) {
            const elapsed = conf.time - (a.nextProduceAt - Date.now());
            progress = Math.max(0, Math.min(100, (elapsed / conf.time) * 100));
        }

        const imgSrc = conf.img || '';
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
            prod.onclick = (e) => { e.stopPropagation(); collectAnimalProduct(a.id); };
            area.appendChild(prod);
        }
    });

    if (S.gnomeAnimalActive) {
        const gnome = document.createElement('div');
        gnome.className = 'gnome-el';
        gnome.style.cssText = 'position: absolute; bottom: 10px; left: 10px; font-size: 50px; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.4)); animation: gnomeWalk 6s linear infinite; z-index: 50; pointer-events: none;';
        gnome.innerHTML = '🧑‍🍳<div class="text-muted-sm" style="font-weight:bold; color:white; background:rgba(0,0,0,0.5); border-radius:4px; padding:2px; text-align:center;">Peternak</div>';
        area.appendChild(gnome);
    }
}

export function renderFishes() {
    const area = document.getElementById('fish-area');
    if (!area) return;

    area.innerHTML = '';
    
    if (!S.fishes || S.fishes.length === 0) return;

    import('../data/fishes.js').then(module => {
        const FISHES = module.FISHES;
        S.fishes.forEach(f => {
            const conf = FISHES[f.type];
            if (!conf) return;

            const el = document.createElement('div');
            el.style.cssText = `
                position: absolute; left: ${f.x}%; top: ${f.y}%;
                transform: translate(-50%, -50%);
                transition: left 1s linear, top 1s linear; cursor: pointer;
                z-index: ${Math.floor(f.y)}; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
            `;

            let progress = 100;
            if (!f.readyToCollect) {
                const elapsed = conf.time - (f.nextProduceAt - Date.now());
                progress = Math.max(0, Math.min(100, (elapsed / conf.time) * 100));
            }

            el.innerHTML = `
                <div style="position:relative;">
                    <div style="width: 40px; height: 6px; background: rgba(0,0,0,0.2); border-radius: 3px; position: absolute; top: -10px; left: 50%; transform: translateX(-50%); overflow: hidden;">
                        <div style="height: 100%; background: #4CAF50; width: ${progress}%;"></div>
                    </div>
                    <span style="font-size: 40px; display:inline-block; transform: scaleX(${f.flip ? -1 : 1});">${conf.emoji}</span>
                    <div style="position: absolute; top: -10px; right: -10px; font-size: 20px; animation: bounce 1s infinite; display: ${f.readyToCollect ? 'block' : 'none'};">✨</div>
                </div>
            `;

            if (f.readyToCollect) {
                el.onclick = () => window.collectFish && window.collectFish(f.id);
            } else {
                const timeL = Math.max(0, Math.ceil((f.nextProduceAt - Date.now()) / 1000));
                el.title = `Panen dalam ${timeL}s`;
            }
            area.appendChild(el);
        });
    });
}
