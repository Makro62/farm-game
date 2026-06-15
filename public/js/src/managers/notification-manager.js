export class NotificationManager {
    static spawnParticles(idx, ...texts) {
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

    static toast(msg, type = 'info') {
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

    static showModal(title, msg, onOk) {
        const titleEl = document.getElementById('modal-title');
        const msgEl = document.getElementById('modal-msg');
        const modal = document.getElementById('modal');
        const okBtn = document.getElementById('modal-ok');
        
        if (titleEl) titleEl.textContent = title;
        if (msgEl) msgEl.textContent = msg;
        if (modal) modal.classList.add('show');
        
        if (okBtn) {
            okBtn.onclick = () => { 
                this.closeModal(); 
                if (onOk) onOk(); 
            };
        }
    }

    static closeModal() { 
        const modal = document.getElementById('modal');
        if (modal) modal.classList.remove('show'); 
    }

    /**
     * Show an input dialog (chat box) to enter a numeric amount.
     * @param {string} title
     * @param {string} msg
     * @param {{defaultValue?:number, min?:number, max?:number}} opts
     * @param {(value:number)=>void} onOk - called with the validated number
     */
    static showPrompt(title, msg, opts = {}, onOk) {
        const modal = document.getElementById('prompt-modal');
        const titleEl = document.getElementById('prompt-title');
        const msgEl = document.getElementById('prompt-msg');
        const input = document.getElementById('prompt-input');
        const okBtn = document.getElementById('prompt-ok');
        if (!modal || !input || !okBtn) return;

        const min = opts.min ?? 1;
        const max = opts.max ?? 9999;
        const def = Math.max(min, Math.min(max, opts.defaultValue ?? 1));

        if (titleEl) titleEl.textContent = title;
        if (msgEl) msgEl.textContent = msg;
        input.min = min;
        input.max = max;
        input.value = def;

        modal.classList.add('show');
        setTimeout(() => { input.focus(); input.select(); }, 50);

        const submit = () => {
            let val = parseInt(input.value, 10);
            if (isNaN(val)) val = min;
            val = Math.max(min, Math.min(max, val));
            this.closePrompt();
            if (onOk) onOk(val);
        };

        okBtn.onclick = submit;
        input.onkeydown = (e) => {
            if (e.key === 'Enter') { e.preventDefault(); submit(); }
            else if (e.key === 'Escape') { e.preventDefault(); this.closePrompt(); }
        };
    }

    static closePrompt() {
        const modal = document.getElementById('prompt-modal');
        if (modal) modal.classList.remove('show');
    }
}
