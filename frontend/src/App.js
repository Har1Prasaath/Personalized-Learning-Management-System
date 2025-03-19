// App.js
import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import Home from './components/Home';
import Auth from './components/Auth';
import Course from './components/Course';
import Header from './components/Header';
import { Box, Container } from '@mui/material';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        Loading...
      </Container>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Show header only if not on auth page */}
      {location.pathname !== '/' && <Header />}
      
      <Box component="main" sx={{ flexGrow: 1, py: 3 }}>
        <Routes>
          <Route path="/" element={user ? <Navigate to="/home" /> : <Auth />} />
          <Route path="/home" element={user ? <Home /> : <Navigate to="/" />} />
          <Route path="/courses/:courseId" element={user ? <Course /> : <Navigate to="/" />} />
        </Routes>
      </Box>
    </Box>
  );
}

export default App;