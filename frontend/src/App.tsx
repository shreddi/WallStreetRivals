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
import PasswordResetRequest from './components/PasswordResetRequest';
import PasswordResetConfirm from './components/PasswordResetConfirm';
import { Title, Button } from '@mantine/core'

function App() {

  return (
    <React.StrictMode>
      <MantineProvider
        theme={{
          fontFamily: 'Futura',
          primaryColor: 'yellow', // Primary color
          fontSizes: {
            xs: '12px',
            sm: '16px',
            md: '20px',
            lg: '30px',
            xl: '50px',
          },
          headings: {
            "fontWeight": "700",
            "textWrap": "wrap",
            sizes: {
              h1: {
                fontSize: "calc(3.1875rem * var(--mantine-scale))", // 2.125rem * 1.5
                lineHeight: "1.3",
              },
              h2: {
                fontSize: "calc(2.4375rem * var(--mantine-scale))", // 1.625rem * 1.5
                lineHeight: "1.35",
              },
              h3: {
                fontSize: "calc(2.0625rem * var(--mantine-scale))", // 1.375rem * 1.5
                lineHeight: "1.4",
              },
              h4: {
                fontSize: "calc(1.6875rem * var(--mantine-scale))", // 1.125rem * 1.5
                lineHeight: "1.45",
              },
              h5: {
                fontSize: "calc(1.5rem * var(--mantine-scale))", // 1rem * 1.5
                lineHeight: "1.5",
              },
              h6: {
                fontSize: "calc(1.3125rem * var(--mantine-scale))", // 0.875rem * 1.5
                lineHeight: "1.5",
              },
            },
          },
          components: {
            Button: Button.extend({
              defaultProps: {
                tt: 'uppercase',
                fw: 700
              },
            }),
            // Text: Text.extend({
            //   defaultProps: {
            //     // tt: 'uppercase'
            //   },
            // }),
            Title: Title.extend({
              defaultProps: {
                tt: 'uppercase',
              },
            }),
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
