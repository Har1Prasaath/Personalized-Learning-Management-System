import React, { useState, useCallback } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { Button, TextField, Container, Typography, Box, CircularProgress } from '@mui/material';
import { keyframes } from '@emotion/react';
import Particles from 'react-tsparticles';
import { loadFull } from 'tsparticles';

// Animation keyframes
const fadeIn = keyframes`
  from { 
    opacity: 0; 
    transform: translateY(20px); 
  }
  to { 
    opacity: 1; 
    transform: translateY(0); 
  }
`;

const pulse = keyframes`
  0% { 
    transform: scale(1); 
  }
  50% { 
    transform: scale(1.05); 
  }
  100% { 
    transform: scale(1); 
  }
`;

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Particles initialization
  const particlesInit = useCallback(async (engine) => {
    await loadFull(engine);
  }, []);

  // Handle authentication
  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (error) {
      alert(getAuthErrorMessage(error.code));
    } finally {
      setLoading(false);
    }
  };

  // Get user-friendly error messages
  const getAuthErrorMessage = (code) => {
    switch (code) {
      case 'auth/invalid-email': return 'Invalid email format';
      case 'auth/email-already-in-use': return 'Email already in use';
      case 'auth/weak-password': return 'Password should be at least 6 characters';
      case 'auth/user-not-found': return 'User not found';
      case 'auth/wrong-password': return 'Incorrect password';
      default: return 'Authentication failed. Please try again';
    }
  };

  return (
    <Box
      sx={{
        position: 'fixed', // Fix the container to the viewport
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden', // Prevent scrolling
        backgroundColor: '#F8FAFC', // Fallback background color
      }}
    >
      {/* Animated Particles Background */}
      <Particles
        id="tsparticles"
        init={particlesInit}
        options={{
          background: { 
            color: { 
              value: '#F8FAFC' 
            } 
          },
          fpsLimit: 60,
          interactivity: {
            events: {
              onHover: {
                enable: true,
                mode: 'repulse',
              },
              resize: true,
            },
            modes: {
              repulse: {
                distance: 100,
                duration: 0.4,
              },
            },
          },
          particles: {
            color: {
              value: ['#4B8EC9', '#FF9A8D', '#6C5CE7'],
            },
            links: {
              color: '#4B8EC9',
              distance: 150,
              enable: true,
              opacity: 0.4,
              width: 1,
            },
            collisions: {
              enable: true,
            },
            move: {
              direction: 'none',
              enable: true,
              outModes: {
                default: 'bounce',
              },
              random: false,
              speed: 1.5,
              straight: false,
            },
            number: {
              density: {
                enable: true,
                area: 800,
              },
              value: 40,
            },
            opacity: {
              value: 0.5,
            },
            shape: {
              type: 'circle',
            },
            size: {
              value: { min: 1, max: 3 },
            },
          },
          detectRetina: true,
        }}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 0,
        }}
      />

      {/* Auth Form Container */}
      <Container
        maxWidth="xs"
        sx={{
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
          mx: 'auto', // Center horizontally
        }}
      >
        <Typography
          variant="h4"
          gutterBottom
          sx={{ 
            color: 'text.primary', 
            mb: 3,
            fontWeight: 700,
            background: 'linear-gradient(45deg, #4B8EC9 30%, #FF9A8D 90%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}
        >
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </Typography>
        
        <form onSubmit={handleAuth} style={{ width: '100%' }}>
          <TextField
            fullWidth
            margin="normal"
            label="Email"
            variant="outlined"
            type="email"
            required
            sx={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              borderRadius: 2,
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: '#E0E0E0',
                },
                '&:hover fieldset': {
                  borderColor: '#4B8EC9',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#4B8EC9',
                },
              }
            }}
            onChange={(e) => setEmail(e.target.value)}
          />
          
          <TextField
            fullWidth
            margin="normal"
            label="Password"
            variant="outlined"
            type="password"
            required
            sx={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              borderRadius: 2,
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: '#E0E0E0',
                },
                '&:hover fieldset': {
                  borderColor: '#4B8EC9',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#4B8EC9',
                },
              }
            }}
            onChange={(e) => setPassword(e.target.value)}
          />
          
          <Button
            fullWidth
            type="submit"
            variant="contained"
            size="large"
            disabled={loading}
            sx={{ 
              mt: 3,
              py: 1.5,
              borderRadius: 2,
              fontWeight: 600,
              background: 'linear-gradient(45deg, #4B8EC9 30%, #FF9A8D 90%)',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              transition: 'all 0.3s ease',
              '&:hover': {
                animation: `${pulse} 1s infinite`,
                boxShadow: '0 6px 8px rgba(0, 0, 0, 0.2)',
                transform: 'translateY(-1px)'
              },
              '&:disabled': {
                background: '#e0e0e0'
              }
            }}
          >
            {loading ? (
              <CircularProgress size={24} sx={{ color: 'white' }} />
            ) : isLogin ? (
              'Sign In'
            ) : (
              'Create Account'
            )}
          </Button>

          <Typography variant="body2" sx={{ 
            mt: 2, 
            textAlign: 'center',
            color: 'text.secondary'
          }}>
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            
            <Button
              variant="text"
              size="small"
              sx={{
                ml: 1,
                color: 'primary.main',
                fontWeight: 600,
                textTransform: 'none',
                transition: 'all 0.2s ease',
                '&:hover': {
                  backgroundColor: 'transparent',
                  textDecoration: 'underline',
                  transform: 'scale(1.05)'
                }
              }}
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? 'Sign up instead' : 'Sign in instead'}
            </Button>
          </Typography>
        </form>
      </Container>
    </Box>
  );
}