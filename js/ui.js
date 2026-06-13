// ============================================================
// RENDER
// ============================================================

function render() {
    renderShop();
    renderCropList();
    renderDecorations();
    renderGrid();
    renderInventory();
    renderQuests();
    renderAnimalsList();
    renderWanderingAnimals();
    renderOrders();
    updateTopbar();
    updateBoosters();

    const achieveCount = document.getElementById('achieve-count');
    if (achieveCount) {
        achieveCount.textContent = `${S.achievements.length} / ${ACHIEVEMENTS.length}`;
    }

    const btnBuyGnome = document.getElementById('btn-buy-gnome');
    if (btnBuyGnome) {
        btnBuyGnome.style.display = S.gnomeOwned ? 'none' : 'flex';
    }

    const btnToggleGnome = document.getElementById('btn-toggle-gnome');
    if (btnToggleGnome) {
        if (S.gnomeOwned) {
            btnToggleGnome.style.display = 'inline-block';
            btnToggleGnome.textContent = S.gnomeActive ? '🧙‍♂️ Auto: ON' : '🧙‍♂️ Auto: OFF';
            btnToggleGnome.style.background = S.gnomeActive
                ? 'linear-gradient(135deg, #a855f7, #9333ea)'
                : 'var(--muted)';
        } else {
            btnToggleGnome.style.display = 'none';
        }
    }
}

// ============================================================
// SHOP & CROP LIST
// ============================================================

function renderShop() {
    const el = document.getElementById('shop-list');
    el.innerHTML = '';
    for (const [k, c] of Object.entries(CROPS)) {
        const locked = S.level < c.minLv;
        const btn = document.createElement('button');
        btn.className = 'shop-btn' + (locked ? ' locked' : '');
        btn.innerHTML = `${c.emoji} ${c.name} <span class="price">${c.cost}💰</span>`;
        btn.onclick = () => buySeed(k);
        if (locked) btn.title = `Butuh Level ${c.minLv}`;
        el.appendChild(btn);
    }
}

function renderCropList() {
    const el = document.getElementById('crop-list');
    el.innerHTML = '';
    for (const [k, c] of Object.entries(CROPS)) {
        const locked = S.level < c.minLv;
        const btn = document.createElement('button');
        btn.className = 'crop-btn' + (locked ? ' locked' : '') + (selectedCrop === k ? ' selected' : '');
        btn.innerHTML = `${c.emoji} ${c.name} <span class="price">×${S.seeds[k] || 0}</span>`;
        btn.onclick = () => {
            if (locked) { toast(`Butuh Level ${c.minLv}!`, 'warn'); return; }
            selectedCrop = k;
            renderCropList();
        };
        el.appendChild(btn);
    }
}

// ============================================================
// DECORATIONS
// ============================================================

function renderDecorations() {
    const el = document.getElementById('deco-list');
    if (!el) return;
    el.innerHTML = '';

    const farmArea = document.getElementById('farm-decorations-area');
    if (farmArea) farmArea.innerHTML = '';

    if (S.level < 5) {
        el.innerHTML = '<div style="font-size:11px;color:var(--muted)">Terbuka di Level 5</div>';
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

// ============================================================
// ANIMALS LIST (Sidebar)
// ============================================================

function renderAnimalsList() {
    const el = document.getElementById('animal-list');
    if (!el) return;
    el.innerHTML = '';

    for (const [k, a] of Object.entries(ANIMALS)) {
        const locked = S.level < a.minLv;
        const count = S.animals ? S.animals.filter(x => x.type === k).length : 0;
        const btn = document.createElement('button');
        btn.className = 'shop-btn' + (locked ? ' locked' : '');
        btn.innerHTML = `<span style="font-size:22px; vertical-align:middle; margin-right:4px;">${a.emoji}</span> ${a.name} <span class="price">${a.cost}💰</span>`;
        if (locked) {
            btn.innerHTML += `<div style="font-size:11px; margin-top:4px; color:var(--secondary)">Lv ${a.minLv} Terbuka</div>`;
        }
        if (count > 0) {
            btn.innerHTML += `<div style="font-size:11px; color:var(--primary)">Dimiliki: ${count}</div>`;
        }
        btn.onclick = () => buyAnimal(k);
        el.appendChild(btn);
    }
}

// ============================================================
// WANDERING ANIMALS (Barn)
// ============================================================

function renderWanderingAnimals() {
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

        // Use img with fallback to emoji
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
            prod.onclick = (e) => { e.stopPropagation(); collectAnimalProduct(a.id); };
            area.appendChild(prod);
        }
    });

    // Gnome in barn
    if (S.gnomeActive) {
        const gnome = document.createElement('div');
        gnome.style.cssText = 'position: absolute; bottom: 10px; left: 10px; font-size: 50px; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.4)); animation: gnomeWalk 6s linear infinite; z-index: 50; pointer-events: none;';
        gnome.innerHTML = '🧑‍🍳<div style="font-size:12px; font-weight:bold; color:white; background:rgba(0,0,0,0.5); border-radius:4px; padding:2px; text-align:center;">Peternak</div>';
        area.appendChild(gnome);
    }
}

