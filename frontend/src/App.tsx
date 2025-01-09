import React from 'react'
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import { MantineProvider } from '@mantine/core';
import './App.css'
import './index.css'
import PortfolioDashboard from './components/PortfolioDashboard';
import '@mantine/core/styles.css'; // Import Mantine core styles
import Login from './components/Login'
import Register from './components/Register'
import PrivateRoute from './components/PrivateRoute';
import { PlayerProvider } from './components/contexts/PlayerProvider';
import Settings from './components/ProfileSettings'

function App() {

  return (
    <React.StrictMode>
      <MantineProvider
        theme={{
          fontFamily: 'Montserrat, sans-serif',
          headings: { fontFamily: 'Montserrat, sans-serif' },
          fontSizes: {
            xs: '12px',
            sm: '16px',
            md: '20px',
            lg: '30px',
            xl: '50px',
          },

        }}
      >
        <BrowserRouter>
          <PlayerProvider>
            <Routes>
              <Route path="/" element={<Navigate replace to="/portfolio" />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/portfolio" element={<PrivateRoute><PortfolioDashboard /></PrivateRoute>} />
              <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
            </Routes>
          </PlayerProvider>
        </BrowserRouter>
      </MantineProvider>
    </React.StrictMode>
  );
}

export default App
