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
      // Navigation will be handled automatically by the router
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
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography variant="h4" gutterBottom>
          {isLogin ? 'Login' : 'Sign Up'}
        </Typography>
        <form onSubmit={handleAuth} style={{ width: '100%' }}>
          <TextField
            fullWidth
            margin="normal"
            label="Email"
            variant="outlined"
            type="email"
            required
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Password"
            variant="outlined"
            type="password"
            required
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            fullWidth
            type="submit"
            variant="contained"
            color="primary"
            sx={{ mt: 3 }}
          >
            {isLogin ? 'Login' : 'Create Account'}
          </Button>
          <Button
            fullWidth
            color="secondary"
            sx={{ mt: 2 }}
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? 'Create new account' : 'Existing user? Login'}
          </Button>
        </form>
      </Box>
    </Container>
  );
}