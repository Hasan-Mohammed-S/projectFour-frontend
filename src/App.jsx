import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import StoreOwnerDashboard from './pages/StoreOwnerDashboard';
import Navbar from './components/Navbar';


import { useContext } from 'react';

import { UserContext } from './contexts/UserContext';


export default function App() {
  const { user } = useContext(UserContext)

  return (
    <>
    <Navbar user={user} />
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/owner-dashboard" element={<StoreOwnerDashboard user={user} />} />
        </Routes>
      </div>
    </Router>
    </>
  );
}