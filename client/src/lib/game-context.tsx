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

export type GameState = {
  mode: 'offline' | 'online' | null;
  players: Player[];
  settings: {
    playerCount: number;
    spyCount: number;
    isTimerOn: boolean;
    timerDuration: number; // in minutes
    selectedCategories: string[];
  };
  gameData: {
    currentLocation: string;
    currentRevealIndex: number;
    timeLeft: number; // in seconds
    winner: 'spy' | 'civilian' | null;
    categories: Category[];
  };
  phase: GamePhase;
};

type Action =
  | { type: 'SET_MODE'; payload: 'offline' | 'online' }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<GameState['settings']> }
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
  | { type: 'DELETE_CATEGORY'; payload: string };

const initialState: GameState = {
  mode: null,
  players: [],
  settings: {
    playerCount: 4,
    spyCount: 1,
    isTimerOn: true,
    timerDuration: 5,
    selectedCategories: ['standard'],
  },
  gameData: {
    currentLocation: '',
    currentRevealIndex: 0,
    timeLeft: 300,
    winner: null,
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
    case 'SET_PLAYERS':
      return { ...state, players: action.payload };
    case 'START_GAME':
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
      
      // Check win condition immediately
      const spiesLeft = remainingPlayers.filter(p => p.role === 'spy').length;
      const civiliansLeft = remainingPlayers.filter(p => p.role === 'civilian').length;
      
      let nextPhase = state.phase;
      let winner = state.gameData.winner;

      if (eliminatedPlayer?.role === 'spy' && spiesLeft === 0) {
        nextPhase = 'result';
        winner = 'civilian';
      } else if (spiesLeft >= civiliansLeft) {
        nextPhase = 'result';
        winner = 'spy'; // Spies win if they equal or outnumber civilians
      } else {
        nextPhase = 'playing'; // Continue if no win condition met
      }

      return {
        ...state,
        players: state.players.map(p => 
          p.id === action.payload ? { ...p, isDead: true } : p
        ),
        phase: nextPhase,
        gameData: { ...state.gameData, winner }
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
        mode: state.mode, // Keep mode
        gameData: { ...initialState.gameData, categories: state.gameData.categories }, // Keep categories
      };
    default:
      return state;
  }
};

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  // Timer Effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (state.phase === 'playing' && state.settings.isTimerOn && state.gameData.timeLeft > 0) {
      interval = setInterval(() => {
        dispatch({ type: 'TICK_TIMER' });
      }, 1000);
    } else if (state.gameData.timeLeft === 0 && state.phase === 'playing') {
      // Time runs out -> Spies win
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
