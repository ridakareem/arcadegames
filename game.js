/**
 * Dual Arcade Games - PlayStation Style
 * Game 1: Valentine's Heart Catch
 * Game 2: Asteroid Greed
 */

// Global game state
let currentGame = null;
let gameInstance = null;
const GAME_WIDTH = 320;
const GAME_HEIGHT = 240;

// ============================================================================
// GAME SELECTION & MENU SYSTEM
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
    // Game selection cards
    document.querySelectorAll('.game-card').forEach(card => {
        card.addEventListener('click', () => {
            const game = card.dataset.game;
            showGameStart(game);
        });
    });
    
    // Start buttons
    document.querySelectorAll('.start-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const game = btn.dataset.game;
            startGame(game);
        });
    });
    
    // Back buttons
    document.querySelectorAll('.back-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            showGameSelect();
        });
    });
});

function showGameSelect() {
    document.getElementById('game-select-screen').classList.remove('hidden');
    document.getElementById('start-screen-hearts').classList.add('hidden');
    document.getElementById('start-screen-asteroids').classList.add('hidden');
    document.getElementById('start-screen-flames').classList.add('hidden');
    document.getElementById('start-screen-memory').classList.add('hidden');
    
    const canvasWrapper = document.getElementById('game-canvas-wrapper');
    canvasWrapper.classList.remove('zoom-in', 'active');
    canvasWrapper.classList.add('zoom-out');
    
    if (window.arcadeGame) {
        window.arcadeGame.destroy(true);
        window.arcadeGame = null;
    }
}

function showGameStart(game) {
    document.getElementById('game-select-screen').classList.add('hidden');
    
    if (game === 'hearts') {
        document.getElementById('start-screen-hearts').classList.remove('hidden');
    } else if (game === 'asteroids') {
        document.getElementById('start-screen-asteroids').classList.remove('hidden');
    } else if (game === 'flames') {
        document.getElementById('start-screen-flames').classList.remove('hidden');
    } else if (game === 'memory') {
        document.getElementById('start-screen-memory').classList.remove('hidden');
    }
}

function startGame(game) {
    currentGame = game;
    
    document.getElementById('start-screen-hearts').classList.add('hidden');
    document.getElementById('start-screen-asteroids').classList.add('hidden');
    document.getElementById('start-screen-flames').classList.add('hidden');
    document.getElementById('start-screen-memory').classList.add('hidden');
    
    if (game === 'flames') {
        loadFlamesGame();
        return;
    }
    
    if (game === 'memory') {
        loadMemoryGame();
        return;
    }
    
    const canvasWrapper = document.getElementById('game-canvas-wrapper');
    canvasWrapper.classList.remove('zoom-out');
    canvasWrapper.classList.add('active', 'zoom-in');
    
    if (window.arcadeGame) {
        window.arcadeGame.destroy(true);
    }
    
    const config = {
        type: Phaser.AUTO,
        parent: 'game-canvas-wrapper',
        width: GAME_WIDTH,
        height: GAME_HEIGHT,
        pixelArt: true,
        antialias: false,
        roundPixels: true,
        scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH
        },
        physics: {
            default: 'arcade',
            arcade: {
                gravity: { y: 0 },
                debug: false
            }
        },
        scene: game === 'hearts' ? HeartCatchScene : AsteroidGreedScene
    };
    
    window.arcadeGame = new Phaser.Game(config);
}

function returnToMenu(scene, won, finalScore) {
    scene.physics.pause();
    
    const wrapper = document.getElementById('game-canvas-wrapper');
    wrapper.classList.remove('zoom-in');
    wrapper.classList.add('zoom-out');
    
    setTimeout(() => {
        showGameSelect();
    }, 800);
}

// ============================================================================
// GAME 1: HEART CATCH
// ============================================================================

class HeartCatchScene extends Phaser.Scene {
    constructor() {
        super({ key: 'HeartCatch' });
    }
    
    preload() {}
    
    create() {
        gameInstance = this;
        
        this.cameras.main.setBackgroundColor('#1a0a2e');
        
        const bg = this.add.graphics();
        for (let x = 0; x < GAME_WIDTH; x += 4) {
            for (let y = 0; y < GAME_HEIGHT; y += 4) {
                if ((x + y) % 8 === 0) {
                    bg.fillStyle(0x2d1b4e, 0.5);
                    bg.fillRect(x, y, 4, 4);
                }
            }
        }
        
        this.happiness = 50;
        this.happinessText = this.add.text(10, 10, 'HAPPINESS: 50', {
            fontFamily: 'Press Start 2P',
            fontSize: 8,
            color: '#ff6b9d'
        }).setOrigin(0, 0);
        
        this.happinessBarBg = this.add.rectangle(10, 28, GAME_WIDTH - 20, 12, 0x330011).setOrigin(0, 0);
        this.happinessBar = this.add.rectangle(12, 30, (GAME_WIDTH - 24) * (this.happiness / 100), 8, 0xff1744).setOrigin(0, 0);
        
        this.redHearts = this.physics.add.group();
        this.brokenHearts = this.physics.add.group();
        
        const basketWidth = 48;
        const basketHeight = 24;
        
        const basketGfx = this.add.graphics();
        basketGfx.fillStyle(0x8B4513, 1);
        basketGfx.fillRect(0, 0, basketWidth, basketHeight);
        basketGfx.fillStyle(0xA0522D, 1);
        basketGfx.fillRect(2, 2, basketWidth - 4, 4);
        basketGfx.fillRect(2, basketHeight - 6, basketWidth - 4, 4);
        basketGfx.lineStyle(2, 0x654321);
        basketGfx.strokeRect(0, 0, basketWidth, basketHeight);
        basketGfx.generateTexture('basket', basketWidth, basketHeight);
        basketGfx.destroy();
        
        this.basketSprite = this.add.image(GAME_WIDTH / 2, GAME_HEIGHT - 35, 'basket').setOrigin(0.5, 0.5);
        this.basketCatchWidth = 40;
        this.basketCatchHeight = 20;
        
        this.cursors = this.input.keyboard.createCursorKeys();
        this.basketSpeed = 180;
        
        this.spawnTimer = 0;
        this.spawnInterval = 1200;
        
        this.createHeartTextures();
        
        this.gameState = 'playing';
    }
    