// ============================================================
// ORDERS
// ============================================================

function renderOrders() {
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

    // Gnome courier
    if (S.gnomeActive) {
        const gnome = document.createElement('div');
        gnome.style.cssText = 'position: relative; flex: 0 0 100px; display: flex; flex-direction: column; align-items: center; justify-content: center; font-size: 50px; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.4)); animation: bounceGlow 2s infinite; pointer-events: none;';
        gnome.innerHTML = '🧑‍💼<div style="font-size:12px; font-weight:bold; color:white; background:rgba(0,0,0,0.5); border-radius:4px; padding:2px; text-align:center;">Kurir</div>';
        el.appendChild(gnome);
    }
}

// ============================================================
// FARM GRID
// ============================================================

function renderGrid() {
    const grid = document.getElementById('farm-grid');
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
    if (S.gnomeActive) {
        const gnome = document.createElement('div');
        gnome.style.cssText = 'position: absolute; bottom: -20px; right: 20px; font-size: 50px; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.4)); animation: gnomeWalk 5s linear infinite; z-index: 50; pointer-events: none;';
        gnome.innerHTML = '🧑‍🌾<div style="font-size:12px; font-weight:bold; color:white; background:rgba(0,0,0,0.5); border-radius:4px; padding:2px; text-align:center;">Petani</div>';
        grid.appendChild(gnome);
        grid.style.position = 'relative';
    }
}

// ============================================================
// INVENTORY & QUESTS
// ============================================================

function renderInventory() {
    const el = document.getElementById('inv-list');
    let html = '', total = 0;
    for (const [k, qty] of Object.entries(S.inventory)) {
        if (qty > 0) {
            const c = CROPS[k];
            if (!c) continue;
            const val = qty * c.reward;
            total += val;
            html += `<div class="inv-row"><span class="inv-ic">${c.emoji}</span>${c.name}<span class="inv-qty">×${qty}</span><span class="inv-val">${val}💰</span></div>`;
        }
    }

    const cap = S.inventoryCapacity || 50;
    const used = getInventoryTotal();
    const fillPercent = Math.min(100, (used / cap) * 100);

    if (!html) {
        html = '<div style="font-size:11px;color:var(--muted);padding:8px">Kosong</div>';
    } else {
        html += `<div style="text-align:right;font-size:12px;font-weight:700;color:var(--primary);margin-top:6px">Total: ${total}💰</div>`;
    }

    // Silo meter
    html += `<div style="margin-top:8px; font-size:11px; color:var(--muted);">📦 Silo: ${used}/${cap}</div>`;
    html += `<div class="silo-bar-outer"><div class="silo-bar-inner" style="width:${fillPercent}%"></div></div>`;

    el.innerHTML = html;
}

function renderQuests() {
    const el = document.getElementById('quest-list');
    if (!S.quests || !S.quests.length) { el.innerHTML = '<div style="font-size:11px;color:var(--muted)">Memuat...</div>'; return; }
    el.innerHTML = S.quests.map(q =>
        `<div class="quest-item ${q.done ? 'done' : ''}">${q.done ? '✅' : '☐'} ${q.desc}<br><small>${q.progress}/${q.target} → ${q.reward}💰</small></div>`
    ).join('');
}

// ============================================================
// TOPBAR
// ============================================================

function updateTopbar() {
    document.getElementById('coin-val').textContent = S.coins.toLocaleString();
    document.getElementById('level-val').textContent = S.level;
    const needed = S.level * 100;
    document.getElementById('xp-val').textContent = S.xp;
    document.getElementById('xp-need').textContent = needed;
    document.getElementById('xp-bar').style.width = Math.min(100, (S.xp / needed) * 100) + '%';

    const w = WEATHERS[S.weather];
    if (w) {
        document.getElementById('weather-chip').textContent = `${w.icon} ${w.name}`;
        document.getElementById('weather-icon').textContent = w.icon;
        document.getElementById('weather-name').textContent = w.name;
    }

    const elapsed = Date.now() - S.weatherChangedAt;
    const remain = Math.max(0, Math.ceil((WEATHER_INTERVAL - elapsed) / 1000));
    document.getElementById('weather-timer').textContent = `Next: ${Math.floor(remain / 60)}:${(remain % 60).toString().padStart(2, '0')}`;

    // Silo display
    const cap = S.inventoryCapacity || 50;
    const used = getInventoryTotal();
    const siloCapDisplay = document.getElementById('silo-cap-display');
    if (siloCapDisplay) {
        siloCapDisplay.textContent = cap;
        document.getElementById('silo-max-display').textContent = cap;
        document.getElementById('silo-used-display').textContent = used;
        document.getElementById('silo-price-display').textContent = (cap * 10) + '💰';
        document.getElementById('silo-used-display').style.color = (used >= cap) ? '#ef4444' : 'var(--muted)';
    }

    const pVal = document.getElementById('prestige-val');
    if (pVal) pVal.textContent = S.prestige || 0;
}

