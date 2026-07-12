import { create } from 'zustand';

interface GameState {
  playerId: string;
}

const getPlayerId = () => {
  let id = localStorage.getItem('jornada_player_id');
  if (!id) {
    id = Math.random().toString(36).substring(2, 10);
    localStorage.setItem('jornada_player_id', id);
  }
  return id;
};

export const useGameStore = create<GameState>((set) => ({
  playerId: getPlayerId(),
}));
