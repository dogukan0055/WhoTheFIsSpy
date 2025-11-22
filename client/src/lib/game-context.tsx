import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { Category, INITIAL_CATEGORIES } from './locations';

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
  };
  gameData: {
    currentLocation: string;
    currentRevealIndex: number;
    timeLeft: number; // in seconds
    winner: 'spy' | 'civilian' | null;
    spiesRemaining: number;
    categories: Category[];
  };
  phase: GamePhase;
};

type Action =
  | { type: 'SET_MODE'; payload: 'offline' | 'online' }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<GameState['settings']> }
  | { type: 'UPDATE_APP_SETTINGS'; payload: Partial<AppSettings> }
  | { type: 'SET_PLAYERS'; payload: Player[] }
  | { type: 'START_GAME'; payload: { location: string; players: Player[] } }
  | { type: 'NEXT_REVEAL' }
  | { type: 'START_PLAYING' }
  | { type: 'TICK_TIMER' }
  | { type: 'START_VOTING' }
  | { type: 'CAST_VOTE'; payload: string } // player id
  | { type: 'ELIMINATE_PLAYER'; payload: string } // player id
  | { type: 'GAME_OVER'; payload: 'spy' | 'civilian' }
  | { type: 'RESET_GAME' }
  | { type: 'ADD_CATEGORY'; payload: Category }
  | { type: 'DELETE_CATEGORY'; payload: string }
  | { type: 'TOGGLE_CATEGORY'; payload: string } // id
  | { type: 'ADD_LOCATION'; payload: { categoryId: string, location: string } }
  | { type: 'REMOVE_LOCATION'; payload: { categoryId: string, location: string } }
  | { type: 'TOGGLE_LOCATION'; payload: { categoryId: string, location: string } };

// Load settings from local storage
const savedSettings = localStorage.getItem('spy-settings');
const parsedSettings = savedSettings ? JSON.parse(savedSettings) : {};
const initialAppSettings: AppSettings = {
  sound: true,
  vibrate: true,
  music: true,
  highContrast: false,
  language: 'en',
  ...parsedSettings,
};

const initialState: GameState = {
  mode: null,
  players: [],
  appSettings: initialAppSettings,
  settings: {
    playerCount: 4,
    spyCount: 1,
    isTimerOn: true,
    timerDuration: 5,
    selectedCategories: ['standard'],
    disabledLocations: {},
  },
  gameData: {
    currentLocation: '',
    currentRevealIndex: 0,
    timeLeft: 300,
    winner: null,
    spiesRemaining: 0,
    categories: INITIAL_CATEGORIES,
  },
  phase: 'setup',
};

const GameContext = createContext<{
  state: GameState;
  dispatch: React.Dispatch<Action>;
} | undefined>(undefined);

const gameReducer = (state: GameState, action: Action): GameState => {
  switch (action.type) {
    case 'SET_MODE':
      return { ...state, mode: action.payload };
      
    case 'UPDATE_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.payload } };
      
    case 'UPDATE_APP_SETTINGS':
      const newAppSettings = { ...state.appSettings, ...action.payload };
      localStorage.setItem('spy-settings', JSON.stringify(newAppSettings));
      return { ...state, appSettings: newAppSettings };
      
    case 'SET_PLAYERS':
      return { ...state, players: action.payload };
      
    case 'START_GAME':
      const spiesAssigned = action.payload.players.filter(p => p.role === 'spy').length;
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
        },
      };
      
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
      // Track spies based on active roster rather than previous state to avoid double-subtracting
      let spiesRemaining = spiesLeft;

      if (eliminatedPlayer?.role === 'spy') {
        spiesRemaining = Math.max(0, spiesRemaining - 1);
        if (spiesLeft === 0) {
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
      if (!winner && spiesLeft >= civiliansLeft) {
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
      
    case 'RESET_GAME':
      return {
        ...initialState,
        mode: state.mode,
        appSettings: state.appSettings, // Preserve app settings
        gameData: { ...initialState.gameData, categories: state.gameData.categories },
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

      return {
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

      return {
        ...state,
        settings: {
          ...state.settings,
          disabledLocations: {
            ...state.settings.disabledLocations,
            [action.payload.categoryId]: updatedList
          }
        }
      };
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
