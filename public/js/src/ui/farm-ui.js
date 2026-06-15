import { S, GameState } from '../core/state.js';
import { CROPS } from '../data/crops.js';
import { ANIMALS } from '../data/animals.js';
import { clickPlot } from '../systems/crop-system.js';
import { collectAnimalProduct, sellAnimal, getAnimalSellValue } from '../systems/animal-system.js';

/**
 * Build a consistent worker (gnome) element used across all tabs so the size
 * and label styling stay identical. Returns the DOM node.
 * @param {string} emoji - Worker face emoji
 * @param {string} label - Worker name label
 * @param {string} variantClass - Extra class ('animal-worker' | 'town-worker' | '')
 */
function createWorker(emoji, label, variantClass = '') {
    const worker = document.createElement('div');
    worker.className = 'gnome-worker' + (variantClass ? ' ' + variantClass : '');
    worker.innerHTML = `<span class="gnome-face">${emoji}</span><div class="gnome-label">${label}</div>`;
    return worker;
}

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

    // Gnome farmer — patrols around the field
    if (S.gnomeFarmActive) {
        grid.appendChild(createWorker('🧙‍♂️', 'Petani'));
        grid.style.position = 'relative';
    }
}

export function renderAnimals() {
    const container = document.getElementById('animal-grid-container');
    if (!container) return;

    container.innerHTML = '';

    import('../systems/building-system.js').then(({ getBuildingEffect }) => {
        const maxAnimals = getBuildingEffect('barn') || 2;
        const currentAnimalsCount = S.animals ? S.animals.length : 0;

        // Render occupied slots
        if (S.animals) {
            S.animals.forEach(a => {
                const conf = ANIMALS[a.type];
                if (!conf) return;

                const d = document.createElement('div');
                d.className = 'animal-slot occupied' + (a.readyToCollect ? ' ready-to-collect' : '');
                d.title = a.readyToCollect
                    ? `Klik untuk mengambil ${conf.product}`
                    : `${conf.name} sedang menghasilkan ${conf.product}...`;

                let progress = 100;
                if (!a.readyToCollect) {
                    const elapsed = conf.time - (a.nextProduceAt - Date.now());
                    progress = Math.max(0, Math.min(100, (elapsed / conf.time) * 100));
                }

                const imgSrc = conf.img || '';
                const imgSize = a.type === 'cow' ? '60px' : '45px';
                let emojiHtml;
                if (imgSrc) {
                    emojiHtml = `<img src="${imgSrc}" style="width:${imgSize}; height:${imgSize}; object-fit:contain; filter: drop-shadow(0 4px 4px rgba(0,0,0,0.4));" onerror="this.style.display='none'; this.nextSibling.style.display='block'"><div class="animal-emoji" style="display:none; font-size:40px;">${conf.emoji}</div>`;
                } else {
                    emojiHtml = `<div class="animal-emoji" style="font-size:40px;">${conf.emoji}</div>`;
                }

                d.innerHTML = `
                    <div class="animal-progress" style="position: absolute; top: 5px; width: 80%; left: 10%;">
                        <div class="animal-progress-bar" style="width: ${progress}%"></div>
                    </div>
                    ${emojiHtml}
                    <div class="animal-name">${conf.name}</div>
                `;

                // Click the whole slot to collect when the product is ready.
                if (a.readyToCollect) {
                    d.onclick = () => collectAnimalProduct(a.id);

                    const prod = document.createElement('div');
                    prod.className = 'animal-product';
                    prod.textContent = conf.productEmoji;
                    prod.style.position = 'absolute';
                    prod.style.top = '-15px';
                    prod.style.right = '-15px';
                    prod.onclick = (e) => { e.stopPropagation(); collectAnimalProduct(a.id); };
                    d.appendChild(prod);
                }

                // Sell button (always available) — refunds part of the price.
                const sellBtn = document.createElement('button');
                sellBtn.className = 'animal-sell-btn';
                sellBtn.textContent = '💰';
                sellBtn.title = `Jual ${conf.name} (+${getAnimalSellValue(a.type)}💰)`;
                sellBtn.onclick = (e) => { e.stopPropagation(); sellAnimal(a.id); };
                d.appendChild(sellBtn);

                container.appendChild(d);
            });
        }

        // Render empty slots
        for (let i = currentAnimalsCount; i < maxAnimals; i++) {
            const d = document.createElement('div');
            d.className = 'animal-slot empty';
            d.innerHTML = `<span class="plus-icon">+</span>`;
            d.onclick = () => {
                import('../managers/notification-manager.js').then(({ NotificationManager }) => {
                    NotificationManager.toast('Beli hewan di menu sebelah kiri', 'info');
                });
            };
            container.appendChild(d);
        }

        // Worker (peternak) — reuse the shared worker component for a consistent
        // size and patrol behaviour across tabs.
        const area = container.parentElement;
        area.querySelectorAll('.gnome-worker').forEach(g => g.remove());
        if (S.gnomeAnimalActive) {
            area.style.position = 'relative';
            area.appendChild(createWorker('🧑‍🍳', 'Peternak', 'animal-worker'));
        }
    });
}

/**
 * Render the town worker as a fisherman standing at the lake — shown whenever
 * the player owns the Pedagang/Pemancing Kota worker. Uses the shared worker
 * component for a consistent size across tabs.
 */
export function renderTownWorker() {
    const lake = document.getElementById('lake-container');
    if (!lake) return;

    lake.querySelectorAll('.gnome-worker').forEach(g => g.remove());

    if (!S.merchantOwned || !S.merchantActive) return;

    const worker = document.createElement('div');
    worker.className = 'gnome-worker town-worker';
    worker.innerHTML =
        '<div class="fisher-body"><span class="gnome-face">🧑‍🌾</span><span class="fishing-rod">🎣</span></div>' +
        '<div class="gnome-label">Pemancing</div>';
    lake.appendChild(worker);
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
