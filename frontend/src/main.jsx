import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import App from './App.jsx';
import Home from './pages/Home.jsx';
import AddTrack from './pages/AddTrack.jsx';
import Liked from './pages/Liked.jsx';
import Profile from './pages/Profile.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<Home />} />
          <Route path="add" element={<AddTrack />} />
          <Route path="liked" element={<Liked />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Routes>
    </Router>
  </React.StrictMode>
);
