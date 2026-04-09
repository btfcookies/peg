# Peg

Retro roguelike browser-based Plinko built with React, Vite, and Matter.js physics.

## Features

- Physics-driven peg board using Matter.js.
- Coin economy with upgrades and scaling costs.
- Slot progression and payout growth over time.
- Toggleable settings panel with sound on/off and volume slider.
- Retro pixel-inspired UI and animated reward floaters.

## Tech Stack

- React 19
- Vite 8
- Matter.js

## Getting Started

### Prerequisites

- Node.js 18+ (or current LTS)
- npm

### Install

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```text
src/
	App.jsx        # Main game logic, physics wiring, upgrades, UI
	App.css        # Retro styling and responsive layout
	index.css      # Global baseline styles
public/
index.html
```

## Gameplay Notes

- Peg collisions can award bonus coins based on upgrade chance.
- Slots level up as they fill, improving payouts.
- Ball count is capped by owned balls.

## License

No license file has been added yet. Add one if you plan to distribute this project.
