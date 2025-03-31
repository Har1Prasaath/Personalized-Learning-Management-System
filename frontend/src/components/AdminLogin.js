import React, { useState, useCallback } from 'react';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, db, GoogleAuthProvider } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { Button, TextField, Container, Typography, Box, Alert } from '@mui/material';
import { keyframes } from '@emotion/react';
import Particles from 'react-tsparticles';
import { loadFull } from 'tsparticles';
import { doc, getDoc } from 'firebase/firestore';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const particlesInit = useCallback(async (engine) => {
    await loadFull(engine);
  }, []);

  const handleAdminAuth = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      
      if (userDoc.exists() && userDoc.data().role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        await auth.signOut();
        setError('Unauthorized admin access');
      }
    } catch (error) {
      setError('Invalid admin credentials');
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      
      if (userDoc.exists() && userDoc.data().role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        await auth.signOut();
        setError('Unauthorized admin access');
      }
    } catch (error) {
      setError('Admin authentication failed');
    }
  };

  return (
    <Box sx={{ 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      width: '100%', 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      overflow: 'hidden', 
      backgroundColor: '#F8FAFC' 
    }}>
      <Particles id="tsparticles" init={particlesInit} options={{ 
        background: { color: { value: '#F8FAFC' } }, 
        fpsLimit: 60, 
        interactivity: { 
          events: { 
            onHover: { enable: true, mode: 'repulse' }, 
            resize: true 
          }, 
          modes: { repulse: { distance: 100, duration: 0.4 } } 
        }, 
        particles: { 
          color: { value: ['#2C3E50', '#3498DB', '#6C5CE7'] }, 
          links: { color: '#2C3E50', distance: 150, enable: true, opacity: 0.4, width: 1 }, 
          collisions: { enable: true }, 
          move: { direction: 'none', enable: true, outModes: { default: 'bounce' }, speed: 1.5 }, 
          number: { density: { enable: true, area: 800 }, value: 40 }, 
          opacity: { value: 0.5 }, 
          shape: { type: 'circle' }, 
          size: { value: { min: 1, max: 3 } } 
        }, 
        detectRetina: true 
      }} />

      <Container maxWidth="xs" sx={{ 
        position: 'relative', 
        zIndex: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        backgroundColor: 'rgba(255, 255, 255, 0.95)', 
        borderRadius: 4, 
        p: 4, 
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)', 
        backdropFilter: 'blur(12px)', 
        animation: `${fadeIn} 0.6s ease-out`, 
        width: '100%', 
        maxWidth: '400px', 
        mx: 'auto', 
        marginTop: '30px' 
      }}>
        <Typography variant="h4" gutterBottom sx={{ 
          color: 'text.primary', 
          mb: 3, 
          fontWeight: 700, 
          background: 'linear-gradient(45deg, #2C3E50 30%, #3498DB 90%)', 
          WebkitBackgroundClip: 'text', 
          WebkitTextFillColor: 'transparent' 
        }}>
          Admin Portal
        </Typography>

        {error && (
          <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleAdminAuth} style={{ width: '100%' }}>
          <TextField 
            fullWidth 
            margin="normal" 
            label="Admin Email" 
            variant="outlined" 
            type="email" 
            required 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.9)', 
              borderRadius: 2, 
              '& .MuiOutlinedInput-root': { 
                '& fieldset': { borderColor: '#E0E0E0' }, 
                '&:hover fieldset': { borderColor: '#2C3E50' }, 
                '&.Mui-focused fieldset': { borderColor: '#2C3E50' } 
              } 
            }} 
          />
          
          <TextField 
            fullWidth 
            margin="normal" 
            label="Password" 
            variant="outlined" 
            type="password" 
            required 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.9)', 
              borderRadius: 2, 
              '& .MuiOutlinedInput-root': { 
                '& fieldset': { borderColor: '#E0E0E0' }, 
                '&:hover fieldset': { borderColor: '#2C3E50' }, 
                '&.Mui-focused fieldset': { borderColor: '#2C3E50' } 
              } 
            }} 
          />
          
          <Button 
            fullWidth 
            type="submit" 
            variant="contained" 
            size="large" 
            sx={{ 
              mt: 3, 
              py: 1.5, 
              borderRadius: 2, 
              fontWeight: 600, 
              background: 'linear-gradient(45deg, #2C3E50 30%, #3498DB 90%)', 
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', 
              transition: 'all 0.3s ease', 
              '&:hover': { 
                boxShadow: '0 6px 8px rgba(0, 0, 0, 0.2)', 
                transform: 'translateY(-1px)' 
              } 
            }} 
          > 
            Admin Login
          </Button>
          
          <Box sx={{ mt: 3, width: '100%' }}> 
            <Typography variant="body2" sx={{ textAlign: 'center', color: 'text.secondary', mb: 2 }}> 
              ──── OR CONTINUE WITH ──── 
            </Typography> 
            <Button 
              fullWidth 
              variant="contained" 
              onClick={handleGoogleSignIn} 
              sx={{ 
                backgroundColor: '#DB4437', 
                color: 'white', 
                '&:hover': { 
                  backgroundColor: '#C23328', 
                  boxShadow: '0 3px 5px rgba(0, 0, 0, 0.2)' 
                }, 
                transition: 'all 0.3s ease', 
                py: 1.2, 
                borderRadius: 2, 
                fontWeight: 600, 
                textTransform: 'none' 
              }} 
            > 
              Sign in with Google 
            </Button> 
          </Box>
        </form>
      </Container>
    </Box>
  );
}