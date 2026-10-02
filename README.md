# PokeWorld

A cross-platform, turn-based multiplayer RPG. Players build maps, create or join matches, and battle on a tile grid in **Classic** or **Capture the Flag** mode. It runs on desktop (Electron), the web (Angular), and mobile (Flutter), with one real-time NestJS server.

Built by a team of 6 at Polytechnique Montréal (Winter 2026). It extends the codebase from an earlier course project.

<!-- Add 2–3 screenshots or a short GIF here: lobby, a match in progress, the shop -->

## Features

- **Real-time multiplayer** over Socket.IO: lobbies, turns, movement, combat, and chat
- **Drop-in / drop-out:** join a match already in progress, or leave and rejoin without losing your stats
- **Two game modes:** Classic and Capture the Flag (team-based, even player counts)
- **Bots** with aggressive or defensive behavior to fill a match
- **Player accounts** with friends, friend-only matches, and preferences
- **In-game economy:** virtual currency, a shop with unlockable items, and match entry fees paid out to the winner
- **Per-match challenges** (Explorer, Duelist, Collector, ...) assigned to each player
- **Map editor** for building and validating custom maps
- English and French UI

## Tech stack

| Part | Tech |
|---|---|
| Server | NestJS, Socket.IO, MongoDB, deployed on AWS EC2 |
| Desktop / web client | Angular, Electron |
| Mobile client | Flutter (Dart) |
| Shared | TypeScript interfaces and constants in `common/` |
| Quality | Jest and Jasmine unit tests, ESLint, GitLab CI (lint, test, deploy) |

## My contributions (Firas Argoubi)

- **Drop-in / drop-out:** server-side lobby and match logic so players can join live matches and rejoin with their stats intact, with unit tests
- **Leaving mid-match:** turn handoff when the active player leaves, plus safety nets for missing players and spawn points so matches keep running
- **Accounts and sessions** across desktop and mobile, including auth and chat error handling
- **Economy:** virtual currency, shop items, match entry fees, and game challenges (server and desktop client)
- **Desktop app:** Electron integration and the Electron-Builder packaging command
- **Deployment:** reworked the server deployment pipeline

## Running locally

```bash
# Server (port 3000)
cd server && npm ci && npm start

# Web / desktop client (port 4200)
cd client && npm ci && npm start

# Mobile client
cd client_mobile && flutter pub get && flutter run
```

The server needs a MongoDB connection string. See `server/` for configuration.
