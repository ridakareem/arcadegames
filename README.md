# 💘 Valentine's Arcade Collection - PlayStation Style

A retro-styled arcade game collection housed in a nostalgic PlayStation console interface. Perfect for Valentine's Day with 4 romantic-themed games!

![PlayStation Style Arcade](https://img.shields.io/badge/Style-PlayStation-gray?style=flat-square)
![Games](https://img.shields.io/badge/Games-4-red?style=flat-square)
![Theme](https://img.shields.io/badge/Theme-Valentine's-ff69b4?style=flat-square)

## 🎮 Games Included

### 1. ❤️ Heart Catch
**Genre:** Arcade Action  
**Objective:** Catch falling red hearts while avoiding broken hearts!

- Start with 50% happiness
- **Catch red hearts** → +2% happiness
- **Catch broken hearts** → -10% happiness
- **Miss red hearts** → -10% happiness
- **Win condition:** Reach 100% happiness
- **Lose condition:** Happiness drops to 0%

**Controls:** Arrow keys or mouse/touch to move basket

---

### 2. 💔 Heartbreak
**Genre:** Space Shooter  
**Objective:** Shoot falling hearts and collect power cores for massive points!

- Whole hearts fall from the sky
- Shoot them and they **shatter into pieces** 💔
- Enemies drop **Power Cores** 🔥

**The Risk vs Reward Mechanic:**
- Grab core immediately = **50 points**
- Wait 3 seconds = **100 points (DOUBLE!)**
- Wait 4+ seconds = **Core EXPLODES** (0 points)

**Controls:** 
- Arrow keys to move
- SPACEBAR to shoot

---

### 3. 🔥 FLAMES
**Genre:** Love Calculator  
**Classic game:** Friends, Lover, Affection, Marriage, Enemy, Sister

**How it works:**
1. Enter two names
2. Common letters are eliminated
3. Count remaining letters
4. Eliminate F-L-A-M-E-S letters one by one
5. Last letter remaining reveals your bond!

**Interactive features:**
- Watch letters get crossed out with animation
- See the final result with a big reveal
- Try different name combinations

---

### 4. 🎴 Memory Match
**Genre:** 2-Player Card Game  
**He vs She** - Match the most pairs to win!

- Take turns flipping two cards
- Find matching heart emoji pairs
- Match = Keep your turn + 1 point
- No match = Other player's turn

**The Twist:** 
Even if "He" wins... the game declares **"SHE WINS!"** 💕  
(The text magically changes: "HE WINS!" → "S" appears → "SHE WINS!")

---

## 🚀 Getting Started

### Installation

1. **Download the files:**
   - `index.html`
   - `style.css`
   - `game.js`

2. **Place all files in the same folder**

3. **Open `index.html` in a web browser**

That's it! No installation or dependencies required.

### Requirements

- Modern web browser (Chrome, Firefox, Safari, Edge)
- JavaScript enabled
- Screen resolution: 1024x768 or higher recommended

---

## 🎨 Features

### Visual Design
- ✅ **PlayStation-inspired console** - Nostalgic gray shell design
- ✅ **Pixelated retro graphics** - 8-bit arcade aesthetic
- ✅ **Smooth animations** - Zoom effects, transitions, particle effects
- ✅ **Responsive design** - Adapts to different screen sizes

### Technical Features
- ✅ **Built with Phaser 3** - Professional game framework
- ✅ **Pixel-perfect rendering** - Crisp retro graphics
- ✅ **No external dependencies** - Just load and play
- ✅ **Save system** - Memory game rigged outcome, FLAMES persistent storage
- ✅ **Multiple input methods** - Keyboard, mouse, and touch support

---

## 🕹️ Controls

### Universal Controls
- **Mouse/Click** - Navigate menus and select games
- **Arrow Keys** - Most games support keyboard controls

### Game-Specific Controls

| Game | Controls |
|------|----------|
| Heart Catch | Arrow keys or mouse to move basket |
| Heartbreak | Arrow keys to move, SPACEBAR to shoot |
| FLAMES | Mouse/keyboard input for names |
| Memory Match | Click/tap cards to flip |

---

## 📁 Project Structure

```
valentine-arcade/
│
├── index.html          # Main HTML file
├── style.css          # PlayStation shell & UI styling
├── game.js            # All game logic (1400+ lines)
└── README.md          # This file
```

### File Details

**index.html** (100 lines)
- PlayStation console structure
- Game selection menu
- Start screens for each game

**style.css** (350 lines)
- PlayStation shell styling
- Game card designs
- Responsive layout
- Button animations

**game.js** (1400+ lines)
- Game selection system
- Heart Catch game (Phaser Scene)
- Heartbreak game (Phaser Scene)
- FLAMES calculator (HTML/JS)
- Memory Match game (HTML/JS)

---

## 🎯 Game Tips & Tricks

### Heart Catch
- Hearts fall faster as you progress
- Prioritize red hearts over avoiding broken ones
- Use keyboard for more precise control

### Heartbreak
- Learn enemy patterns for efficient shooting
- Risk vs Reward: Only wait for cores when safe
- Use the edges to dodge while cores charge
- Each wave gets progressively harder

### FLAMES
- Try variations of names (nicknames, full names)
- The algorithm is deterministic (same names = same result)
- "S" can mean Sister, Soulmate, or close friends

### Memory Match
- Remember card positions early
- She always wins (it's rigged!) 😉
- Just enjoy the journey

---

## 🛠️ Customization

### Change PlayStation Name
Edit line 14 in `index.html`:
```html
<div id="ps-logo">CRINGESTATION</div>
```

### Adjust Console Size
Edit line 23 in `style.css`:
```css
width: min(92vw, 600px);  /* Change 600px to your preferred size */
```

### Modify Game Difficulty

**Heart Catch** - Line 227 in `game.js`:
```javascript
this.spawnInterval = 1200; // Lower = harder
```

**Heartbreak** - Line 556 in `game.js`:
```javascript
this.obstacleSpeed = 50; // Higher = harder
```

---

## 🐛 Troubleshooting

### Games won't load
- Make sure all 3 files are in the same folder
- Check browser console (F12) for errors
- Ensure JavaScript is enabled

### Scrolling doesn't work in FLAMES
- Try using mouse wheel directly on the game area
- Look for the gold scrollbar on the right side
- Update to the latest version of the files

### Graphics look blurry
- The games use pixel-perfect rendering
- Zoom your browser to 100% (Ctrl+0)
- Don't resize the browser window while playing

### Touch controls not working
- Some games are optimized for desktop
- Heart Catch works with touch
- Memory Match fully supports touch

---

## 📝 Credits

### Technology Stack
- **Phaser 3** - Game framework (https://phaser.io)
- **Press Start 2P** - Retro pixel font (Google Fonts)
- **Vanilla JavaScript** - No frameworks for HTML games

### Design Inspiration
- Original PlayStation console design
- Classic arcade aesthetics
- Valentine's Day themes

### Game Concepts
- Heart Catch - Original arcade concept
- Heartbreak - Inspired by Asteroids/Galaga
- FLAMES - Classic school game algorithm
- Memory Match - Traditional memory card game

---

## 📜 License

This project is free to use for personal and educational purposes.

**Attribution appreciated but not required!**

Feel free to:
- ✅ Play and share
- ✅ Modify for personal use
- ✅ Learn from the code
- ✅ Create your own versions

---

## 🎉 Special Features

### Easter Eggs
- The Memory Match game is rigged - she always wins! 💕
- PlayStation logo says "CRINGESTATION"
- Power cores in Heartbreak have visual charging states

### Hidden Details
- Heart Catch happiness bar changes color (red → orange → green)
- Heartbreak has particle effects when hearts shatter
- FLAMES letters animate when being eliminated
- Smooth zoom transitions between menu and games

---

## 💝 Perfect For

- 💑 Valentine's Day dates
- 🎁 Romantic gifts
- 🎮 Retro gaming enthusiasts
- 💻 Web development portfolio
- 🏫 JavaScript learning projects
- 🎨 Game design inspiration

---

## 🔮 Future Ideas

Potential additions (not yet implemented):
- High score system with local storage
- Sound effects and background music
- More games (Pong, Snake, Tetris variants)
- Multiplayer online support
- Save/load game states
- Achievement system
- Custom themes/skins

---

## 📞 Support

Having issues or questions?

1. Check the **Troubleshooting** section above
2. Ensure you're using the latest version of the files
3. Try a different web browser
4. Clear browser cache and reload

---

## ⭐ Show Your Love

If you enjoyed these games:
- Share with someone special 💕
- Customize it for your Valentine
- Learn from the code and make your own!

---

**Made with ❤️ for Valentine's Day**

*A retro gaming experience wrapped in nostalgia* 🎮✨

---

## Version History

**v1.0** - February 2025
- Initial release with 4 games
- PlayStation-style interface
- Full keyboard/mouse/touch support
- Responsive design