// ============================================================
// UI HELPERS
// ============================================================

function spawnParticles(idx, ...texts) {
    const grid = document.getElementById('farm-grid');
    if (!grid) return;
    const cell = grid.children[idx];
    if (!cell) return;

    texts.forEach((txt, index) => {
        const p = document.createElement('div');
        p.className = 'particle';
        p.textContent = txt;

        const offsetX = (Math.random() - 0.5) * 40;
        p.style.left = `calc(50% + ${offsetX}px - 10px)`;
        p.style.top = '20%';
        p.style.animationDelay = (index * 0.15) + 's';

        cell.appendChild(p);
        setTimeout(() => p.remove(), 1500);
    });
}

function toast(msg, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const el = document.createElement('div');
    el.className = 'toast ' + type;
    el.textContent = msg;
    container.appendChild(el);

    // Don't stack more than 3
    while (container.children.length > 3) {
        container.removeChild(container.children[0]);
    }

    setTimeout(() => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(-20px)';
        setTimeout(() => el.remove(), 300);
    }, 2500);
}

function showModal(title, msg, onOk) {
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-msg').textContent = msg;
    document.getElementById('modal').classList.add('show');
    document.getElementById('modal-ok').onclick = () => { closeModal(); onOk(); };
}
function closeModal() { document.getElementById('modal').classList.remove('show'); }

// ============================================================
// GNOME UI
// ============================================================

function buyGnome() {
    if (S.gnomeOwned) {
        toast('Anda sudah mempekerjakan kurcaci!', 'warn');
        return;
    }
    if (S.coins >= 5000) {
        S.coins -= 5000;
        S.gnomeOwned = true;
        S.gnomeActive = true;
        playSound('levelup');
        toast('🧙‍♂️ Trio Kurcaci berhasil dipekerjakan!', 'success');
        render();
    } else {
        playSound('error');
        toast('Koin tidak cukup! Butuh 5000💰', 'warn');
    }
}

function toggleGnome() {
    S.gnomeActive = !S.gnomeActive;
    toast(`🧙‍♂️ Kurcaci ${S.gnomeActive ? 'Aktif' : 'Beristirahat'}`, 'info');
    render();
}

function confirmReset() {
    showModal('🔄 Reset Game', 'Semua progress akan hilang. Yakin?', () => {
        localStorage.removeItem(SAVE_KEY);
        location.reload();
    });
}

function toggleFullScreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            console.log(`Fullscreen error: ${err.message}`);
        });
    } else {
        if (document.exitFullscreen) document.exitFullscreen();
    }
}

function updateBoosters() {
    const now = Date.now();
    const gBtn = document.getElementById('btn-boost-growth');
    if (gBtn) {
        if (S.boosters.growth > now) {
            const rem = Math.ceil((S.boosters.growth - now) / 1000);
            gBtn.innerHTML = `⚡ Growth (${Math.floor(rem / 60)}:${(rem % 60).toString().padStart(2, '0')})`;
            gBtn.style.background = 'rgba(76, 175, 80, 0.2)';
            gBtn.style.borderColor = 'var(--primary)';
        } else {
            gBtn.innerHTML = `⚡ Growth ×1.5 <span class="price">50💰</span>`;
            gBtn.style.background = '';
            gBtn.style.borderColor = '';
        }
    }

    const cBtn = document.getElementById('btn-boost-coin');
    if (cBtn) {
        if (S.boosters.coin > now) {
            const rem = Math.ceil((S.boosters.coin - now) / 1000);
            cBtn.innerHTML = `💰 Coin (${Math.floor(rem / 60)}:${(rem % 60).toString().padStart(2, '0')})`;
            cBtn.style.background = 'rgba(76, 175, 80, 0.2)';
            cBtn.style.borderColor = 'var(--primary)';
        } else {
            cBtn.innerHTML = `💰 Coin ×2 <span class="price">100💰</span>`;
            cBtn.style.background = '';
            cBtn.style.borderColor = '';
        }
    }
}
