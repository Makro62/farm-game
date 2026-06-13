import { S } from '../core/state.js';
import { ACHIEVEMENTS } from '../data/config.js';
import { queueSave } from '../core/save-manager.js';
import { AudioManager } from '../managers/audio-manager.js';
import { NotificationManager } from '../managers/notification-manager.js';

export function addXP(n) {
    S.xp += n;
    const needed = S.level * 100;
    while (S.xp >= needed) {
        S.xp -= needed;
        S.level++;
        AudioManager.playSound('levelup');
        NotificationManager.toast(`🎉 LEVEL UP! Lv ${S.level}`, 'success');
        checkAchievements();
    }
}

export function checkAchievements() {
    ACHIEVEMENTS.forEach(a => {
        if (!S.achievements.includes(a.id) && a.check(S)) {
            S.achievements.push(a.id);
            S.coins += a.reward;
            AudioManager.playSound('levelup'); 
            NotificationManager.toast(`🏆 Achievement: ${a.name}! +${a.reward}💰`, 'success');
        }
    });
}

// Temporary bindings for migration
window.addXP = addXP;
window.checkAchievements = checkAchievements;
