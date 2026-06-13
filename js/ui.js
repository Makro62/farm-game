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
    updateTopbar();
    updateBoosters();
    document.getElementById('achieve-count').textContent = `${S.achievements.length} / ${ACHIEVEMENTS.length}`;
}

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
        btn.innerHTML = `${c.emoji} ${c.name} <span class="price">×${S.seeds[k]||0}</span>`;
        btn.onclick = () => {
            if (locked) { toast(`Butuh Level ${c.minLv}!`, 'warn'); return; }
            selectedCrop = k;
            renderCropList();
        };
        el.appendChild(btn);
    }
}


function renderDecorations() {
    const el = document.getElementById('deco-list');
    if (!el) return;
    el.innerHTML = '';
    
    if (S.level < 5) {
        el.innerHTML = '<div style="font-size:11px;color:var(--muted)">Terbuka di Level 5</div>';
        return;
    }

    for (const [k, d] of Object.entries(DECORATIONS)) {
        const owned = S.decorations && S.decorations.includes(k);
        const btn = document.createElement('button');
        btn.className = 'shop-btn' + (owned ? ' locked' : '');
        btn.innerHTML = `${d.emoji} ${d.name} (+${d.prestige}✨) <span class="price">${owned ? 'Dimiliki' : d.cost + '💰'}</span>`;
        if (!owned) {
            btn.onclick = () => buyDecoration(k);
        } else {
            btn.style.borderColor = 'var(--primary)';
            btn.style.background = 'rgba(76, 175, 80, 0.1)';
        }
        el.appendChild(btn);
    }
}

function renderGrid() {
    const grid = document.getElementById('farm-grid');
    grid.innerHTML = '';
    S.plots.forEach((p, i) => {
        const d = document.createElement('div');
        d.className = 'plot ' + p.state;
        d.dataset.idx = i;
        
        // Create emoji container for proper positioning
        const emojiContainer = document.createElement('div');
        emojiContainer.className = 'plot-emoji';
        
        if (p.state === 'grass') emojiContainer.textContent = '🌿';
        else if (p.state === 'empty') emojiContainer.textContent = '🟫';
        else if (p.state === 'growing') {
            const c = CROPS[p.crop];
            const elapsed = Date.now() - p.plantedAt;
            const progress = Math.min(100, (elapsed / p.growTime) * 100);
            emojiContainer.textContent = progress < 50 ? '🌱' : '🌿';
            
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
}

function renderInventory() {
    const el = document.getElementById('inv-list');
    let html = '', total = 0;
    for (const [k, qty] of Object.entries(S.inventory)) {
        if (qty > 0) {
            const c = CROPS[k];
            const val = qty * c.reward;
            total += val;
            html += `<div class="inv-row"><span class="inv-ic">${c.emoji}</span>${c.name}<span class="inv-qty">×${qty}</span><span class="inv-val">${val}💰</span></div>`;
        }
    }
    if (!html) html = '<div style="font-size:11px;color:var(--muted);padding:8px">Kosong</div>';
    else html += `<div style="text-align:right;font-size:12px;font-weight:700;color:var(--primary);margin-top:6px">Total: ${total}💰</div>`;
    el.innerHTML = html;
}

function renderQuests() {
    const el = document.getElementById('quest-list');
    if (!S.quests.length) { el.innerHTML = '<div style="font-size:11px;color:var(--muted)">Memuat...</div>'; return; }
    el.innerHTML = S.quests.map(q => 
        `<div class="quest-item ${q.done?'done':''}">${q.done?'✅':'☐'} ${q.desc}<br><small>${q.progress}/${q.target} → ${q.reward}💰</small></div>`
    ).join('');
}

function updateTopbar() {
    document.getElementById('coin-val').textContent = S.coins.toLocaleString();
    document.getElementById('level-val').textContent = S.level;
    const needed = S.level * 100;
    document.getElementById('xp-val').textContent = S.xp;
    document.getElementById('xp-need').textContent = needed;
    document.getElementById('xp-bar').style.width = Math.min(100, (S.xp / needed) * 100) + '%';
    
    const w = WEATHERS[S.weather];
    document.getElementById('weather-chip').textContent = `${w.icon} ${w.name}`;
    document.getElementById('weather-icon').textContent = w.icon;
    document.getElementById('weather-name').textContent = w.name;
    
    const elapsed = Date.now() - S.weatherChangedAt;
    const remaining = Math.max(0, WEATHER_INTERVAL - elapsed);
    const min = Math.floor(remaining / 60000);
    const sec = Math.floor((remaining % 60000) / 1000);
    document.getElementById('weather-timer').textContent = `Next: ${min}:${sec.toString().padStart(2,'0')}`;
    
    const pVal = document.getElementById('prestige-val');
    if (pVal) pVal.textContent = S.prestige || 0;
}

// ============================================================
// UI HELPERS
// ============================================================

function pop(idx, txt) {
    const cell = document.getElementById('farm-grid').children[idx];
    if (!cell) return;
    const el = document.createElement('div');
    el.className = 'pop-float';
    el.textContent = txt;
    cell.appendChild(el);
    setTimeout(() => el.remove(), 900);
}

function toast(msg, type='info') {
    const el = document.createElement('div');
    el.className = 'toast ' + type;
    el.textContent = msg;
    document.getElementById('toast-container').appendChild(el);
    setTimeout(() => {
        el.style.opacity = '0';
        el.style.transform = 'translateX(20px)';
        setTimeout(() => el.remove(), 300);
    }, 3000);
}

function showModal(title, msg, onOk) {
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-msg').textContent = msg;
    document.getElementById('modal').classList.add('show');
    document.getElementById('modal-ok').onclick = () => { closeModal(); onOk(); };
}
function closeModal() { document.getElementById('modal').classList.remove('show'); }

function confirmReset() {
    showModal('🔄 Reset Game', 'Semua progress akan hilang. Yakin?', () => {
        localStorage.removeItem(SAVE_KEY);
        location.reload();
    });
}

function updateBoosters() {
    const now = Date.now();
    const gBtn = document.getElementById('btn-boost-growth');
    if (gBtn) {
        if (S.boosters.growth > now) {
            const rem = Math.ceil((S.boosters.growth - now)/1000);
            gBtn.innerHTML = `⚡ Growth (${Math.floor(rem/60)}:${(rem%60).toString().padStart(2,'0')})`;
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
            const rem = Math.ceil((S.boosters.coin - now)/1000);
            cBtn.innerHTML = `💰 Coin (${Math.floor(rem/60)}:${(rem%60).toString().padStart(2,'0')})`;
            cBtn.style.background = 'rgba(76, 175, 80, 0.2)';
            cBtn.style.borderColor = 'var(--primary)';
        } else {
            cBtn.innerHTML = `💰 Coin ×2 <span class="price">100💰</span>`;
            cBtn.style.background = '';
            cBtn.style.borderColor = '';
        }
    }
}