    createHeartTextures() {
        const size = 16;
        const heartPixels = [
            [0,0,1,1,0,0,1,1,0,0],
            [0,1,1,1,1,1,1,1,1,0],
            [0,1,1,1,1,1,1,1,1,0],
            [0,0,1,1,1,1,1,1,0,0],
            [0,0,0,1,1,1,1,0,0,0],
            [0,0,0,0,1,1,0,0,0,0]
        ];
        const px = size / 10;
        
        const redHeartGfx = this.add.graphics();
        redHeartGfx.fillStyle(0xff1744, 1);
        heartPixels.forEach((row, y) => {
            row.forEach((cell, x) => {
                if (cell) redHeartGfx.fillRect(x * px, y * px, px, px);
            });
        });
        redHeartGfx.generateTexture('redHeart', size, size);
        redHeartGfx.destroy();
        
        const brokenHeartGfx = this.add.graphics();
        brokenHeartGfx.fillStyle(0x666666, 1);
        heartPixels.forEach((row, y) => {
            row.forEach((cell, x) => {
                if (cell) brokenHeartGfx.fillRect(x * px, y * px, px, px);
            });
        });
        brokenHeartGfx.fillStyle(0x333333, 1);
        brokenHeartGfx.fillRect(3*px, 2*px, px, px);
        brokenHeartGfx.fillRect(6*px, 2*px, px, px);
        brokenHeartGfx.fillRect(2*px, 4*px, px, px);
        brokenHeartGfx.fillRect(7*px, 4*px, px, px);
        brokenHeartGfx.fillRect(4*px, 5*px, px*2, px);
        brokenHeartGfx.generateTexture('brokenHeart', size, size);
        brokenHeartGfx.destroy();
    }
    
    spawnHeart() {
        const isRed = Phaser.Math.Between(0, 100) < 70;
        const x = Phaser.Math.Between(20, GAME_WIDTH - 20);
        
        const texture = isRed ? 'redHeart' : 'brokenHeart';
        const heart = isRed 
            ? this.redHearts.create(x, -20, texture)
            : this.brokenHearts.create(x, -20, texture);
        
        heart.setScale(1.5);
        heart.setData('isRed', isRed);
        heart.body.setVelocity(0, 80);
        heart.body.setCollideWorldBounds(false);
    }
    
    update(time, delta) {
        if (this.gameState !== 'playing') return;
        
        const keyLeft = this.cursors && this.cursors.left.isDown;
        const keyRight = this.cursors && this.cursors.right.isDown;
        if (keyLeft) {
            this.basketSprite.x -= this.basketSpeed * (delta / 1000);
        } else if (keyRight) {
            this.basketSprite.x += this.basketSpeed * (delta / 1000);
        } else {
            const pointer = this.input.activePointer;
            if (pointer && typeof pointer.x === 'number') {
                let px = pointer.x;
                if (pointer.positionToCamera) {
                    const wp = pointer.positionToCamera(this.cameras.main);
                    if (wp) px = wp.x;
                }
                this.basketSprite.x = Phaser.Math.Clamp(px, 30, GAME_WIDTH - 30);
            }
        }
        
        this.basketSprite.x = Phaser.Math.Clamp(this.basketSprite.x, 30, GAME_WIDTH - 30);
        
        const catchLeft = this.basketSprite.x - this.basketCatchWidth / 2;
        const catchRight = this.basketSprite.x + this.basketCatchWidth / 2;
        const catchTop = this.basketSprite.y - this.basketCatchHeight / 2;
        const catchBottom = this.basketSprite.y + this.basketCatchHeight / 2;
        
        const isInBasket = (heart) => {
            return heart.active && heart.x >= catchLeft && heart.x <= catchRight &&
                   heart.y >= catchTop && heart.y <= catchBottom;
        };
        
        const redToCatch = this.redHearts.getChildren().filter(isInBasket);
        redToCatch.forEach(heart => {
            heart.setActive(false);
            heart.destroy();
            this.happiness = Math.min(100, this.happiness + 2);
            this.updateHappinessDisplay();
            this.checkWin();
        });
        
        const brokenToCatch = this.brokenHearts.getChildren().filter(isInBasket);
        brokenToCatch.forEach(heart => {
            heart.setActive(false);
            heart.destroy();
            this.happiness = Math.max(0, this.happiness - 10);
            this.updateHappinessDisplay();
            this.checkGameOver();
        });
        
        this.spawnTimer += delta;
        if (this.spawnTimer >= this.spawnInterval) {
            this.spawnTimer = 0;
            this.spawnHeart();
            this.spawnInterval = Math.max(600, this.spawnInterval - 5);
        }
        
        const toRemove = [];
        this.redHearts.getChildren().forEach(heart => {
            if (heart.y > GAME_HEIGHT + 20) toRemove.push(heart);
        });
        toRemove.forEach(heart => heart.destroy());
        if (toRemove.length > 0) {
            this.happiness = Math.max(0, this.happiness - (10 * toRemove.length));
            this.updateHappinessDisplay();
            this.checkGameOver();
        }
        
        this.brokenHearts.getChildren().forEach(heart => {
            if (heart.y > GAME_HEIGHT + 20) heart.destroy();
        });
    }
    
