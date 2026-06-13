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
}
