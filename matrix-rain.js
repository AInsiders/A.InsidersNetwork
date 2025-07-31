// Matrix Rain Effect
class MatrixRain {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()_+-=[]{}|;:,.<>?';
        this.drops = [];
        this.fontSize = 16;
        this.columns = 0;
        this.init();
    }

    init() {
        this.resize();
        this.createDrops();
        this.animate();
        
        // Handle window resize
        window.addEventListener('resize', () => {
            this.resize();
            this.createDrops();
        });
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.columns = Math.floor(this.canvas.width / this.fontSize);
    }

    createDrops() {
        this.drops = [];
        for (let i = 0; i < this.columns; i++) {
            this.drops[i] = Math.random() * -100;
        }
    }

    animate() {
        // Clear canvas with more opaque black for darker background
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Set text properties
        this.ctx.fillStyle = '#0F0';
        this.ctx.font = `${this.fontSize}px monospace`;

        // Draw characters
        for (let i = 0; i < this.drops.length; i++) {
            const text = this.characters.charAt(Math.floor(Math.random() * this.characters.length));
            const x = i * this.fontSize;
            const y = this.drops[i] * this.fontSize;

            // Draw character (no blur/glow effects)
            this.ctx.fillText(text, x, y);

            // Move drop down
            if (y > this.canvas.height && Math.random() > 0.975) {
                this.drops[i] = 0;
            }
            this.drops[i]++;
        }

        requestAnimationFrame(() => this.animate());
    }
}

// Enhanced Matrix Rain with multiple layers
class EnhancedMatrixRain {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()_+-=[]{}|;:,.<>?アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
        this.drops = [];
        this.fontSize = 18;
        this.columns = 0;
        this.animationId = null;
        this.isActive = false;
        this.init();
    }

    init() {
        this.resize();
        this.createDrops();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.columns = Math.floor(this.canvas.width / this.fontSize);
    }

    createDrops() {
        this.drops = [];
        for (let i = 0; i < this.columns; i++) {
            this.drops.push({
                x: i * this.fontSize,
                y: Math.random() * -this.canvas.height,
                speed: 1 + Math.random() * 2,
                length: 10 + Math.random() * 20,
                opacity: Math.random() * 0.5 + 0.5,
                characters: []
            });
        }
    }

    start() {
        if (this.isActive) return;
        this.isActive = true;
        this.animate();
    }

    stop() {
        this.isActive = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }

    animate() {
        if (!this.isActive) return;

        // Clear canvas with darker fade effect
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw each drop
        this.drops.forEach(drop => {
            // Generate characters for this drop
            if (drop.characters.length < drop.length) {
                drop.characters.push({
                    char: this.characters.charAt(Math.floor(Math.random() * this.characters.length)),
                    opacity: drop.opacity
                });
            }

            // Draw characters in the drop
            drop.characters.forEach((charObj, index) => {
                const y = drop.y - (index * this.fontSize);
                const opacity = charObj.opacity * (1 - index / drop.length);
                
                this.ctx.fillStyle = `rgba(0, 255, 0, ${opacity})`;
                this.ctx.font = `${this.fontSize}px 'Courier New', monospace`;
                
                // Draw character (no blur/glow effects)
                this.ctx.fillText(charObj.char, drop.x, y);
            });

            // Move drop down
            drop.y += drop.speed;

            // Reset drop when it goes off screen
            if (drop.y > this.canvas.height + drop.length * this.fontSize) {
                drop.y = -drop.length * this.fontSize;
                drop.characters = [];
            }
        });

        this.animationId = requestAnimationFrame(() => this.animate());
    }
}

// Matrix Rain with interactive effects
class InteractiveMatrixRain {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()_+-=[]{}|;:,.<>?アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
        this.drops = [];
        this.fontSize = 16;
        this.columns = 0;
        this.animationId = null;
        this.isActive = false;
        this.mouseX = 0;
        this.mouseY = 0;
        this.init();
    }

    init() {
        this.resize();
        this.createDrops();
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.canvas.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
        });

        this.canvas.addEventListener('click', (e) => {
            this.createExplosion(e.clientX, e.clientY);
        });
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.columns = Math.floor(this.canvas.width / this.fontSize);
    }

    createDrops() {
        this.drops = [];
        for (let i = 0; i < this.columns; i++) {
            this.drops.push({
                x: i * this.fontSize,
                y: Math.random() * -this.canvas.height,
                speed: 1 + Math.random() * 3,
                length: 8 + Math.random() * 15,
                opacity: Math.random() * 0.7 + 0.3,
                characters: [],
                disturbed: false
            });
        }
    }

    createExplosion(x, y) {
        // Create ripple effect
        for (let i = 0; i < 20; i++) {
            const angle = (Math.PI * 2 * i) / 20;
            const radius = 50 + Math.random() * 100;
            const explosionX = x + Math.cos(angle) * radius;
            const explosionY = y + Math.sin(angle) * radius;
            
            this.ctx.fillStyle = `rgba(0, 255, 255, ${Math.random() * 0.8 + 0.2})`;
            this.ctx.font = `${this.fontSize}px 'Courier New', monospace`;
            this.ctx.fillText('*', explosionX, explosionY);
        }
    }

    start() {
        if (this.isActive) return;
        this.isActive = true;
        this.animate();
    }

    stop() {
        this.isActive = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }

    animate() {
        if (!this.isActive) return;

        // Clear canvas with darker fade effect
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.18)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw each drop
        this.drops.forEach(drop => {
            // Check if mouse is near this drop
            const distance = Math.sqrt(
                Math.pow(this.mouseX - drop.x, 2) + 
                Math.pow(this.mouseY - drop.y, 2)
            );
            
            if (distance < 100) {
                drop.disturbed = true;
                drop.speed = 3 + Math.random() * 2;
            } else {
                drop.disturbed = false;
                drop.speed = 1 + Math.random() * 2;
            }

            // Generate characters for this drop
            if (drop.characters.length < drop.length) {
                drop.characters.push({
                    char: this.characters.charAt(Math.floor(Math.random() * this.characters.length)),
                    opacity: drop.opacity
                });
            }

            // Draw characters in the drop
            drop.characters.forEach((charObj, index) => {
                const y = drop.y - (index * this.fontSize);
                const opacity = charObj.opacity * (1 - index / drop.length);
                
                // Change color based on disturbance
                if (drop.disturbed) {
                    this.ctx.fillStyle = `rgba(0, 255, 255, ${opacity})`;
                } else {
                    this.ctx.fillStyle = `rgba(0, 255, 0, ${opacity})`;
                }
                
                this.ctx.font = `${this.fontSize}px 'Courier New', monospace`;
                
                // Draw character (no blur/glow effects)
                this.ctx.fillText(charObj.char, drop.x, y);
            });

            // Move drop down
            drop.y += drop.speed;

            // Reset drop when it goes off screen
            if (drop.y > this.canvas.height + drop.length * this.fontSize) {
                drop.y = -drop.length * this.fontSize;
                drop.characters = [];
            }
        });

        this.animationId = requestAnimationFrame(() => this.animate());
    }
}

// Export classes for use in other files
window.MatrixRain = MatrixRain;
window.EnhancedMatrixRain = EnhancedMatrixRain;
window.InteractiveMatrixRain = InteractiveMatrixRain; 