    updateHappinessDisplay() {
        this.happinessText.setText('HAPPINESS: ' + this.happiness);
        const barWidth = (GAME_WIDTH - 24) * (this.happiness / 100);
        this.happinessBar.width = Math.max(0, barWidth);
        
        if (this.happiness < 30) {
            this.happinessBar.setFillStyle(0xff1744);
        } else if (this.happiness < 70) {
            this.happinessBar.setFillStyle(0xff9800);
        } else {
            this.happinessBar.setFillStyle(0x4caf50);
        }
    }
    
    checkWin() {
        if (this.happiness >= 100) {
            this.gameState = 'won';
            this.gameOver(true);
        }
    }
    
    checkGameOver() {
        if (this.happiness <= 0) {
            this.gameState = 'lost';
            this.gameOver(false);
        }
    }
    
    gameOver(won) {
        this.physics.pause();
        
        const msg = won ? 'YOU WIN! <3' : 'GAME OVER';
        const color = won ? '#4caf50' : '#f44336';
        
        this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.7).setOrigin(0, 0);
        
        this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 20, msg, {
            fontFamily: 'Press Start 2P',
            fontSize: 12,
            color: color
        }).setOrigin(0.5);
        
        this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 20, 'HAPPINESS: ' + this.happiness, {
            fontFamily: 'Press Start 2P',
            fontSize: 8,
            color: '#fff'
        }).setOrigin(0.5);
        
        this.time.delayedCall(2000, () => {
            returnToMenu(this, won, this.happiness);
        });
    }
}

// ============================================================================
// GAME 2: HEARTBREAK
// ============================================================================

class AsteroidGreedScene extends Phaser.Scene {
    constructor() {
        super({ key: 'Heartbreak' });
    }
    
    preload() {}
    
    create() {
        gameInstance = this;
        
        this.cameras.main.setBackgroundColor('#0a0a0f');
        
        // Starfield background
        this.stars = [];
        for (let i = 0; i < 50; i++) {
            const x = Phaser.Math.Between(0, GAME_WIDTH);
            const y = Phaser.Math.Between(0, GAME_HEIGHT);
            const size = Phaser.Math.Between(1, 2);
            const star = this.add.rectangle(x, y, size, size, 0xffffff, 0.8);
            this.stars.push({ sprite: star, speed: size });
        }
        
        this.score = 0;
        this.wave = 1;
        this.lives = 3;
        
        // UI
        this.scoreText = this.add.text(10, 10, 'SCORE: 0', {
            fontFamily: 'Press Start 2P',
            fontSize: 8,
            color: '#00ff00'
        }).setOrigin(0, 0);
        
        this.waveText = this.add.text(GAME_WIDTH / 2, 10, 'WAVE: 1', {
            fontFamily: 'Press Start 2P',
            fontSize: 8,
            color: '#00ffff'
        }).setOrigin(0.5, 0);
        
        this.livesText = this.add.text(GAME_WIDTH - 10, 10, '♥♥♥', {
            fontFamily: 'Press Start 2P',
            fontSize: 8,
            color: '#ff0000'
        }).setOrigin(1, 0);
        
        // Create textures
        this.createGameTextures();
        
        // Create player ship
        this.ship = this.physics.add.sprite(GAME_WIDTH / 2, GAME_HEIGHT - 40, 'ship');
        this.ship.setCollideWorldBounds(true);
        this.ship.setScale(1.5);
        
        // Groups
        this.bullets = this.physics.add.group();
        this.asteroids = this.physics.add.group(); // Hearts group
        this.enemies = this.physics.add.group();
        this.powerCores = this.physics.add.group();
        
        // Controls
        this.cursors = this.input.keyboard.createCursorKeys();
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.lastFired = 0;
        this.fireRate = 200;
        
        // Collision
        this.physics.add.overlap(this.bullets, this.asteroids, this.hitAsteroid, null, this); // Bullets hit hearts
        this.physics.add.overlap(this.bullets, this.enemies, this.hitEnemy, null, this);
        this.physics.add.overlap(this.ship, this.asteroids, this.hitPlayer, null, this); // Ship hits hearts
        this.physics.add.overlap(this.ship, this.enemies, this.hitPlayer, null, this);
        this.physics.add.overlap(this.ship, this.powerCores, this.collectPowerCore, null, this);
        
        // Spawn
        this.spawnTimer = 0;
        this.spawnInterval = 2000;
        this.nextWaveScore = 200; // Score needed for next wave
        
        this.gameState = 'playing';
        this.invulnerable = false;
    }
    
