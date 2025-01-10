import { ReactNode, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Player } from "../../types";
import { PlayerContext } from "./PlayerContext";
import { getPlayer } from "../../api/authService";

export const PlayerProvider = ({ children }: { children: ReactNode }) => {
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const navigate = useNavigate();

  // Login function
  const login = (playerData: Player, accessToken: string, refreshToken: string) => {
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
    localStorage.removeItem('kicked_out')
    localStorage.setItem('playerID', (playerData.id).toString());
    console.log(playerData)
    setCurrentPlayer(playerData);
    navigate('/')
  };

  // Logout function
  const logout = () => {
    setCurrentPlayer(null);
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('kicked_out')
    localStorage.removeItem('playerID');
    navigate('/login');
  };

  // Restore session on app load
  useEffect(() => {
    const id = parseInt(localStorage.getItem('playerID') || "")
    getPlayer(id)
    .then((data: Player) => {
      console.log(data)
      setCurrentPlayer(data)
    })
    .catch((error: Error) => console.log(error))
  }, []);

  return (
    <PlayerContext.Provider value={{ currentPlayer, setCurrentPlayer, login, logout }}>
      {children}
    </PlayerContext.Provider>
  );
};
