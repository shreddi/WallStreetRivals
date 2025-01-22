import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { useAccount } from '../../contexts/useAccount';

// This wrapper component redirects to the login page if the token is expired or not present.

// Function to check if the token is expired
const isTokenExpired = (token: string): boolean => {
    try {
        const expiration = jwtDecode(token).exp;
        const currentTime = Date.now() / 1000; // in seconds
        return !expiration || expiration < currentTime; // Check if token is expired
    } catch {
        return true; // If there's an error decoding the token, treat it as expired
    }
};

const PrivateRoute = ({ children }: { children: JSX.Element }) => {
    const accessToken = localStorage.getItem('access_token');
    const { logout } = useAccount()

    useEffect(() => {
        // Set up a timer to check for token expiration every minute
        const interval = setInterval(() => {
            if (accessToken && isTokenExpired(accessToken)) {
                (async () => {
                    logout()
                    localStorage.setItem('kicked_out', 'true');
                })();
            }
        }, 6000); // Check every 6 seconds


        return () => clearInterval(interval); // Clear the interval when the component unmounts
    }, [accessToken]);

    useEffect(() => {
        if (!accessToken || isTokenExpired(accessToken)) {
            // Perform logout immediately if the token is already expired
            logout()
        }
    })

    return children ? children : <Outlet />;
};

export default PrivateRoute;