    createGameTextures() {
        // Ship
        const shipGfx = this.add.graphics();
        shipGfx.fillStyle(0x00ff00, 1);
        shipGfx.fillRect(6, 0, 4, 4);
        shipGfx.fillRect(4, 4, 8, 4);
        shipGfx.fillRect(2, 8, 12, 6);
        shipGfx.fillRect(0, 14, 16, 2);
        shipGfx.generateTexture('ship', 16, 16);
        shipGfx.destroy();
        
        // Bullet
        const bulletGfx = this.add.graphics();
        bulletGfx.fillStyle(0xffff00, 1);
        bulletGfx.fillRect(2, 0, 2, 6);
        bulletGfx.generateTexture('bullet', 6, 6);
        bulletGfx.destroy();
        
        // Whole Heart (replacing asteroid - breaks when shot)
        const heartGfx = this.add.graphics();
        const heartPixels = [
            [0,0,1,1,0,0,1,1,0,0],
            [0,1,1,1,1,1,1,1,1,0],
            [0,1,1,1,1,1,1,1,1,0],
            [0,0,1,1,1,1,1,1,0,0],
            [0,0,0,1,1,1,1,0,0,0],
            [0,0,0,0,1,1,0,0,0,0]
        ];
        const px = 2;
        
        // Draw whole heart in red/pink
        heartGfx.fillStyle(0xff1744, 1);
        heartPixels.forEach((row, y) => {
            row.forEach((cell, x) => {
                if (cell) heartGfx.fillRect(x * px, y * px, px, px);
            });
        });
        
        heartGfx.generateTexture('asteroid', 20, 12);
        heartGfx.destroy();
        
        // Enemy
        const enemyGfx = this.add.graphics();
        enemyGfx.fillStyle(0xff0000, 1);
        enemyGfx.fillRect(4, 0, 8, 4);
        enemyGfx.fillRect(2, 4, 12, 4);
        enemyGfx.fillRect(0, 8, 16, 4);
        enemyGfx.fillRect(2, 12, 12, 2);
        enemyGfx.generateTexture('enemy', 16, 14);
        enemyGfx.destroy();
        
        // Power Core (charging states)
        for (let i = 0; i < 4; i++) {
            const coreGfx = this.add.graphics();
            const brightness = 0.4 + (i * 0.2);
            coreGfx.fillStyle(Phaser.Display.Color.GetColor(255 * brightness, 100 * brightness, 0), 1);
            coreGfx.fillRect(2, 0, 4, 8);
            coreGfx.fillRect(0, 2, 8, 4);
            if (i >= 2) {
                coreGfx.fillStyle(0xffff00, 0.5);
                coreGfx.fillRect(3, 1, 2, 6);
                coreGfx.fillRect(1, 3, 6, 2);
            }
            coreGfx.generateTexture('powerCore' + i, 8, 8);
            coreGfx.destroy();
        }
    }
    
    update(time, delta) {
        if (this.gameState !== 'playing') return;
        
        // Starfield parallax
        this.stars.forEach(star => {
            star.sprite.y += star.speed * 0.5;
            if (star.sprite.y > GAME_HEIGHT) {
                star.sprite.y = 0;
                star.sprite.x = Phaser.Math.Between(0, GAME_WIDTH);
            }
        });
        
        // Ship movement
        const speed = 150;
        this.ship.setVelocity(0, 0);
        
        if (this.cursors.left.isDown) {
            this.ship.setVelocityX(-speed);
        } else if (this.cursors.right.isDown) {
            this.ship.setVelocityX(speed);
        }
        
        if (this.cursors.up.isDown) {
            this.ship.setVelocityY(-speed);
        } else if (this.cursors.down.isDown) {
            this.ship.setVelocityY(speed);
        }
        
        // Shooting
        if (this.spaceKey.isDown && time > this.lastFired + this.fireRate) {
            this.shootBullet();
            this.lastFired = time;
        }
        
        // Spawn enemies/hearts - continuous spawning
        this.spawnTimer += delta;
        if (this.spawnTimer >= this.spawnInterval) {
            this.spawnTimer = 0;
            this.spawnEnemy();
        }
        
        // Update power cores
        this.powerCores.getChildren().forEach(core => {
            core.setData('timer', core.getData('timer') + delta);
            const timer = core.getData('timer');
            
            if (timer < 1000) {
                core.setTexture('powerCore0');
            } else if (timer < 2000) {
                core.setTexture('powerCore1');
            } else if (timer < 3000) {
                core.setTexture('powerCore2');
            } else if (timer < 4000) {
                core.setTexture('powerCore3');
            } else {
                // Explode
                this.createExplosion(core.x, core.y, 0xff6600);
                core.destroy();
            }
        });
        
        // Update score milestone for waves
        if (this.score >= this.nextWaveScore) {
            this.nextWave();
        }
        
        // Clean up off-screen objects
        this.bullets.getChildren().forEach(bullet => {
            if (bullet.y < -20) bullet.destroy();
        });
        
        this.asteroids.getChildren().forEach(heart => {
            if (heart.y > GAME_HEIGHT + 20) heart.destroy();
        });
        
        this.enemies.getChildren().forEach(enemy => {
            if (enemy.y > GAME_HEIGHT + 20) enemy.destroy();
        });
        
        this.powerCores.getChildren().forEach(core => {
            if (core.y > GAME_HEIGHT + 20) core.destroy();
        });
    }
    
    shootBullet() {
        const bullet = this.bullets.create(this.ship.x, this.ship.y - 10, 'bullet');
        bullet.setVelocityY(-300);
        bullet.setScale(1.5);
    }
    
    spawnEnemy() {
        const type = Phaser.Math.Between(0, 100) < 70 ? 'heart' : 'enemy';
        const x = Phaser.Math.Between(20, GAME_WIDTH - 20);
        
        if (type === 'heart') {
            const heart = this.asteroids.create(x, -20, 'asteroid');
            heart.setScale(Phaser.Math.FloatBetween(1.2, 2.2));
            heart.setVelocity(Phaser.Math.Between(-30, 30), Phaser.Math.Between(50, 80));
            heart.setAngularVelocity(Phaser.Math.Between(-100, 100));
        } else {
            const enemy = this.enemies.create(x, -20, 'enemy');
            enemy.setScale(1.5);
            enemy.setVelocity(0, 60);
        }
    }
    
