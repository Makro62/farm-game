import { buyBooster, sellAll, upgradeSilo, catchFish } from '../systems/economy-system.js';
import { claimDaily } from '../systems/quest-system.js';
import { saveGame } from '../core/save-manager.js';
import { buyGnome, toggleGnome, confirmReset, toggleFullScreen } from '../ui/core-ui.js';
import { NotificationManager } from './notification-manager.js';

export class UIManager {
    static initEvents() {
        this.bindClick('btn-boost-growth', () => buyBooster('growth'));
        this.bindClick('btn-boost-coin', () => buyBooster('coin'));
        this.bindClick('btn-buy-gnome', () => buyGnome());
        this.bindClick('btn-upgrade-silo', () => upgradeSilo());
        this.bindClick('btn-fullscreen', () => toggleFullScreen());
        this.bindClick('btn-toggle-gnome', () => toggleGnome());
        this.bindClick('btn-claim-daily', () => claimDaily());
        this.bindClick('btn-save-game', () => saveGame(true));
        this.bindClick('btn-reset-game', () => confirmReset());
        this.bindClick('btn-sell-all', () => sellAll());
        this.bindClick('lake-container', () => catchFish());
        this.bindClick('btn-modal-cancel', () => NotificationManager.closeModal());
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
