import React from 'react'
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import { MantineProvider } from '@mantine/core';
import './App.css'
import PortfolioDashboard from './components/PortfolioDashboard';
import '@mantine/core/styles.css'; // Import Mantine core styles


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
          <Routes>
            <Route path="/" element={<Navigate replace to="/portfolio" />} />
            <Route path="/portfolio" element={<PortfolioDashboard />} />
          </Routes>
        </BrowserRouter>
      </MantineProvider>
    </React.StrictMode>
  );
}

export default App
