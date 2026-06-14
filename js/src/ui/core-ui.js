import { S } from '../core/state.js';
import { ACHIEVEMENTS, WEATHERS, CONFIG } from '../data/config.js';
import { getInventoryTotal } from '../systems/crop-system.js';
import { AudioManager } from '../managers/audio-manager.js';
import { NotificationManager } from '../managers/notification-manager.js';
import { getBuildingEffect } from '../systems/building-system.js';

export function setupTabs() {
    const tabs = document.querySelectorAll('.tab-btn');
    const panes = document.querySelectorAll('.tab-pane');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            panes.forEach(p => p.classList.remove('active'));
            
            tab.classList.add('active');
            const target = document.getElementById(tab.dataset.tab);
            if (target) target.classList.add('active');
        });
    });
}

export function render() {
    if (typeof window.renderShop === 'function') window.renderShop();
    if (typeof window.renderCropList === 'function') window.renderCropList();
    if (typeof window.renderDecorations === 'function') window.renderDecorations();
    if (typeof window.renderGrid === 'function') window.renderGrid();
    if (typeof window.renderInventory === 'function') window.renderInventory();
    if (typeof window.renderQuests === 'function') window.renderQuests();
    if (typeof window.renderAnimalsList === 'function') window.renderAnimalsList();
    if (typeof window.renderFishShopList === 'function') window.renderFishShopList();
    if (typeof window.renderAnimals === 'function') window.renderAnimals();
    if (typeof window.renderFishes === 'function') window.renderFishes();
    if (typeof window.renderOrders === 'function') window.renderOrders();
    if (typeof window.renderBuildings === 'function') window.renderBuildings();
    if (typeof window.renderCrafting === 'function') window.renderCrafting();
    updateTopbar();
    updateBoosters();

    const achieveCount = document.getElementById('achieve-count');
    if (achieveCount) {
        achieveCount.textContent = `${S.achievements.length} / ${ACHIEVEMENTS.length}`;
    }

    const btnBuyGnomeFarm = document.getElementById('btn-buy-gnome');
    if (btnBuyGnomeFarm) {
        btnBuyGnomeFarm.style.display = S.gnomeFarmOwned ? 'none' : 'flex';
    }

    const btnToggleGnomeFarm = document.getElementById('btn-toggle-gnome');
    if (btnToggleGnomeFarm) {
        if (S.gnomeFarmOwned) {
            btnToggleGnomeFarm.style.display = 'inline-block';
            btnToggleGnomeFarm.textContent = S.gnomeFarmActive ? '🧙‍♂️ Auto: ON' : '🧙‍♂️ Auto: OFF';
            btnToggleGnomeFarm.style.background = S.gnomeFarmActive
                ? 'linear-gradient(135deg, #a855f7, #9333ea)'
                : 'var(--muted)';
        } else {
            btnToggleGnomeFarm.style.display = 'none';
        }
    }

    const btnBuyGnomeAnimal = document.getElementById('btn-buy-gnome-animal');
    if (btnBuyGnomeAnimal) {
        btnBuyGnomeAnimal.style.display = S.gnomeAnimalOwned ? 'none' : 'flex';
    }

    const btnToggleGnomeAnimal = document.getElementById('btn-toggle-gnome-animal');
    if (btnToggleGnomeAnimal) {
        if (S.gnomeAnimalOwned) {
            btnToggleGnomeAnimal.style.display = 'inline-block';
            btnToggleGnomeAnimal.textContent = S.gnomeAnimalActive ? '🧑‍🍳 Auto: ON' : '🧑‍🍳 Auto: OFF';
            btnToggleGnomeAnimal.style.background = S.gnomeAnimalActive
                ? 'linear-gradient(135deg, #a855f7, #9333ea)'
                : 'var(--muted)';
        } else {
            btnToggleGnomeAnimal.style.display = 'none';
        }
    }
}

