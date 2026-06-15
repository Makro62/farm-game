export class AudioManager {
    static ctx = null;
    static isMuted = false;
    static bgmAudio = null;

    static init() {
        if (this.ctx) return;
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();
            this.setupUI();
            this.initBGM();
        } catch(e) {
            console.error("Audio initialization failed", e);
        }
    }

    static initBGM() {
        this.bgmAudio = document.getElementById('bgm-audio');
        if (!this.bgmAudio) {
            this.bgmAudio = new Audio('https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=country-rock-113254.mp3'); 
            this.bgmAudio.id = 'bgm-audio';
            this.bgmAudio.loop = true;
            this.bgmAudio.volume = 0.15;
            document.body.appendChild(this.bgmAudio);
        }
        
        // Try to play immediately if not muted
        if (!this.isMuted) {
            this.bgmAudio.play().catch(e => console.log('Autoplay prevented by browser', e));
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
            
            if (this.bgmAudio) {
                if (this.isMuted) {
                    this.bgmAudio.pause();
                } else {
                    this.bgmAudio.play().catch(e => console.log('Autoplay prevented', e));
                }
            }
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
