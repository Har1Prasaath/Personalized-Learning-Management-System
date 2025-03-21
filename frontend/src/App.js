import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import Home from './components/Home';
import Auth from './components/Auth';
import Course from './components/Course';
import Header from './components/Header';
import { Box } from '@mui/material';
import LoadingSpinner from './components/LoadingSpinner';
import { LoadingProvider, useLoading } from './context/LoadingContext';

function AppWrapper() {
  return (
    <LoadingProvider>
      <App />
    </LoadingProvider>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const { setIsLoading } = useLoading();
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoading(true);
      setUser(user);
      setIsLoading(false);
    });
    return unsubscribe;
  }, [setIsLoading]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <LoadingSpinner />
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

export default AppWrapper;