import { S } from '../core/state.js';
import { ACHIEVEMENTS } from '../data/config.js';
import { queueSave } from '../core/save-manager.js';

export function addXP(n) {
    S.xp += n;
    const needed = S.level * 100;
    while (S.xp >= needed) {
        S.xp -= needed;
        S.level++;
        window.playSound('levelup');
        window.toast(`🎉 LEVEL UP! Lv ${S.level}`, 'success');
        checkAchievements();
    }
}

export function checkAchievements() {
    ACHIEVEMENTS.forEach(a => {
        if (!S.achievements.includes(a.id) && a.check(S)) {
            S.achievements.push(a.id);
            S.coins += a.reward;
            window.playSound('levelup'); 
            window.toast(`🏆 Achievement: ${a.name}! +${a.reward}💰`, 'success');
        }
    });
}

export function spawnParticles(idx, ...texts) {
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

export function toast(msg, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const el = document.createElement('div');
    el.className = 'toast ' + type;
    el.textContent = msg;
    container.appendChild(el);

    while (container.children.length > 3) {
        container.removeChild(container.children[0]);
    }

    setTimeout(() => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(-20px)';
        setTimeout(() => el.remove(), 300);
    }, 2500);
}

// Temporary bindings for migration
window.addXP = addXP;
window.checkAchievements = checkAchievements;
window.spawnParticles = spawnParticles;
window.toast = toast;
