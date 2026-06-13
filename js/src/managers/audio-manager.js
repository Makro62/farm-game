export class AudioManager {
    static ctx = null;
    static isMuted = false;

    static init() {
        if (this.ctx) return;
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();
            this.setupUI();
        } catch(e) {
            console.error("Audio initialization failed", e);
        }
    }

    static setupUI() {
        const btn = document.getElementById('btn-mute');
        if (!btn) return;
        
        // Remove any old global onclick if exists
        btn.onclick = null;
        
        btn.addEventListener('click', () => {
            this.isMuted = !this.isMuted;
            btn.innerHTML = this.isMuted ? '🔇' : '🔊';
            btn.style.opacity = this.isMuted ? '0.5' : '1';
        });
    }

    static playTone(freq, type, duration, vol=0.1) {
        if (this.isMuted || !this.ctx) return;
        try {
            if (this.ctx.state === 'suspended') this.ctx.resume();
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = type;
            osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
            
            gain.gain.setValueAtTime(vol, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);
            
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            
            osc.start();
            osc.stop(this.ctx.currentTime + duration);
        } catch(e) {
            console.error('Audio play error:', e);
        }
    }

    static playSound(name) {
        if (this.isMuted) return;
        if (!this.ctx) this.init();
        
        const sounds = {
            pop: () => this.playTone(600, 'sine', 0.1, 0.1),
            coin: () => {
                this.playTone(800, 'sine', 0.1, 0.1);
                setTimeout(() => this.playTone(1200, 'sine', 0.15, 0.1), 50);
            },
            levelup: () => {
                this.playTone(400, 'square', 0.1, 0.1);
                setTimeout(() => this.playTone(500, 'square', 0.1, 0.1), 100);
                setTimeout(() => this.playTone(600, 'square', 0.2, 0.1), 200);
            },
            error: () => this.playTone(150, 'sawtooth', 0.2, 0.1),
            water: () => this.playTone(300, 'sine', 0.1, 0.05)
        };
        
        if (sounds[name]) sounds[name]();
    }
}
