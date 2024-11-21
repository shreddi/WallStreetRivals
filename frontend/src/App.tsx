import React from 'react'
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import { MantineProvider } from '@mantine/core';
import './App.css'
import Portfolio from './components/Portfolio';


function App() {

  return (
    <React.StrictMode>
      <MantineProvider
        theme={{
          fontFamily: 'Montserrat, sans-serif',
          headings: { fontFamily: 'Montserrat, sans-serif' },
        }}
      >
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate replace to="/portfolio" />} />
            <Route path="/portfolio" element={<Portfolio />} />
          </Routes>
        </BrowserRouter>
      </MantineProvider>
    </React.StrictMode>
  );
}

export default App
