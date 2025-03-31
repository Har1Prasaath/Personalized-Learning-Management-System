import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from './firebase';
import { doc, getDoc } from 'firebase/firestore';
import Home from './components/Home';
import Auth from './components/Auth';
import Course from './components/Course';
import Profile from './components/Profile';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import Header from './components/Header';
import AdminHeader from './components/AdminHeader';
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
  const [userRole, setUserRole] = useState(null);
  const { setIsLoading } = useLoading();
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setIsLoading(true);
      setUser(currentUser);
      
      if (currentUser) {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        setUserRole(userDoc.exists() ? userDoc.data().role : 'user');
      } else {
        setUserRole(null);
      }
      setIsLoading(false);
    });
    return unsubscribe;
  }, [setIsLoading]);

  const getHeader = () => {
    if (!user) return null;
    return userRole === 'admin' ? <AdminHeader /> : <Header />;
  };

  const getRedirectPath = () => {
    if (!user) return '/';
    return userRole === 'admin' ? '/admin/dashboard' : '/home';
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <LoadingSpinner />
      {user && getHeader()}
      
      <Box component="main" sx={{ flexGrow: 1, py: 3 }}>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={user ? <Navigate to={getRedirectPath()} /> : <Auth />} />
          <Route path="/admin/login" element={user ? <Navigate to={getRedirectPath()} /> : <AdminLogin />} />

          {/* User routes */}
          <Route path="/home" element={
            userRole === 'user' ? <Home /> : <Navigate to="/admin/dashboard" />
          } />
          <Route path="/courses/:courseId" element={
            userRole === 'user' ? <Course /> : <Navigate to="/admin/dashboard" />
          } />
          <Route path="/profile" element={
            userRole === 'user' ? <Profile /> : <Navigate to="/admin/dashboard" />
          } />

          {/* Admin routes */}
          <Route path="/admin/dashboard" element={
            userRole === 'admin' ? <AdminDashboard /> : <Navigate to="/home" />
          } />
        </Routes>
      </Box>
    </Box>
  );
}

export default AppWrapper;