# Frontend Documentation

This comprehensive guide covers all aspects of the Math Mystery frontend application, including architecture, development workflows, and testing.

---

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Project Structure](#project-structure)
3. [Setup & Development](#setup--development)
4. [Testing](#testing)
5. [Core Components](#core-components)
6. [API Integration](#api-integration)
7. [Troubleshooting](#troubleshooting)

---

## Architecture Overview

### Tech Stack
- **Build Tool**: Vite (Next Generation Frontend Tooling)
- **Language**: TypeScript (Strict typing)
- **Graphics Library**: Konva.js (2D canvas library)
- **Testing**: Vitest (Unit and Integration testing)
- **Styling**: CSS Modules / Vanilla CSS

### Design Pattern
The application follows a **Model-View-Controller (MVC)** pattern for each screen:
- **Model**: Manages state and logic (e.g., game state, menu options).
- **View**: Handles rendering using Konva.js (Groups, Shapes, Text).
- **Controller**: Connects Model and View, handles user input, and manages transitions.

### Screen Management
The `App` class (`src/main.ts`) acts as the main coordinator:
- Initializes the Konva Stage and Layer.
- Instantiates controllers for each screen (Menu, Game, Pause).
- Manages visibility by toggling screen groups on the main layer.
- Ensures only one screen is interactive/visible at a time.

---

## Project Structure

The frontend source code is located in `frontend/` while configuration files reside in the project root.

```
.
├── package.json            # Dependencies and scripts
├── tsconfig.json          # TypeScript configuration
├── vite.config.ts         # Vite configuration
├── index.html             # Application entry point
└── frontend/
    ├── src/
    │   ├── main.ts        # App entry point & Screen Manager
    │   ├── api.ts         # Backend API client
    │   ├── constants.ts   # Global constants (Stage size, etc.)
    │   ├── types.ts       # Shared type definitions
    │   └── screens/       # Screen components (MVC)
    │       ├── MenuScreen/
    │       ├── GameScreen/
    │       ├── PauseScreen/
    │       └── NotebookScreen/
    └── tests/             # Integration and Unit tests
        └── api.test.ts    # API client tests
```

---

## Setup & Development

### Prerequisites
- Node.js (v16 or higher)
- npm (Node Package Manager)

### Installation
1. **Install Dependencies** (from root directory):
   ```bash
   npm install
   ```

### Running Locally
1. **Start Development Server**:
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:5173` (default Vite port).

2. **Build for Production**:
   ```bash
   npm run build
   ```
   Output will be generated in `dist/`.

3. **Preview Production Build**:
   ```bash
   npm run preview
   ```

---

## Testing

Tests are built with **Vitest**, providing a fast and compatible testing environment.

### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode (default)
npm test

# Run specific test file
npm test frontend/tests/api.test.ts
```

### Test Structure
- **Unit Tests**: Located alongside source files (e.g., `src/example.test.ts`).
- **Integration Tests**: Located in `frontend/tests/`.
- **Mocking**: `vi.mock` is used to mock global `fetch` for API tests.

---

## Core Components

### App (`src/main.ts`)
The entry point that initializes the Konva stage and manages screen transitions. It implements the `ScreenSwitcher` interface to allow screens to request changes (e.g., Menu -> Game).

### Screens
Each screen directory typically contains:
- `*Model.ts`: Data and business logic.
- `*View.ts`: Konva drawing logic.
- `*Controller.ts`: Input handling and coordination.

#### Menu Screen
- Displays the main menu.
- Handles navigation to Game or Options.

#### Game Screen
- The core gameplay loop.
- Renders the game world, player, and NPCs.
- Manages game state updates.

#### Pause Screen
- Overlays the game when paused.
- Allows resuming or quitting to menu.

---

## API Integration

Communication with the backend is handled by `src/api.ts`.

### Configuration
The API URL is configured via environment variables:
- `VITE_API_URL`: Defaults to `http://localhost:8000`.

### API Client (`api.ts`)
Provides typed methods for all backend endpoints:

```typescript
// Example Usage
import { api } from "./api";

// Check backend health
const health = await api.health();

// Register a user
const result = await api.register("user@example.com", "password");

// Sync game state
const gameState = await api.syncGame();
```

### Authentication
Authentication is handled via **HttpOnly cookies** set by the backend. The frontend client automatically includes credentials (cookies) in requests, so no manual token management is needed in the frontend code.

---

## Troubleshooting

### Common Issues

#### "Cannot find name 'process'"
**Cause**: Missing Node.js type definitions in a browser environment.
**Solution**: Ensure `@types/node` is installed and included in `tsconfig.json` types.

#### "Connection Refused" (API Error)
**Cause**: Backend server is not running.
**Solution**: Ensure the backend is running on port 8000.
```bash
cd backend
uvicorn main:app --reload
```

#### CORS Errors
**Cause**: Backend not configured to accept requests from frontend port.
**Solution**: Check `backend/main.py` CORS settings to include `http://localhost:5173`.

---

**Last Updated**: 2025-11-26
**Frontend Version**: 1.0.0