export function updateTopbar() {
    const elCoin = document.getElementById('coin-val');
    if(elCoin) elCoin.textContent = S.coins.toLocaleString();
    
    const elLevel = document.getElementById('level-val');
    if(elLevel) elLevel.textContent = S.level;
    
    const needed = S.level * 100;
    const elXpVal = document.getElementById('xp-val');
    if(elXpVal) elXpVal.textContent = S.xp;
    
    const elXpNeed = document.getElementById('xp-need');
    if(elXpNeed) elXpNeed.textContent = needed;
    
    const elXpBar = document.getElementById('xp-bar');
    if(elXpBar) elXpBar.style.width = Math.min(100, (S.xp / needed) * 100) + '%';

    const w = WEATHERS[S.weather];
    if (w) {
        const chip = document.getElementById('weather-chip');
        if(chip) chip.textContent = `${w.icon} ${w.name}`;
        const wIcon = document.getElementById('weather-icon');
        if(wIcon) wIcon.textContent = w.icon;
        const wName = document.getElementById('weather-name');
        if(wName) wName.textContent = w.name;
    }

    const elapsed = Date.now() - S.weatherChangedAt;
    const remain = Math.max(0, Math.ceil((CONFIG.WEATHER_INTERVAL - elapsed) / 1000));
    const wTimer = document.getElementById('weather-timer');
    if(wTimer) wTimer.textContent = `Next: ${Math.floor(remain / 60)}:${(remain % 60).toString().padStart(2, '0')}`;

    // Silo display
    const cap = getBuildingEffect('silo') || 50;
    const used = getInventoryTotal();
    // We removed silo-cap-display from index.html, but let's safely ignore if not found
    const siloCapDisplay = document.getElementById('silo-cap-display');
    if (siloCapDisplay) {
        siloCapDisplay.textContent = cap;
        const maxDisp = document.getElementById('silo-max-display');
        if(maxDisp) maxDisp.textContent = cap;
        const usedDisp = document.getElementById('silo-used-display');
        if(usedDisp) {
            usedDisp.textContent = used;
            usedDisp.style.color = (used >= cap) ? '#ef4444' : 'var(--muted)';
        }
        const priceDisp = document.getElementById('silo-price-display');
        if(priceDisp) priceDisp.textContent = (cap * 10) + '💰';
    }

    const pVal = document.getElementById('prestige-val');
    if (pVal) pVal.textContent = S.prestige || 0;
}

export function updateBoosters() {
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

export function buyGnomeFarm() {
    if (S.gnomeFarmOwned) {
        NotificationManager.toast('Anda sudah mempekerjakan Kurcaci Petani!', 'warn');
        return;
    }
    if (S.coins >= 5000) {
        S.coins -= 5000;
        S.gnomeFarmOwned = true;
        S.gnomeFarmActive = true;
        AudioManager.playSound('levelup');
        NotificationManager.toast('🧙‍♂️ Kurcaci Petani berhasil dipekerjakan!', 'success');
        render();
    } else {
        AudioManager.playSound('error');
        NotificationManager.toast('Koin tidak cukup! Butuh 5000💰', 'warn');
    }
}

export function toggleGnomeFarm() {
    S.gnomeFarmActive = !S.gnomeFarmActive;
    NotificationManager.toast(`🧙‍♂️ Kurcaci Petani ${S.gnomeFarmActive ? 'Aktif' : 'Beristirahat'}`, 'info');
    render();
}

export function buyGnomeAnimal() {
    if (S.gnomeAnimalOwned) {
        NotificationManager.toast('Anda sudah mempekerjakan Kurcaci Peternak!', 'warn');
        return;
    }
    if (S.coins >= 8000) {
        S.coins -= 8000;
        S.gnomeAnimalOwned = true;
        S.gnomeAnimalActive = true;
        AudioManager.playSound('levelup');
        NotificationManager.toast('🧑‍🍳 Kurcaci Peternak berhasil dipekerjakan!', 'success');
        render();
    } else {
        AudioManager.playSound('error');
        NotificationManager.toast('Koin tidak cukup! Butuh 8000💰', 'warn');
    }
}

export function toggleGnomeAnimal() {
    S.gnomeAnimalActive = !S.gnomeAnimalActive;
    NotificationManager.toast(`🧑‍🍳 Kurcaci Peternak ${S.gnomeAnimalActive ? 'Aktif' : 'Beristirahat'}`, 'info');
    render();
}

export function confirmReset() {
    NotificationManager.showModal('🔄 Reset Game', 'Semua progress akan hilang. Yakin?', () => {
        localStorage.removeItem(CONFIG.SAVE_KEY);
        location.reload();
    });
}

export function toggleFullScreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            console.log(`Fullscreen error: ${err.message}`);
        });
    } else {
        if (document.exitFullscreen) document.exitFullscreen();
    }
}

window.render = render;
window.updateTopbar = updateTopbar;
window.updateBoosters = updateBoosters;
window.buyGnomeFarm = buyGnomeFarm;
window.toggleGnomeFarm = toggleGnomeFarm;
window.buyGnomeAnimal = buyGnomeAnimal;
window.toggleGnomeAnimal = toggleGnomeAnimal;


