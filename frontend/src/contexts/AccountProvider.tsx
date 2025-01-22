import { ReactNode, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Account } from "../types";
import { AccountContext } from "./AccountContext";
import { getAccount } from "../api/authService";

export const AccountProvider = ({ children }: { children: ReactNode }) => {
  const [currentAccount, setCurrentAccount] = useState<Account | null>(null);
  const navigate = useNavigate();

  // Login function
  const login = (accountData: Account, accessToken: string, refreshToken: string) => {
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
    localStorage.removeItem('kicked_out')
    localStorage.setItem('accountID', (accountData.id).toString());
    console.log(accountData)
    setCurrentAccount(accountData);
    navigate('/')
  };

  // Logout function
  const logout = () => {
    setCurrentAccount(null);
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('kicked_out')
    localStorage.removeItem('accountID');
    navigate('/login');
  };

  // Restore session on app load
  useEffect(() => {
    const id = parseInt(localStorage.getItem('accountID') || "")
    getAccount(id)
      .then((data: Account) => {
        setCurrentAccount(data)
      })
      .catch((error: Error) => console.log(error))
  }, []);

  return (
    <AccountContext.Provider value={{ currentAccount, setCurrentAccount: setCurrentAccount, login, logout }}>
      {children}
    </AccountContext.Provider>
  );
};
