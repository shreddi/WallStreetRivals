import { useEffect } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

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
    const navigate = useNavigate();
    const accessToken = localStorage.getItem('access_token');

    useEffect(() => {
        // Set up a timer to check for token expiration every minute
        const interval = setInterval(() => {
            if (accessToken && isTokenExpired(accessToken)) {
                (async () => {
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('refresh_token');
                    localStorage.setItem('kicked_out', 'true');
                    window.location.href = '/login'; // Redirect after logout
                })();
            }
        }, 6000); // Check every 6 seconds


        return () => clearInterval(interval); // Clear the interval when the component unmounts
    }, [accessToken]);

    useEffect(() => {
        if (!accessToken || isTokenExpired(accessToken)) {
            // Perform logout immediately if the token is already expired
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            navigate('/login');
        }
    })

    return children ? children : <Outlet />;
};

export default PrivateRoute;
