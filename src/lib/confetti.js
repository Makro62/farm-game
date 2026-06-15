import confetti from 'canvas-confetti';

class ConfettiManager {
  constructor() {
    this.defaults = {
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#fbbf24', '#34d399', '#60a5fa', '#f472b6', '#a78bfa']
    };
  }
  
  // Basic confetti
  basic(options = {}) {
    return confetti({
      ...this.defaults,
      ...options
    });
  }
  
  // Celebration (level up, achievement)
  celebration(options = {}) {
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    
    const colors = options.colors || ['#fbbf24', '#34d399', '#60a5fa', '#f472b6'];
    
    const interval = setInterval(() => {
      if (Date.now() > animationEnd) {
        clearInterval(interval);
        return;
      }
      
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors
      });
      
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors
      });
    }, 50);
  }
  
  // Explosion (big reward)
  explosion(options = {}) {
    const count = options.count || 200;
    const defaults = {
      spread: 360,
      ticks: 100,
      gravity: 0,
      decay: 0.94,
      startVelocity: 30,
      colors: ['#FFE400', '#FFBD00', '#E89400', '#FFCA6C', '#FDFFB8']
    };
    
    confetti({
      ...defaults,
      ...options,
      particleCount: count / 2,
      origin: { x: 0.5, y: 0.5 },
      shapes: ['circle']
    });
    
    confetti({
      ...defaults,
      ...options,
      particleCount: count / 2,
      origin: { x: 0.5, y: 0.5 },
      shapes: ['square']
    });
  }
  
  // Fireworks (mega achievement)
  fireworks(options = {}) {
    const duration = 5000;
    const animationEnd = Date.now() + duration;
    const defaults = {
      startVelocity: 30,
      spread: 360,
      ticks: 60,
      zIndex: 0,
      colors: ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff']
    };
    
    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();
      
      if (timeLeft <= 0) {
        clearInterval(interval);
        return;
      }
      
      const particleCount = 50 * (timeLeft / duration);
      
      confetti({
        ...defaults,
        ...options,
        particleCount,
        origin: {
          x: Math.random(),
          y: Math.random() * 0.3 + 0.1
        }
      });
    }, 250);
  }
  
  // Stars (special reward)
  stars(options = {}) {
    const count = options.count || 50;
    
    confetti({
      particleCount: count,
      startVelocity: 0,
      spread: 360,
      ticks: 60,
      origin: {
        x: 0.5,
        y: 0.5
      },
      colors: ['#FFD700', '#FFA500', '#FF8C00'],
      shapes: ['star'],
      scalar: 2,
      ...options
    });
  }
  
  // Snow (winter theme)
  snow(options = {}) {
    const duration = 10000;
    const animationEnd = Date.now() + duration;
    
    const interval = setInterval(() => {
      if (Date.now() > animationEnd) {
        clearInterval(interval);
        return;
      }
      
      confetti({
        particleCount: 2,
        startVelocity: 0,
        ticks: 300,
        origin: {
          x: Math.random(),
          y: 0
        },
        colors: ['#ffffff', '#e0e0e0', '#f0f0f0'],
        shapes: ['circle'],
        scalar: 1.5,
        gravity: 0.3,
        drift: Math.random() - 0.5,
        ...options
      });
    }, 50);
  }
  
  // Hearts (love/valentine theme)
  hearts(options = {}) {
    confetti({
      particleCount: 50,
      spread: 360,
      origin: { y: 0.5 },
      colors: ['#ff0000', '#ff69b4', '#ff1493'],
      shapes: ['circle'],
      scalar: 2,
      ...options
    });
  }
  
  // School pride (rainbow)
  rainbow(options = {}) {
    const colors = ['#ff0000', '#ff8000', '#ffff00', '#00ff00', '#0000ff', '#8000ff'];
    
    confetti({
      particleCount: 150,
      spread: 180,
      origin: { y: 0.5 },
      colors,
      ...options
    });
  }
  
  // Custom shape confetti
  customShape(shape, options = {}) {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      shapes: [shape],
      ...options
    });
  }
  
  // Cannon from left
  cannonLeft(options = {}) {
    confetti({
      particleCount: 100,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      ...options
    });
  }
  
  // Cannon from right
  cannonRight(options = {}) {
    confetti({
      particleCount: 100,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      ...options
    });
  }
  
  // Continuous rain
  rain(options = {}) {
    const duration = options.duration || 5000;
    const animationEnd = Date.now() + duration;
    
    const interval = setInterval(() => {
      if (Date.now() > animationEnd) {
        clearInterval(interval);
        return;
      }
      
      confetti({
        particleCount: 2,
        startVelocity: 0,
        ticks: 200,
        origin: {
          x: Math.random(),
          y: 0
        },
        colors: ['#4facfe', '#00f2fe'],
        shapes: ['circle'],
        scalar: 0.8,
        gravity: 1.5,
        ...options
      });
    }, 30);
  }
  
  // Stop all confetti
  stop() {
    confetti.reset();
  }
}

// Singleton instance
export const confettiManager = new ConfettiManager();

export default confettiManager;
