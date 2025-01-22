import { createContext } from 'react';
import { Account } from '../types';

interface AccountContextType {
    currentAccount: Account | null;
    setCurrentAccount: (account: Account) => void
    login: (accountData: Account, accessToken: string, refreshToken: string) => void;
    logout: () => void;
}

export const AccountContext = createContext<AccountContextType | undefined>(undefined);