import { MantineProvider } from '@mantine/core';
import '@mantine/core/styles.css'; // Import Mantine core styles
import React from 'react';
import { BrowserRouter, Route, Routes, } from 'react-router-dom';
import './App.css';
import Login from './components/Login';
import PortfolioDashboard from './components/PortfolioDashboard';
import PrivateRoute from './components/PrivateRoute';
import Register from './components/Register';
import './index.css';
import '@mantine/core/styles.css'; //import Mantine V7 styles needed by MRT
import '@mantine/dates/styles.css'; //if using mantine date picker features
import 'mantine-react-table/styles.css'; //import MRT styles
import '@mantine/notifications/styles.css';
import { Button, Title } from '@mantine/core';
import { AccountProvider } from './components/contexts/AccountProvider';
import PasswordResetConfirm from './components/PasswordResetConfirm';
import PasswordResetRequest from './components/PasswordResetRequest';
import Settings from './components/ProfileSettings';
import OpenContests from './components/OpenContests'
import NewLeague from './components/NewLeague';
import { Notifications } from '@mantine/notifications';


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
        <Notifications />
        <BrowserRouter>
          <AccountProvider>
            <Routes>

              {/* public routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/reset_password" element={<PasswordResetRequest />} />
              <Route path="/reset_password_confirm/:uidb64/:token" element={<PasswordResetConfirm />} />

              {/* protected routes */}
              <Route path="/" element={
                <PrivateRoute>
                  <PortfolioDashboard />
                </PrivateRoute>
              }
              />
              <Route path="/settings" element={
                <PrivateRoute>
                  <Settings />
                </PrivateRoute>
              }
              />
              <Route path="/open_contests" element={
                <PrivateRoute>
                  <OpenContests />
                </PrivateRoute>
              }
              />
              <Route path="/new_league" element={
                <PrivateRoute>
                  <NewLeague />
                </PrivateRoute>
              }
              />
              
            </Routes>
          </AccountProvider>
        </BrowserRouter>
      </MantineProvider>
    </React.StrictMode>
  );
}

export default App
