import { ReactNode, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Player } from "../../types";
import { PlayerContext } from "./PlayerContext";


export const PlayerProvider = ({ children }: { children: ReactNode }) => {
  const [player, setPlayer] = useState<Player | null>(null);
  const navigate = useNavigate();

  // Login function
  const login = (playerData: Player, accessToken: string, refreshToken: string) => {
    setPlayer(playerData);
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
    localStorage.removeItem('kicked_out')
    localStorage.setItem('player', JSON.stringify(playerData));
    navigate('/')
  };

  // Logout function
  const logout = () => {
    setPlayer(null);
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('kicked_out')
    localStorage.removeItem('player');
    navigate('/login');
  };

  // Restore session on app load
  useEffect(() => {
    const storedToken = localStorage.getItem('access_token');
    const storedPlayer = localStorage.getItem('player');
    if (storedToken && storedPlayer) {
      setPlayer(JSON.parse(storedPlayer));
    }
  }, []);

  return (
    <PlayerContext.Provider value={{ player, login, logout }}>
      {children}
    </PlayerContext.Provider>
  );
};
