import React, { useState, useCallback } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,  // Add this for Google Auth
  GoogleAuthProvider  // Add this for Google Auth
} from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { 
  Button, 
  TextField, 
  Container, 
  Typography, 
  Box, 
  InputAdornment,
  IconButton 
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { keyframes } from '@emotion/react';
import Particles from 'react-tsparticles';
import { loadFull } from 'tsparticles';
import { useLoading } from '../context/LoadingContext';
import GoogleIcon from '@mui/icons-material/Google';  // Add this for Google button

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

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const { setIsLoading } = useLoading();
  const navigate = useNavigate();

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const particlesInit = useCallback(async (engine) => {
    await loadFull(engine);
  }, []);

  const handleAuth = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (error) {
      alert(getAuthErrorMessage(error.code));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      navigate('/home');
    } catch (error) {
      alert(getAuthErrorMessage(error.code));
    } finally {
      setIsLoading(false);
    }
  };

  const getAuthErrorMessage = (code) => {
    switch (code) {
      // Existing cases...
      case 'auth/popup-closed-by-user':
        return 'Sign-in process was cancelled';
      case 'auth/account-exists-with-different-credential':
        return 'Account exists with different login method';
      case 'auth/unauthorized-domain':
        return 'Unauthorized domain for authentication';
      default: return 'Authentication failed. Please try again';
    }
  };

  return (
    <Box
      sx={{
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
        backgroundColor: '#F8FAFC',
      }}
    >
      {/* Title */}
      <Typography
        variant="h3"
        sx={{
          fontFamily: 'Merriweather, serif',
          fontWeight: 700,
          color: '#2D3748',
          textAlign: 'center',
          position: 'absolute',
          top: '10%',
          zIndex: 2,
          width: '100%',
          fontSize: { xs: '2rem', sm: '2.5rem' },
          letterSpacing: '0.5px'
        }}
      >
        Personalized Learning Management System
      </Typography>
  
      {/* Particles Background */}
      <Particles
        id="tsparticles"
        init={particlesInit}
        options={{
          background: { color: { value: '#F8FAFC' } },
          fpsLimit: 60,
          interactivity: {
            events: {
              onHover: { enable: true, mode: 'repulse' },
              resize: true,
            },
            modes: { repulse: { distance: 100, duration: 0.4 } },
          },
          particles: {
            color: { value: ['#4B8EC9', '#FF9A8D', '#6C5CE7'] },
            links: {
              color: '#4B8EC9',
              distance: 150,
              enable: true,
              opacity: 0.4,
              width: 1,
            },
            collisions: { enable: true },
            move: {
              direction: 'none',
              enable: true,
              outModes: { default: 'bounce' },
              speed: 1.5,
            },
            number: { density: { enable: true, area: 800 }, value: 40 },
            opacity: { value: 0.5 },
            shape: { type: 'circle' },
            size: { value: { min: 1, max: 3 } },
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
          mx: 'auto',
          marginTop: '30px'
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
  
        {/* Auth Form */}
        <form onSubmit={handleAuth} style={{ width: '100%' }}>
          {/* Email Field */}
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
  
          {/* Password Field */}
          <TextField
            fullWidth
            margin="normal"
            label="Password"
            variant="outlined"
            type={showPassword ? 'text' : 'password'}
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
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleClickShowPassword}
                    edge="end"
                    sx={{ color: 'text.secondary' }}
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            onChange={(e) => setPassword(e.target.value)}
          />
  
          {/* Submit Button */}
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
              background: 'linear-gradient(45deg, #4B8EC9 30%, #FF9A8D 90%)',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: '0 6px 8px rgba(0, 0, 0, 0.2)',
                transform: 'translateY(-1px)'
              },
            }}
          >
            {isLogin ? 'Sign In' : 'Create Account'}
          </Button>
  
          {/* Toggle Login/Signup */}
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
  
          {/* Google Sign-In Button */}
          <Box sx={{ mt: 3, width: '100%' }}>
            <Typography variant="body2" sx={{ 
              textAlign: 'center', 
              color: 'text.secondary',
              mb: 2
            }}>
              ──── OR CONTINUE WITH ────
            </Typography>
            
            <Button
              fullWidth
              variant="contained"
              startIcon={<GoogleIcon />}
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
  );}