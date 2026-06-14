import { buyBooster, sellAll, catchFish } from '../systems/economy-system.js';
import { claimDaily } from '../systems/quest-system.js';
import { saveGame } from '../core/save-manager.js';
import { buyGnomeFarm, toggleGnomeFarm, buyGnomeAnimal, toggleGnomeAnimal, confirmReset, toggleFullScreen } from '../ui/core-ui.js';
import { NotificationManager } from './notification-manager.js';

export class UIManager {
    static initEvents() {
        this.bindClick('btn-boost-growth', () => buyBooster('growth'));
        this.bindClick('btn-boost-coin', () => buyBooster('coin'));
        this.bindClick('btn-buy-gnome', () => buyGnomeFarm());
        this.bindClick('btn-fullscreen', () => toggleFullScreen());
        this.bindClick('btn-toggle-gnome', () => toggleGnomeFarm());
        this.bindClick('btn-buy-gnome-animal', () => buyGnomeAnimal());
        this.bindClick('btn-toggle-gnome-animal', () => toggleGnomeAnimal());
        this.bindClick('btn-claim-daily', () => claimDaily());
        this.bindClick('btn-save-game', () => saveGame(true));
        this.bindClick('btn-reset-game', () => confirmReset());
        this.bindClick('btn-sell-all', () => sellAll());
        this.bindClick('btn-modal-cancel', () => NotificationManager.closeModal());
        
        this.bindClick('btn-cheat-money', () => {
            const input = document.getElementById('cheat-money-input');
            if (input && input.value) {
                let amount = parseInt(input.value, 10);
                if (isNaN(amount) || amount <= 0) return;
                if (amount > 1000000000) amount = 1000000000;
                
                import('../core/state.js').then(module => {
                    const { S } = module;
                    S.coins += amount;
                    S.totalEarned += amount; // Just in case to track
                    input.value = '';
                    NotificationManager.toast(`Berhasil menambahkan ${amount}💰!`, 'success');
                    if (typeof window.renderTopBar === 'function') window.renderTopBar();
                });
            }
        });
    }

    static bindClick(id, callback) {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('click', (e) => {
                // Prevent duplicate triggering if bubbled
                e.preventDefault();
                callback(e);
            });
        } else {
            console.warn(`[UIManager] Element not found for binding: ${id}`);
        }
    }
}
