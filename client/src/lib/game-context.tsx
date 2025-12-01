import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { Category, INITIAL_CATEGORIES } from './locations';
import { getLocationName } from './location-i18n';
import { startMusic, stopMusic } from './audio';

// Types
export type Role = 'spy' | 'civilian';

export type Player = {
  id: string;
  name: string;
  role: Role;
  isDead: boolean;
  votes: number;
};

export type GamePhase = 'setup' | 'reveal' | 'playing' | 'voting' | 'result';

export type AppSettings = {
  sound: boolean;
  vibrate: boolean;
  music: boolean;
  highContrast: boolean;
  language: 'en' | 'tr';
};

export type GameState = {
  mode: 'offline' | 'online' | null;
  players: Player[];
  appSettings: AppSettings;
  settings: {
    playerCount: number;
    spyCount: number;
    isTimerOn: boolean;
    timerDuration: number; // in minutes
    selectedCategories: string[];
    disabledLocations: Record<string, string[]>;
    noRepeatLocations: boolean;
  };
  gameData: {
    currentLocation: string;
    currentRevealIndex: number;
    timeLeft: number; // in seconds
    winner: 'spy' | 'civilian' | null;
    spiesRemaining: number;
    categories: Category[];
    usedLocations: string[];
  };
  phase: GamePhase;
};

type Action =
  | { type: 'SET_MODE'; payload: 'offline' | 'online' }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<GameState['settings']> }
  | { type: 'UPDATE_APP_SETTINGS'; payload: Partial<AppSettings> }
  | { type: 'UPDATE_PLAYERS'; payload: string[] }
  | { type: 'SET_PLAYERS'; payload: Player[] }
  | { type: 'START_GAME'; payload: { location: string; players: Player[] } }
  | { type: 'START_NEW_ROUND' }
  | { type: 'NEXT_REVEAL' }
  | { type: 'START_PLAYING' }
  | { type: 'TICK_TIMER' }
  | { type: 'START_VOTING' }
  | { type: 'CAST_VOTE'; payload: string } // player id
  | { type: 'ELIMINATE_PLAYER'; payload: string } // player id
  | { type: 'SPY_GUESS'; payload: string } // guessed location
  | { type: 'GAME_OVER'; payload: 'spy' | 'civilian' }
  | { type: 'RESET_GAME' }
  | { type: 'ADD_CATEGORY'; payload: Category }
  | { type: 'DELETE_CATEGORY'; payload: string }
  | { type: 'TOGGLE_CATEGORY'; payload: string } // id
  | { type: 'ADD_LOCATION'; payload: { categoryId: string, location: string } }
  | { type: 'REMOVE_LOCATION'; payload: { categoryId: string, location: string } }
  | { type: 'TOGGLE_LOCATION'; payload: { categoryId: string, location: string } };

// Load settings from local storage (app-level)
const savedSettingsRaw = localStorage.getItem('spy-settings');
const parsedSettings = savedSettingsRaw ? JSON.parse(savedSettingsRaw) : {};
const initialAppSettings: AppSettings = {
  sound: true,
  vibrate: true,
  music: true,
  highContrast: false,
  language: 'en',
  ...parsedSettings,
};

const SETTINGS_STORAGE_KEY = 'spy-offline-settings';

function loadSavedSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') return parsed;
  } catch {
    /* ignore */
  }
  return null;
}

const savedOfflineSettings = loadSavedSettings();

const initialState: GameState = {
  mode: null,
  players: [],
  appSettings: initialAppSettings,
  settings: {
    playerCount: savedOfflineSettings?.playerCount ?? 4,
    spyCount: savedOfflineSettings?.spyCount ?? 1,
    isTimerOn: savedOfflineSettings?.isTimerOn ?? true,
    timerDuration: savedOfflineSettings?.timerDuration ?? 5,
    selectedCategories: savedOfflineSettings?.selectedCategories ?? ['standard'],
    disabledLocations: savedOfflineSettings?.disabledLocations ?? {},
    noRepeatLocations: savedOfflineSettings?.noRepeatLocations ?? false,
  },
  gameData: {
    currentLocation: '',
    currentRevealIndex: 0,
    timeLeft: (savedOfflineSettings?.timerDuration ?? 5) * 60,
    winner: null,
    spiesRemaining: 0,
    categories: INITIAL_CATEGORIES,
    usedLocations: [],
  },
  phase: 'setup',
};