    hitAsteroid(bullet, heart) {
        bullet.destroy();
        heart.destroy();
        this.score += 10;
        this.updateScore();
        
        // Create heart break effect - pieces scatter
        this.createHeartBreakEffect(heart.x, heart.y);
        
        // 30% chance to drop power core
        if (Phaser.Math.Between(0, 100) < 30) {
            this.spawnPowerCore(heart.x, heart.y);
        }
    }
    
    hitEnemy(bullet, enemy) {
        bullet.destroy();
        enemy.destroy();
        this.score += 25;
        this.updateScore();
        this.createExplosion(enemy.x, enemy.y, 0xff0000);
        
        // 50% chance to drop power core
        if (Phaser.Math.Between(0, 100) < 50) {
            this.spawnPowerCore(enemy.x, enemy.y);
        }
    }
    
    hitPlayer(ship, enemy) {
        if (this.invulnerable) return;
        
        enemy.destroy();
        this.lives--;
        this.updateLives();
        this.createExplosion(ship.x, ship.y, 0x00ff00);
        
        if (this.lives <= 0) {
            this.gameOver();
        } else {
            this.invulnerable = true;
            this.ship.setAlpha(0.5);
            this.time.delayedCall(2000, () => {
                this.invulnerable = false;
                this.ship.setAlpha(1);
            });
        }
    }
    
    spawnPowerCore(x, y) {
        const core = this.powerCores.create(x, y, 'powerCore0');
        core.setData('timer', 0);
        core.setData('value', 50);
        core.setScale(2);
        core.setVelocity(0, 30);
    }
    
    collectPowerCore(ship, core) {
        const timer = core.getData('timer');
        let value = core.getData('value');
        let isBonus = false;
        
        if (timer >= 3000) {
            value *= 2;
            isBonus = true;
            this.createExplosion(core.x, core.y, 0xffff00);
            
            // Extra visual feedback for bonus
            const bonusText = this.add.text(core.x, core.y - 15, 'BONUS!', {
                fontFamily: 'Press Start 2P',
                fontSize: 6,
                color: '#ffff00'
            }).setOrigin(0.5);
            
            this.tweens.add({
                targets: bonusText,
                y: bonusText.y - 20,
                alpha: 0,
                duration: 1000,
                onComplete: () => bonusText.destroy()
            });
        }
        
        this.score += value;
        this.updateScore();
        core.destroy();
        
        // Show score popup - different sizes for bonus
        const popup = this.add.text(core.x, core.y, '+' + value, {
            fontFamily: 'Press Start 2P',
            fontSize: isBonus ? 10 : 8,
            color: isBonus ? '#ffff00' : '#ff6600'
        }).setOrigin(0.5);
        
        this.tweens.add({
            targets: popup,
            y: popup.y - 30,
            alpha: 0,
            duration: 1000,
            onComplete: () => popup.destroy()
        });
    }
    
    createHeartBreakEffect(x, y) {
        // Create 6-8 broken heart pieces that scatter
        const numPieces = Phaser.Math.Between(6, 8);
        
        for (let i = 0; i < numPieces; i++) {
            const pieceSize = Phaser.Math.Between(2, 4);
            const piece = this.add.rectangle(x, y, pieceSize, pieceSize, 0xff1744);
            
            const angle = (i / numPieces) * Math.PI * 2;
            const speed = Phaser.Math.Between(40, 80);
            const targetX = x + Math.cos(angle) * Phaser.Math.Between(15, 30);
            const targetY = y + Math.sin(angle) * Phaser.Math.Between(15, 30);
            
            this.tweens.add({
                targets: piece,
                x: targetX,
                y: targetY,
                alpha: 0,
                angle: Phaser.Math.Between(-180, 180),
                duration: Phaser.Math.Between(400, 700),
                ease: 'Cubic.easeOut',
                onComplete: () => piece.destroy()
            });
        }
        
        // Add a small flash
        const flash = this.add.circle(x, y, 8, 0xffffff, 0.8);
        this.tweens.add({
            targets: flash,
            alpha: 0,
            scale: 2,
            duration: 200,
            onComplete: () => flash.destroy()
        });
    }
    
    createExplosion(x, y, color) {
        for (let i = 0; i < 8; i++) {
            const particle = this.add.rectangle(x, y, 2, 2, color);
            const angle = (i / 8) * Math.PI * 2;
            const speed = 50;
            
            this.tweens.add({
                targets: particle,
                x: x + Math.cos(angle) * 20,
                y: y + Math.sin(angle) * 20,
                alpha: 0,
                duration: 500,
                onComplete: () => particle.destroy()
            });
        }
    }
    
    updateScore() {
        this.scoreText.setText('SCORE: ' + this.score);
    }
    
    updateLives() {
        this.livesText.setText('♥'.repeat(this.lives));
    }
    
    nextWave() {
        this.wave++;
        this.nextWaveScore = this.score + 200 + (this.wave * 50); // Next wave at higher score threshold
        this.spawnInterval = Math.max(600, this.spawnInterval - 200); // Faster spawns each wave
        this.waveText.setText('WAVE: ' + this.wave);
        
        // Flash wave text
        this.tweens.add({
            targets: this.waveText,
            alpha: 0,
            duration: 200,
            yoyo: true,
            repeat: 5
        });
    }
    
    gameOver() {
        this.gameState = 'ended';
        this.physics.pause();
        
        this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.7).setOrigin(0, 0);
        
