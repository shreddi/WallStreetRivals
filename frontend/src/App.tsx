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
// import classes from './WSR.module.css'

import { PlayerProvider } from './components/contexts/PlayerProvider';
import Settings from './components/ProfileSettings'
import PasswordResetRequest from './components/PasswordResetRequest';
import PasswordResetConfirm from './components/PasswordResetConfirm';

function App() {

  return (
    <React.StrictMode>
      <MantineProvider
        theme={{
          fontFamily: 'Roboto, sans-serif',
          primaryColor: 'yellow', // Primary color
          fontSizes: {
            xs: '12px',
            sm: '16px',
            md: '20px',
            lg: '30px',
            xl: '50px',
          },
          components: {
            // Button: Button.extend({
            //   defaultProps: {
            //     className: classes.button
            //   },
            // }),
            // Text: Text.extend({
            //   defaultProps: {
            //     className: classes.text
            //   },
            // }),
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
              <Route path="/reset_password" element={<PasswordResetRequest />} />
              <Route path="/reset_password_confirm/:uidb64/:token" element={<PasswordResetConfirm />} />
            </Routes>
          </PlayerProvider>
        </BrowserRouter>
      </MantineProvider>
    </React.StrictMode>
  );
}

export default App
