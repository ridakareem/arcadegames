/**
 * Valentine's Heart Catch - Pixelated Arcade Game
 * Phaser 3 - PlayStation Style
 */

// Game state
let gameInstance = null;
const GAME_WIDTH = 320;
const GAME_HEIGHT = 240;

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
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

function preload() {
    // Create pixelated textures at runtime
}

function create() {
    gameInstance = this;
    
    // Pixelated sky background
    this.cameras.main.setBackgroundColor('#1a0a2e');
    
    // Add pixel grid background for arcade feel
    const bg = this.add.graphics();
    for (let x = 0; x < GAME_WIDTH; x += 4) {
        for (let y = 0; y < GAME_HEIGHT; y += 4) {
            if ((x + y) % 8 === 0) {
                bg.fillStyle(0x2d1b4e, 0.5);
                bg.fillRect(x, y, 4, 4);
            }
        }
    }
    
    // Happiness meter (starts at 50)
    this.happiness = 50;
    this.happinessText = this.add.text(10, 10, 'HAPPINESS: 50', {
        fontFamily: 'Press Start 2P',
        fontSize: 8,
        color: '#ff6b9d'
    }).setOrigin(0, 0);
    
    this.happinessBarBg = this.add.rectangle(10, 28, GAME_WIDTH - 20, 12, 0x330011).setOrigin(0, 0);
    this.happinessBar = this.add.rectangle(12, 30, (GAME_WIDTH - 24) * (this.happiness / 100), 8, 0xff1744).setOrigin(0, 0);
    
    // Create heart groups
    this.redHearts = this.physics.add.group();
    this.brokenHearts = this.physics.add.group();
    
    // Create basket (pixelated)
    this.basket = this.add.container(0, 0);
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
    this.basket.add(this.basketSprite);
    // No physics on basket - use overlapRect to avoid hearts getting stuck on collision
    this.basketCatchWidth = 40;
    this.basketCatchHeight = 20;
    
    // Basket movement
    this.cursors = this.input.keyboard.createCursorKeys();
    this.basketSpeed = 180;
    
    // Spawn hearts
    this.spawnTimer = 0;
    this.spawnInterval = 1200;
    
    // Create heart textures
    createHeartTextures(this);
    
    this.gameState = 'playing';
}