        this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 30, 'GAME OVER', {
            fontFamily: 'Press Start 2P',
            fontSize: 12,
            color: '#ff0000'
        }).setOrigin(0.5);
        
        this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'SCORE: ' + this.score, {
            fontFamily: 'Press Start 2P',
            fontSize: 8,
            color: '#fff'
        }).setOrigin(0.5);
        
        this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 20, 'WAVE: ' + this.wave, {
            fontFamily: 'Press Start 2P',
            fontSize: 8,
            color: '#00ffff'
        }).setOrigin(0.5);
        
        this.time.delayedCall(2000, () => {
            returnToMenu(this, false, this.score);
        });
    }
}

// ============================================================================
// GAME 3: FLAMES (HTML-based love calculator)
// ============================================================================

function loadFlamesGame() {
    const canvasWrapper = document.getElementById('game-canvas-wrapper');
    canvasWrapper.classList.remove('zoom-out');
    canvasWrapper.classList.add('active', 'zoom-in');
    
    if (window.arcadeGame) {
        window.arcadeGame.destroy(true);
        window.arcadeGame = null;
    }
    
    const FLAMES = [
        { letter: 'F', meaning: 'Friends' },
        { letter: 'L', meaning: 'Lover' },
        { letter: 'A', meaning: 'Affection' },
        { letter: 'M', meaning: 'Marriage' },
        { letter: 'E', meaning: 'Enemy' },
        { letter: 'S', meaning: 'Sister' }
    ];
    
    canvasWrapper.innerHTML = `
        <style>
            .flames-container {
                width: 100%;
                height: 100%;
                background: linear-gradient(180deg, #1e1b4b 0%, #0f172a 100%);
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: 20px;
                overflow-y: auto;
            }
            .flames-title {
                font-family: 'Press Start 2P', monospace;
                font-size: 10px;
                color: #fbbf24;
                margin-bottom: 15px;
                text-shadow: 2px 2px 0 #000;
            }
            .flames-input-group {
                width: 100%;
                max-width: 260px;
                margin-bottom: 10px;
            }
            .flames-label {
                font-family: 'Press Start 2P', monospace;
                font-size: 5px;
                color: #94a3b8;
                margin-bottom: 4px;
                display: block;
            }
            .flames-input {
                width: 100%;
                padding: 8px;
                background: #1e293b;
                border: 2px solid #334155;
                color: #fff;
                font-family: 'Press Start 2P', monospace;
                font-size: 6px;
                outline: none;
            }
            .flames-input:focus {
                border-color: #fbbf24;
            }
            .flames-btn {
                font-family: 'Press Start 2P', monospace;
                font-size: 6px;
                padding: 10px 15px;
                background: #e91e63;
                color: #fff;
                border: 3px solid #ff4081;
                cursor: pointer;
                box-shadow: 0 3px 0 #ad1457;
                margin: 10px 0;
            }
            .flames-btn:hover {
                background: #ff4081;
            }
            .flames-btn:active {
                transform: translateY(2px);
                box-shadow: 0 1px 0 #ad1457;
            }
            .flames-back-btn {
                font-family: 'Press Start 2P', monospace;
                font-size: 5px;
                padding: 6px 10px;
                background: #334155;
                color: #94a3b8;
                border: 2px solid #475569;
                cursor: pointer;
                margin-top: 5px;
            }
            .flames-back-btn:hover {
                background: #475569;
                color: #fff;
            }
            .flames-display {
                display: flex;
                gap: 4px;
                margin: 15px 0;
                flex-wrap: wrap;
                justify-content: center;
            }
            .flame-letter {
                width: 28px;
                height: 28px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-family: 'Press Start 2P', monospace;
                font-size: 8px;
                background: #1e293b;
                border: 2px solid #334155;
                color: #fbbf24;
            }
            .flame-letter.crossed {
                background: #0f172a;
                color: #475569;
                text-decoration: line-through;
                opacity: 0.5;
            }
            .flame-letter.final {
                background: #e91e63;
                color: #fff;
                border-color: #ff4081;
                transform: scale(1.15);
            }
            .flames-result {
                text-align: center;
                margin-top: 15px;
                padding: 15px;
                background: #1e293b;
                border: 3px solid #fbbf24;
                max-width: 260px;
            }
            .flames-result-letter {
                font-family: 'Press Start 2P', monospace;
                font-size: 24px;
                color: #e91e63;
                margin-bottom: 8px;
            }
            .flames-result-meaning {
                font-family: 'Press Start 2P', monospace;
                font-size: 7px;
                color: #fbbf24;
            }
            .flames-info {
                font-family: 'Press Start 2P', monospace;
                font-size: 5px;
                color: #94a3b8;
                margin-top: 10px;
                text-align: center;
                max-width: 260px;
            }
            .flames-step {
                font-family: 'Press Start 2P', monospace;
                font-size: 5px;
                color: #cbd5e1;
                margin: 8px 0;
                padding: 6px;
                background: #1e293b;
                border-left: 3px solid #fbbf24;
            }
        </style>
        
        <div class="flames-container">
            <div class="flames-title">FLAMES</div>
            <div class="flames-input-group">
                <label class="flames-label">FIRST NAME</label>
                <input type="text" class="flames-input" id="flames-name1" autocomplete="off">
            </div>
            <div class="flames-input-group">
                <label class="flames-label">SECOND NAME</label>
                <input type="text" class="flames-input" id="flames-name2" autocomplete="off">
            </div>
            <button class="flames-btn" id="flames-calc-btn">CALCULATE</button>
            <div id="flames-steps"></div>
            <div class="flames-display" id="flames-letters"></div>
            <div id="flames-result-container"></div>
            <div class="flames-info">F=Friends L=Lover A=Affection<br>M=Marriage E=Enemy S=Sister</div>
            <button class="flames-back-btn" id="flames-back">← BACK TO MENU</button>
        </div>
    `;
    
    // FLAMES logic
    function cleanName(name) {
        return name.toLowerCase().replace(/[^a-z]/g, '').split('');
    }
    
    function eliminateCommon(name1Arr, name2Arr) {
        const n1 = [...name1Arr];
        const n2 = [...name2Arr];
        const result1 = [];
        const result2 = [];
        
        for (const char of n1) {
            const idx = n2.indexOf(char);
            if (idx === -1) {
                result1.push(char);
            } else {
                n2.splice(idx, 1);
            }
        }
        for (const char of n2) {
            result2.push(char);
        }
        
        return { remaining1: result1, remaining2: result2 };
    }
    
    function runFlamesStepByStep(count) {
        const steps = [];
        let letters = FLAMES.map(f => f.letter);
        let index = 0;
        if (count === 0) return { steps: [], final: 'F' };
        
        while (letters.length > 1) {
            index = (index + count - 1) % letters.length;
            const removed = letters[index];
            letters.splice(index, 1);
            index = index % letters.length;
            steps.push({ removed, remaining: [...letters] });
        }
        
        return { steps, final: letters[0] };
    }
    
    document.getElementById('flames-calc-btn').addEventListener('click', () => {
        const name1 = document.getElementById('flames-name1').value.trim();
        const name2 = document.getElementById('flames-name2').value.trim();
        
        if (!name1 || !name2) return;
        
        const arr1 = cleanName(name1);
        const arr2 = cleanName(name2);
        
        const { remaining1, remaining2 } = eliminateCommon(arr1, arr2);
        const totalCount = remaining1.length + remaining2.length;
        
        const { steps, final } = runFlamesStepByStep(totalCount);
        const result = FLAMES.find(f => f.letter === final);
        
        // Show steps
        const stepsEl = document.getElementById('flames-steps');
        stepsEl.innerHTML = `
            <div class="flames-step">${name1} & ${name2}</div>
            <div class="flames-step">Count: ${totalCount}</div>
        `;
        
        // Show FLAMES letters
        const lettersEl = document.getElementById('flames-letters');
        lettersEl.innerHTML = '';
        const letterElements = {};
        FLAMES.forEach(f => {
            const span = document.createElement('span');
            span.className = 'flame-letter';
            span.textContent = f.letter;
            span.dataset.letter = f.letter;
            letterElements[f.letter] = span;
            lettersEl.appendChild(span);
        });
        
        // Animate eliminations
        let stepIndex = 0;
        const interval = setInterval(() => {
            if (stepIndex >= steps.length) {
                clearInterval(interval);
                letterElements[result.letter].classList.add('final');
                
                document.getElementById('flames-result-container').innerHTML = `
                    <div class="flames-result">
                        <div class="flames-result-letter">${result.letter}</div>
                        <div class="flames-result-meaning">${result.meaning}</div>
                    </div>
                `;
                return;
            }
            
            const step = steps[stepIndex];
            const letterEl = letterElements[step.removed];
            if (letterEl && !letterEl.classList.contains('crossed')) {
                letterEl.classList.add('crossed');
            }
            stepIndex++;
        }, 600);
    });
    
    document.getElementById('flames-back').addEventListener('click', () => {
        showGameSelect();
    });
}

