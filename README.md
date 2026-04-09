# Peg

Retro roguelike browser-based Plinko built with React, Vite, and Matter.js physics.

## Features

- Physics-driven peg board using Matter.js.
- Coin economy with upgrades and scaling costs.
- Slot progression and payout growth over time.
- Toggleable settings panel with sound on/off and volume slider.
- Main nav tabs for `Play` and `Leaderboard` views.
- Persistent Node.js global leaderboard (file-backed) with top-3 badges and player profile inspection.
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

### Run Leaderboard Server

```bash
npm run server
```

Run `npm run dev` and `npm run server` in separate terminals during development.

The frontend calls `/api/*` and is proxied to `http://localhost:3001` in development.

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
server/
	index.js       # Persistent leaderboard API
	data/
		leaderboard.json
public/
index.html
```

## Gameplay Notes

- Peg collisions can award bonus coins based on upgrade chance.
- Slots level up as they fill, improving payouts.
- Ball count is capped by owned balls.
- Submit your current profile to the global leaderboard from the `Leaderboard` tab.

## Leaderboard API

Base URL (dev): `http://localhost:3001`

- `GET /api/health` - health check
- `GET /api/leaderboard?limit=50` - ranked entries by coins
- `GET /api/leaderboard/:username` - single player profile and rank
- `POST /api/leaderboard/submit` - create/update a player entry

Submission payload fields used by the app:

- `username` (3-20 chars, letters/numbers/spaces/`_`/`-`)
- `coins`
- `totalCoins`
- `totalBalls`
- `upgrades`
- `slotLevels`
- `ownedSkins`
- `selectedSkin`

Data persistence:

- Stored at `server/data/leaderboard.json`
- Entries are updated by username (case-insensitive)

## License
MIT License