const GameContext = createContext<{
  state: GameState;
  dispatch: React.Dispatch<Action>;
} | undefined>(undefined);

function persistSettings(settings: GameState['settings']) {
  try {
    localStorage.setItem(
      SETTINGS_STORAGE_KEY,
      JSON.stringify({
        playerCount: settings.playerCount,
        spyCount: settings.spyCount,
        isTimerOn: settings.isTimerOn,
        timerDuration: settings.timerDuration,
        selectedCategories: settings.selectedCategories,
        disabledLocations: settings.disabledLocations,
        noRepeatLocations: settings.noRepeatLocations,
      }),
    );
  } catch {
    /* ignore */
  }
}

function buildPlayersForRound(state: GameState): Player[] {
  const names = state.players.map((p) => p.name);
  while (names.length < state.settings.playerCount) {
    names.push(`Player ${names.length + 1}`);
  }
  const trimmed = names.slice(0, state.settings.playerCount);
  return trimmed.map((name, idx) => {
    const existing = state.players[idx];
    return {
      id: existing?.id ?? `p-${idx}`,
      name,
      role: 'civilian' as Role,
      isDead: false,
      votes: 0,
    };
  });
}

function pickLocation(state: GameState): string | null {
  const validCategories = state.gameData.categories
    .filter((c) => state.settings.selectedCategories.includes(c.id))
    .map((c) => ({
      ...c,
      enabledLocations: c.locations.filter(
        (loc) => !(state.settings.disabledLocations[c.id] || []).includes(loc),
      ),
    }))
    .filter((c) => c.enabledLocations.length > 0);
  if (validCategories.length === 0) return null;
  let pool = validCategories.flatMap((c) => c.enabledLocations);
  if (state.settings.noRepeatLocations) {
    pool = pool.filter((loc) => !state.gameData.usedLocations.includes(loc));
  }
  if (pool.length === 0) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}

function assignSpies(players: Player[], spyCount: number): Player[] {
  const pool = [...players];
  let assigned = 0;
  while (assigned < Math.min(spyCount, players.length - 1)) {
    const idx = Math.floor(Math.random() * pool.length);
    const candidate = pool[idx];
    if (candidate.role !== 'spy') {
      candidate.role = 'spy';
      assigned++;
    }
  }
  return players.map((p) => ({ ...p }));
}

