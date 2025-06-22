import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import App from './App.jsx'
import Home from './pages/Home.jsx';
import AddTrack from './pages/AddTrack.jsx';
import Profile from './pages/Profile.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

ReactDOM.createRoot(document.getElementById('root')).render(
  <Router>
    <Routes>
      <Route path="/" element={<App />}>
        <Route index element={<Home />} />
        <Route path="add" element={<AddTrack />} />
        <Route path="profile" element={<Profile />} />
      </Route>
    </Routes>
  </Router>
);