// ============================================================================
// GAME 4: MEMORY MATCH (2 Players - She always wins!)
// ============================================================================

function loadMemoryGame() {
    const canvasWrapper = document.getElementById('game-canvas-wrapper');
    canvasWrapper.classList.remove('zoom-out');
    canvasWrapper.classList.add('active', 'zoom-in');
    
    if (window.arcadeGame) {
        window.arcadeGame.destroy(true);
        window.arcadeGame = null;
    }
    
    const hearts = ['❤️', '💕', '💖', '💗', '💝', '💘', '💓', '💞'];
    let cards = [...hearts, ...hearts].sort(() => Math.random() - 0.5);
    
    let flippedCards = [];
    let matchedPairs = [];
    let currentPlayer = 'he';
    let heScore = 0;
    let sheScore = 0;
    let canFlip = true;
    
    canvasWrapper.innerHTML = `
        <style>
            .memory-container {
                width: 100%;
                height: 100%;
                background: linear-gradient(180deg, #1e1b4b 0%, #0f172a 100%);
                display: flex;
                flex-direction: column;
                align-items: center;
                padding: 15px;
                overflow-y: auto;
            }
            .memory-title {
                font-family: 'Press Start 2P', monospace;
                font-size: 9px;
                color: #fbbf24;
                margin-bottom: 10px;
                text-shadow: 2px 2px 0 #000;
            }
            .memory-scoreboard {
                display: flex;
                gap: 20px;
                margin-bottom: 10px;
                font-family: 'Press Start 2P', monospace;
                font-size: 6px;
            }
            .player-score {
                padding: 6px 10px;
                border: 2px solid #334155;
                background: #1e293b;
            }
            .player-score.active {
                border-color: #fbbf24;
                background: #2d1b4e;
            }
            .player-score.he {
                color: #60a5fa;
            }
            .player-score.she {
                color: #f472b6;
            }
            .memory-grid {
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 8px;
                margin-bottom: 15px;
                max-width: 260px;
            }
            .memory-card {
                width: 55px;
                height: 55px;
                background: #1e293b;
                border: 3px solid #334155;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 28px;
                cursor: pointer;
                transition: all 0.3s;
                position: relative;
            }
            .memory-card.flipped {
                background: #2d1b4e;
                border-color: #fbbf24;
            }
            .memory-card.matched {
                background: #0f172a;
                border-color: #059669;
                opacity: 0.6;
                cursor: default;
            }
            .memory-card:not(.flipped):not(.matched)::before {
                content: '?';
                font-family: 'Press Start 2P', monospace;
                font-size: 24px;
                color: #475569;
            }
            .memory-card.flipped .card-emoji,
            .memory-card.matched .card-emoji {
                display: block;
            }
            .card-emoji {
                display: none;
            }
            .memory-result {
                text-align: center;
                padding: 15px;
                background: #1e293b;
                border: 3px solid #fbbf24;
                max-width: 260px;
                margin-top: 10px;
            }
            .memory-winner {
                font-family: 'Press Start 2P', monospace;
                font-size: 10px;
                color: #f472b6;
                margin-bottom: 8px;
            }
            .memory-final-score {
                font-family: 'Press Start 2P', monospace;
                font-size: 6px;
                color: #cbd5e1;
                margin-bottom: 10px;
            }
            .memory-back-btn {
                font-family: 'Press Start 2P', monospace;
                font-size: 5px;
                padding: 6px 10px;
                background: #334155;
                color: #94a3b8;
                border: 2px solid #475569;
                cursor: pointer;
                margin-top: 8px;
            }
            .memory-back-btn:hover {
                background: #475569;
                color: #fff;
            }
        </style>
        
        <div class="memory-container">
            <div class="memory-title">MEMORY MATCH</div>
            <div class="memory-scoreboard">
                <div class="player-score he active" id="he-score">HE: 0</div>
                <div class="player-score she" id="she-score">SHE: 0</div>
            </div>
            <div class="memory-grid" id="memory-grid"></div>
            <div id="memory-result-container"></div>
            <button class="memory-back-btn" id="memory-back">← BACK TO MENU</button>
        </div>
    `;
    
    const gridEl = document.getElementById('memory-grid');
    cards.forEach((emoji, index) => {
        const card = document.createElement('div');
        card.className = 'memory-card';
        card.dataset.index = index;
        card.dataset.emoji = emoji;
        card.innerHTML = `<span class="card-emoji">${emoji}</span>`;
        card.addEventListener('click', () => flipCard(card));
        gridEl.appendChild(card);
    });
    
    function updateScoreboard() {
        document.getElementById('he-score').textContent = `HE: ${heScore}`;
        document.getElementById('she-score').textContent = `SHE: ${sheScore}`;
        
        document.getElementById('he-score').classList.toggle('active', currentPlayer === 'he');
        document.getElementById('she-score').classList.toggle('active', currentPlayer === 'she');
    }
    
    function flipCard(card) {
        if (!canFlip || card.classList.contains('flipped') || card.classList.contains('matched')) {
            return;
        }
        
        card.classList.add('flipped');
        flippedCards.push(card);
        
        if (flippedCards.length === 2) {
            canFlip = false;
            checkMatch();
        }
    }
    
    function checkMatch() {
        const [card1, card2] = flippedCards;
        const match = card1.dataset.emoji === card2.dataset.emoji;
        
        setTimeout(() => {
            if (match) {
                card1.classList.add('matched');
                card2.classList.add('matched');
                matchedPairs.push(card1.dataset.emoji);
                
                if (currentPlayer === 'he') {
                    heScore++;
                } else {
                    sheScore++;
                }
                
                updateScoreboard();
                
                if (matchedPairs.length === 8) {
                    setTimeout(() => showResult(), 500);
                }
            } else {
                card1.classList.remove('flipped');
                card2.classList.remove('flipped');
                currentPlayer = currentPlayer === 'he' ? 'she' : 'he';
                updateScoreboard();
            }
            
            flippedCards = [];
            canFlip = true;
        }, 1000);
    }
    
    function showResult() {
        const resultEl = document.getElementById('memory-result-container');
        
        // Determine actual winner
        let actualWinner = heScore > sheScore ? 'he' : (sheScore > heScore ? 'she' : 'tie');
        
        if (actualWinner === 'tie') {
            resultEl.innerHTML = `
                <div class="memory-result">
                    <div class="memory-winner">IT'S A TIE!</div>
                    <div class="memory-final-score">HE: ${heScore} | SHE: ${sheScore}</div>
                </div>
            `;
            setTimeout(() => {
                resultEl.querySelector('.memory-winner').textContent = 'SHE WINS! ♥';
            }, 2000);
        } else if (actualWinner === 'he') {
            // He wins initially, but then "she" appears
            resultEl.innerHTML = `
                <div class="memory-result">
                    <div class="memory-winner" id="winner-text">HE WINS!</div>
                    <div class="memory-final-score">HE: ${heScore} | SHE: ${sheScore}</div>
                </div>
            `;
            
            // Magic happens - "S" appears to make it "SHE WINS!"
            setTimeout(() => {
                const winnerText = document.getElementById('winner-text');
                let currentText = 'HE WINS!';
                winnerText.textContent = currentText;
                
                setTimeout(() => {
                    // Add "S" before "HE"
                    winnerText.textContent = 'SHE WINS! ♥';
                    winnerText.style.color = '#f472b6';
                }, 1500);
            }, 1000);
        } else {
            // She actually won
            resultEl.innerHTML = `
                <div class="memory-result">
                    <div class="memory-winner">SHE WINS! ♥</div>
                    <div class="memory-final-score">HE: ${heScore} | SHE: ${sheScore}</div>
                </div>
            `;
        }
    }
    
    document.getElementById('memory-back').addEventListener('click', () => {
        showGameSelect();
    });
}