function createHeartTextures(scene) {
    const size = 16;
    
    // Red heart texture
    const redHeartGfx = scene.add.graphics();
    redHeartGfx.fillStyle(0xff1744, 1);
    // Simple pixel heart shape
    const heartPixels = [
        [0,0,1,1,0,0,1,1,0,0],
        [0,1,1,1,1,1,1,1,1,0],
        [0,1,1,1,1,1,1,1,1,0],
        [0,0,1,1,1,1,1,1,0,0],
        [0,0,0,1,1,1,1,0,0,0],
        [0,0,0,0,1,1,0,0,0,0]
    ];
    const px = size / 10;
    heartPixels.forEach((row, y) => {
        row.forEach((cell, x) => {
            if (cell) redHeartGfx.fillRect(x * px, y * px, px, px);
        });
    });
    redHeartGfx.generateTexture('redHeart', size, size);
    redHeartGfx.destroy();
    
    // Broken heart texture (cracked)
    const brokenHeartGfx = scene.add.graphics();
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

function spawnHeart(scene) {
    const isRed = Phaser.Math.Between(0, 100) < 70; // 70% red, 30% broken
    const x = Phaser.Math.Between(20, GAME_WIDTH - 20);
    
    const texture = isRed ? 'redHeart' : 'brokenHeart';
    const heart = isRed 
        ? scene.redHearts.create(x, -20, texture)
        : scene.brokenHearts.create(x, -20, texture);
    
    heart.setScale(1.5);
    heart.setData('isRed', isRed);
    heart.body.setVelocity(0, 80);
    heart.body.setCollideWorldBounds(false);
}

function update(time, delta) {
    if (!gameInstance || gameInstance.gameState !== 'playing') return;
    
    const scene = gameInstance;
    if (!scene.basketSprite) return;
    
    // Basket movement - keyboard has priority
    const keyLeft = scene.cursors && scene.cursors.left.isDown;
    const keyRight = scene.cursors && scene.cursors.right.isDown;
    if (keyLeft) {
        scene.basketSprite.x -= scene.basketSpeed * (delta / 1000);
    } else if (keyRight) {
        scene.basketSprite.x += scene.basketSpeed * (delta / 1000);
    } else {
        // Touch/mouse - follow pointer when not using keyboard
        const pointer = scene.input.activePointer;
        if (pointer && typeof pointer.x === 'number') {
            let px = pointer.x;
            if (pointer.positionToCamera) {
                const wp = pointer.positionToCamera(scene.cameras.main);
                if (wp) px = wp.x;
            }
            scene.basketSprite.x = Phaser.Math.Clamp(px, 30, GAME_WIDTH - 30);
        }
    }
    
    scene.basketSprite.x = Phaser.Math.Clamp(scene.basketSprite.x, 30, GAME_WIDTH - 30);
    
    // Catch hearts - manual bounds check (reliable, no physics blocking)
    const catchLeft = scene.basketSprite.x - scene.basketCatchWidth / 2;
    const catchRight = scene.basketSprite.x + scene.basketCatchWidth / 2;
    const catchTop = scene.basketSprite.y - scene.basketCatchHeight / 2;
    const catchBottom = scene.basketSprite.y + scene.basketCatchHeight / 2;
    
    function isInBasket(heart) {
        return heart.active && heart.x >= catchLeft && heart.x <= catchRight &&
               heart.y >= catchTop && heart.y <= catchBottom;
    }
    
    const redToCatch = scene.redHearts.getChildren().filter(isInBasket);
    for (let i = 0; i < redToCatch.length && scene.gameState === 'playing'; i++) {
        const heart = redToCatch[i];
        heart.setActive(false);
        heart.destroy();
        scene.happiness = Math.min(100, scene.happiness + 2);
        scene.updateHappinessDisplay();
        scene.checkWin();
    }
    
    const brokenToCatch = scene.brokenHearts.getChildren().filter(isInBasket);
    for (let i = 0; i < brokenToCatch.length && scene.gameState === 'playing'; i++) {
        const heart = brokenToCatch[i];
        heart.setActive(false);
        heart.destroy();
        scene.happiness = Math.max(0, scene.happiness - 10);
        scene.updateHappinessDisplay();
        scene.checkGameOver();
    }
    
    // Spawn hearts
    scene.spawnTimer += delta;
    if (scene.spawnTimer >= scene.spawnInterval) {
        scene.spawnTimer = 0;
        spawnHeart(scene);
        scene.spawnInterval = Math.max(600, scene.spawnInterval - 5);
    }
    
    // Check missed red hearts (fell off bottom)
    const toRemove = [];
    scene.redHearts.getChildren().forEach(heart => {
        if (heart.y > GAME_HEIGHT + 20) toRemove.push(heart);
    });
    toRemove.forEach(heart => heart.destroy());
    if (toRemove.length > 0) {
        scene.happiness = Math.max(0, scene.happiness - (10 * toRemove.length));
        scene.updateHappinessDisplay();
        scene.checkGameOver();
    }
    
    // Remove broken hearts that fell off (no penalty)
    scene.brokenHearts.getChildren().forEach(heart => {
        if (heart.y > GAME_HEIGHT + 20) {
            heart.destroy();
        }
    });
}

function updateHappinessDisplay() {
    gameInstance.happinessText.setText('HAPPINESS: ' + gameInstance.happiness);
    const barWidth = (GAME_WIDTH - 24) * (gameInstance.happiness / 100);
    gameInstance.happinessBar.width = Math.max(0, barWidth);
    
    if (gameInstance.happiness < 30) {
        gameInstance.happinessBar.setFillStyle(0xff1744);
    } else if (gameInstance.happiness < 70) {
        gameInstance.happinessBar.setFillStyle(0xff9800);
    } else {
        gameInstance.happinessBar.setFillStyle(0x4caf50);
    }
}

function checkWin() {
    if (gameInstance.happiness >= 100) {
        gameInstance.gameState = 'won';
        gameOverSequence(true);
    }
}

function checkGameOver() {
    if (gameInstance.happiness <= 0) {
        gameInstance.gameState = 'lost';
        gameOverSequence(false);
    }
}

function gameOverSequence(won) {
    const scene = gameInstance;
    scene.physics.pause();
    
    const msg = won ? 'YOU WIN! <3' : 'GAME OVER';
    const color = won ? '#4caf50' : '#f44336';
    
    scene.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.7)
        .setOrigin(0, 0);
    
    scene.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 20, msg, {
        fontFamily: 'Press Start 2P',
        fontSize: 12,
        color: color
    }).setOrigin(0.5);
    
    scene.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 20, 'HAPPINESS: ' + scene.happiness, {
        fontFamily: 'Press Start 2P',
        fontSize: 8,
        color: '#fff'
    }).setOrigin(0.5);
    
    // Zoom out after delay
    scene.time.delayedCall(2000, () => {
        const wrapper = document.getElementById('game-canvas-wrapper');
        wrapper.classList.remove('zoom-in');
        wrapper.classList.add('zoom-out');
        
        document.getElementById('start-screen').classList.remove('hidden');
        document.getElementById('start-screen').innerHTML = `
            <h1>${won ? 'YOU WIN!' : 'GAME OVER'}</h1>
            <p>${won ? 'Love conquered all! <3' : 'Happiness reached zero...'}</p>
            <p>HAPPINESS: ${scene.happiness}</p>
            <button id="start-btn">PLAY AGAIN</button>
        `;
        
        document.getElementById('start-btn').onclick = restartGame;
    });
}

function startGame() {
    document.getElementById('start-screen').classList.add('hidden');
    
    const canvasWrapper = document.getElementById('game-canvas-wrapper');
    canvasWrapper.classList.remove('zoom-out');
    canvasWrapper.classList.add('active', 'zoom-in');
    
    if (!window.valentineGame) {
        window.valentineGame = new Phaser.Game(config);
    } else {
        window.valentineGame.scene.restart();
    }
}

function restartGame() {
    document.getElementById('start-screen').classList.add('hidden');
    
    const canvasWrapper = document.getElementById('game-canvas-wrapper');
    canvasWrapper.classList.remove('zoom-out');
    canvasWrapper.classList.add('zoom-in');
    
    if (window.valentineGame) {
        window.valentineGame.scene.restart();
    }
}

// Initialize on start button click
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('start-btn').addEventListener('click', () => {
        startGame();
    });
});
