import { createContext } from 'react';
import { Player } from '../../types';

interface PlayerContextType {
    currentPlayer: Player | null;
    setCurrentPlayer: (player: Player) => void
    login: (playerData: Player, accessToken: string, refreshToken: string) => void;
    logout: () => void;
}

export const PlayerContext = createContext<PlayerContextType | undefined>(undefined);