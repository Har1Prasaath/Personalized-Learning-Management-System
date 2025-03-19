import React, { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { Button, TextField, Container, Typography, Box } from '@mui/material';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  const handleAuth = async (e) => {
    e.preventDefault();
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (error) {
      alert(getAuthErrorMessage(error.code));
    }
  };

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
    <Container maxWidth="xs" sx={{ mt: 8, px: 2 }}>
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        backgroundColor: 'background.paper',
        borderRadius: 4,
        p: 4,
        boxShadow: 3
      }}>
        <Typography variant="h4" gutterBottom sx={{ color: 'text.primary' }}>
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
            sx={{ backgroundColor: 'background.default' }}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Password"
            variant="outlined"
            type="password"
            required
            sx={{ backgroundColor: 'background.default' }}
            onChange={(e) => setPassword(e.target.value)}
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
              '&:hover': {
                transform: 'translateY(-1px)'
              }
            }}
          >
            {isLogin ? 'Sign In' : 'Create Account'}
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
                '&:hover': {
                  backgroundColor: 'transparent',
                  textDecoration: 'underline'
                }
              }}
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? 'Sign up instead' : 'Sign in instead'}
            </Button>
          </Typography>
        </form>
      </Box>
    </Container>
  );
}