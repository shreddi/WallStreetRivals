import { useContext } from "react";
import { AccountContext } from "./AccountContext";

// // Custom hook to use the AccountContext
export const useAccount = () => {
    const context = useContext(AccountContext);
    if (!context) {
        throw new Error('useAccount must be used within a AccountProvider');
    }
    return context;
};