const gameReducer = (state: GameState, action: Action): GameState => {
  switch (action.type) {
    case 'SET_MODE':
      return { ...state, mode: action.payload };
      
    case 'UPDATE_SETTINGS':
      const updatedSettings = { ...state.settings, ...action.payload };
      persistSettings(updatedSettings);
      return { ...state, settings: updatedSettings, gameData: { ...state.gameData, usedLocations: [] } };
      
    case 'UPDATE_APP_SETTINGS':
      const newAppSettings = { ...state.appSettings, ...action.payload };
      localStorage.setItem('spy-settings', JSON.stringify(newAppSettings));
      return { ...state, appSettings: newAppSettings };

    case 'UPDATE_PLAYERS': {
      const trimmed = action.payload.map((name, idx) => name.trim() || `Player ${idx + 1}`);
      const updatedPlayers = trimmed.map((name, idx) => {
        const existing = state.players[idx];
        return existing
          ? { ...existing, name }
          : { id: `p-${idx}`, name, role: 'civilian', isDead: false, votes: 0 };
      });

      return { ...state, players: updatedPlayers };
    }
      
    case 'SET_PLAYERS':
      return { ...state, players: action.payload };
      
    case 'START_GAME':
      const spiesAssigned = action.payload.players.filter(p => p.role === 'spy').length;
      const usedLocations = state.settings.noRepeatLocations
        ? Array.from(new Set([...state.gameData.usedLocations, action.payload.location]))
        : state.gameData.usedLocations;
      return {
        ...state,
        phase: 'reveal',
        players: action.payload.players,
        gameData: {
          ...state.gameData,
          currentLocation: action.payload.location,
          currentRevealIndex: 0,
          timeLeft: state.settings.timerDuration * 60,
          winner: null,
          spiesRemaining: spiesAssigned,
          usedLocations,
        },
      };
    case 'START_NEW_ROUND': {
      const basePlayers = buildPlayersForRound(state);
      const withSpies = assignSpies(basePlayers, state.settings.spyCount);
      const location = pickLocation(state);
      if (!location) return state;
      const spiesRemaining = withSpies.filter(p => p.role === 'spy').length;
      const usedLocations = state.settings.noRepeatLocations
        ? Array.from(new Set([...state.gameData.usedLocations, location]))
        : state.gameData.usedLocations;
      return {
        ...state,
        players: withSpies,
        phase: 'reveal',
        gameData: {
          ...state.gameData,
          currentLocation: location,
          currentRevealIndex: 0,
          timeLeft: state.settings.timerDuration * 60,
          winner: null,
          spiesRemaining,
          usedLocations,
        },
      };
    }
      
    case 'NEXT_REVEAL':
      return {
        ...state,
        gameData: {
          ...state.gameData,
          currentRevealIndex: state.gameData.currentRevealIndex + 1,
        },
      };
      
    case 'START_PLAYING':
      return { ...state, phase: 'playing' };
      
    case 'TICK_TIMER':
      if (state.gameData.timeLeft <= 0) return state;
      return {
        ...state,
        gameData: { ...state.gameData, timeLeft: state.gameData.timeLeft - 1 },
      };
      
    case 'START_VOTING':
      return { 
        ...state, 
        phase: 'voting',
        players: state.players.map(p => ({ ...p, votes: 0 })) // Reset votes
      };
      
    case 'CAST_VOTE':
      return {
        ...state,
        players: state.players.map(p => 
          p.id === action.payload ? { ...p, votes: p.votes + 1 } : p
        ),
      };
      
    case 'ELIMINATE_PLAYER':
      const eliminatedPlayer = state.players.find(p => p.id === action.payload);
      const remainingPlayers = state.players.filter(p => p.id !== action.payload && !p.isDead);

      const totalSpiesStart = state.players.filter(p => p.role === 'spy').length;
      const spiesLeft = remainingPlayers.filter(p => p.role === 'spy').length;
      const civiliansLeft = remainingPlayers.filter(p => p.role === 'civilian').length;

      let nextPhase = state.phase;
      let winner = state.gameData.winner;
      // Count living spies directly from the roster so the UI stays in sync
      let spiesRemaining = spiesLeft;

      if (eliminatedPlayer?.role === 'spy') {
        if (spiesRemaining === 0) {
          // All spies caught -> Civilians Win
          nextPhase = 'result';
          winner = 'civilian';
        } else {
          // Still spies left -> Continue
          nextPhase = 'playing';
        }
      } else {
        // Civilian eliminated
        if (totalSpiesStart > 1) {
          // Multiple spies scenario: any civilian elimination hands spies the win
          nextPhase = 'result';
          winner = 'spy';
        } else {
          // Only 1 spy in game, Civilian killed -> Spy Wins
          nextPhase = 'result';
          winner = 'spy';
        }
      }

      // Default parity check (Spies >= Civilians -> Spies Win)
      if (!winner && spiesRemaining >= civiliansLeft) {
        nextPhase = 'result';
        winner = 'spy';
      }

      return {
        ...state,
        players: state.players.map(p =>
          p.id === action.payload ? { ...p, isDead: true } : p
        ),
        phase: nextPhase,
        gameData: { ...state.gameData, winner, spiesRemaining }
      };

    case 'GAME_OVER':
      return {
        ...state,
        phase: 'result',
        gameData: { ...state.gameData, winner: action.payload },
      };
    case 'SPY_GUESS': {
      const guess = action.payload.trim().toLowerCase();
      const actual = state.gameData.currentLocation.trim().toLowerCase();
      const localized = getLocationName(state.appSettings.language, state.gameData.currentLocation).trim().toLowerCase();
      const winner = guess === actual || guess === localized ? 'spy' : 'civilian';
      return {
        ...state,
        phase: 'result',
        gameData: { ...state.gameData, winner },
      };
    }
      
    case 'RESET_GAME':
      return {
        ...initialState,
        mode: state.mode,
        appSettings: state.appSettings, // Preserve app settings
        gameData: { ...initialState.gameData, categories: state.gameData.categories },
        settings: { ...state.settings, noRepeatLocations: false },
      };

    case 'TOGGLE_CATEGORY': {
      const currentSelected = state.settings.selectedCategories;
      const category = state.gameData.categories.find(c => c.id === action.payload);
      if (!category) return state;

      const isCurrentlyOn = currentSelected.includes(action.payload);
      const newSelected = isCurrentlyOn
        ? currentSelected.filter(id => id !== action.payload)
        : [...currentSelected, action.payload];

      if (newSelected.length === 0) return state;

      const toggled = {
        ...state,
        settings: {
          ...state.settings,
          selectedCategories: newSelected,
          disabledLocations: {
            ...state.settings.disabledLocations,
            [action.payload]: isCurrentlyOn ? [...category.locations] : [],
          },
        }
      };
      persistSettings(toggled.settings);
      return toggled;
    }

    case 'ADD_CATEGORY':
      return {
        ...state,
        gameData: {
          ...state.gameData,
          categories: [...state.gameData.categories, action.payload]
        }
      };

    case 'DELETE_CATEGORY':
      return {
        ...state,
        gameData: {
          ...state.gameData,
          categories: state.gameData.categories.filter(c => c.id !== action.payload)
        },
        settings: {
          ...state.settings,
          selectedCategories: state.settings.selectedCategories.filter(id => id !== action.payload),
          disabledLocations: Object.fromEntries(
            Object.entries(state.settings.disabledLocations).filter(([id]) => id !== action.payload)
          )
        }
      };

    case 'ADD_LOCATION':
      return {
        ...state,
        gameData: {
          ...state.gameData,
          categories: state.gameData.categories.map(c =>
            c.id === action.payload.categoryId
              ? { ...c, locations: [...c.locations, action.payload.location] }
              : c
          )
        },
        settings: {
          ...state.settings,
          disabledLocations: {
            ...state.settings.disabledLocations,
            [action.payload.categoryId]: (state.settings.disabledLocations[action.payload.categoryId] || [])
              .filter(l => l !== action.payload.location)
          }
        }
      };

    case 'REMOVE_LOCATION':
      return {
        ...state,
        gameData: {
          ...state.gameData,
          categories: state.gameData.categories.map(c =>
            c.id === action.payload.categoryId
              ? { ...c, locations: c.locations.filter(l => l !== action.payload.location) }
              : c
          )
        },
        settings: {
          ...state.settings,
          disabledLocations: {
            ...state.settings.disabledLocations,
            [action.payload.categoryId]: (state.settings.disabledLocations[action.payload.categoryId] || [])
              .filter(l => l !== action.payload.location)
          }
        }
      };

    case 'TOGGLE_LOCATION': {
      if (!state.settings.selectedCategories.includes(action.payload.categoryId)) {
        return state;
      }

      const currentDisabled = state.settings.disabledLocations[action.payload.categoryId] || [];
      const isCurrentlyDisabled = currentDisabled.includes(action.payload.location);
      const updatedList = isCurrentlyDisabled
        ? currentDisabled.filter(l => l !== action.payload.location)
        : [...currentDisabled, action.payload.location];

      const toggledLoc = {
        ...state,
        settings: {
          ...state.settings,
          disabledLocations: {
            ...state.settings.disabledLocations,
            [action.payload.categoryId]: updatedList
          }
        }
      };
      persistSettings(toggledLoc.settings);
      return toggledLoc;
    }
      
    default:
      return state;
  }
};

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (state.phase === 'playing' && state.settings.isTimerOn && state.gameData.timeLeft > 0) {
      interval = setInterval(() => {
        dispatch({ type: 'TICK_TIMER' });
      }, 1000);
    } else if (state.gameData.timeLeft === 0 && state.phase === 'playing') {
      dispatch({ type: 'GAME_OVER', payload: 'spy' });
    }
    return () => clearInterval(interval);
  }, [state.phase, state.settings.isTimerOn, state.gameData.timeLeft]);

  useEffect(() => {
    if (state.appSettings.music) {
      startMusic();
    } else {
      stopMusic();
    }
  }, [state.appSettings.music]);

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) throw new Error('useGame must be used within a GameProvider');
  return context;
};
