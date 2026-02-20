export enum GamePhase {
  SETUP = 'SETUP',
  ASSIGNMENT = 'ASSIGNMENT',
  ROUND = 'ROUND',
  VOTING = 'VOTING',
  MR_WHITE_GUESS = 'MR_WHITE_GUESS',
  GAME_OVER = 'GAME_OVER',
}

export enum Role {
  CIVILIAN = 'Warga Sipil',
  UNDERCOVER = 'Undercover',
  MR_WHITE = 'Mr. White',
}

export interface Player {
  id: string;
  name: string;
  role: Role;
  word: string | null;
  isEliminated: boolean;
}

export interface GameConfig {
  mrWhiteCount: number;
  undercoverCount: number;
}

export interface WordPair {
  mainWord: string;
  undercoverWord: string;
}

export interface LogEntry {
  id: string;
  message: string;
  timestamp: number;
  type: 'info' | 'alert' | 'success';
}