import React, { useState, useCallback } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { auth, db } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { 
  Button, 
  TextField, 
  Container, 
  Typography, 
  Box, 
  InputAdornment,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  FormControlLabel, 
  Radio, 
  RadioGroup, 
  FormControl, 
  FormLabel 
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { keyframes } from '@emotion/react';
import Particles from 'react-tsparticles';
import { loadFull } from 'tsparticles';
import { useLoading } from '../context/LoadingContext';
import GoogleIcon from '@mui/icons-material/Google';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('user');
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [error, setError] = useState(null);
  const { setIsLoading } = useLoading();
  const navigate = useNavigate();
  const [googleRoleDialogOpen, setGoogleRoleDialogOpen] = useState(false);
  const [googleUser, setGoogleUser] = useState(null);
  // Add state for authentication status message
  const [authMessage, setAuthMessage] = useState('');
  const [authSuccess, setAuthSuccess] = useState(false);

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const particlesInit = useCallback(async (engine) => {
    await loadFull(engine);
  }, []);

  const handleAuth = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setAuthMessage('Authenticating your credentials...');
    
    try {
      if (isLogin) {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        
        // Show authentication success message
        setAuthSuccess(true);
        setAuthMessage('Authentication successful! Verifying access...');
        
        const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
        const userRole = userDoc.data().role;
        
        // Show role-specific message
        setAuthMessage(`Welcome! Redirecting to ${userRole === 'admin' ? 'admin dashboard' : 'your learning dashboard'}...`);
        
        // Delay navigation to allow message display
        setTimeout(() => {
          navigate(userRole === 'admin' ? '/admin/dashboard' : '/home');
          setIsLoading(false);
        }, 1000);
      } else {
        // For registration
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Update user profile with the name
        await updateProfile(user, {
          displayName: name
        });

        // Create the user document
        await setDoc(doc(db, 'users', user.uid), {
          email: user.email,
          displayName: name,
          photoURL: user.photoURL || '',
          role: role,
          createdAt: new Date(),
        });
        
        // Show success message
        setAuthSuccess(true);
        setAuthMessage('Account created successfully! Setting up your dashboard...');
        
        // Force token refresh to apply custom claims properly
        await auth.currentUser.getIdToken(true);
        
        // Add small delay to ensure Firestore permissions update
        setTimeout(() => {
          navigate(role === 'admin' ? '/admin/dashboard' : '/home');
          setIsLoading(false);
        }, 1000);
      }
    } catch (error) {
      setError(getAuthErrorMessage(error.code));
      setAuthMessage('');
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    setAuthMessage('Authenticating with Google...');
    
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;

      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const userRole = userDoc.data().role;
        
        setAuthSuccess(true);
        setAuthMessage(`Google authentication successful! Redirecting to ${userRole === 'admin' ? 'admin dashboard' : 'your learning dashboard'}...`);
        
        setTimeout(() => {
          navigate(userRole === 'admin' ? '/admin/dashboard' : '/home');
          setIsLoading(false);
        }, 1000);
      } else {
        // For new Google users, open a dialog to select role
        setAuthMessage('');
        setGoogleUser(user);
        setGoogleRoleDialogOpen(true);
        setIsLoading(false);
      }
    } catch (error) {
      setError(getAuthErrorMessage(error.code));
      setAuthMessage('');
      setIsLoading(false);
    }
  };

  const handleGoogleRoleSelect = async (selectedRole) => {
    setIsLoading(true);
    try {
      if (googleUser) {
        await setDoc(doc(db, 'users', googleUser.uid), {
          email: googleUser.email,
          displayName: googleUser.displayName || '',
          photoURL: googleUser.photoURL || '',
          role: selectedRole,
          createdAt: new Date(),
        });
        
        // Force token refresh
        await auth.currentUser.getIdToken(true);
        
        // Add small delay to ensure Firestore permissions update
        setTimeout(() => {
          navigate(selectedRole === 'admin' ? '/admin/dashboard' : '/home');
        }, 1000);
      }
    } catch (error) {
      setError('Error setting user role. Please try again.');
    } finally {
      setGoogleRoleDialogOpen(false);
      setGoogleUser(null);
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setResetSent(true);
    } catch (error) {
      setError(getAuthErrorMessage(error.code));
    } finally {
      setIsLoading(false);
    }
  };

  const getAuthErrorMessage = (code) => {
    switch (code) {
      case 'auth/user-not-found':
        return 'No user found with this email address';
      case 'auth/wrong-password':
        return 'Incorrect password';
      case 'auth/email-already-in-use':
        return 'Email already in use';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters';
      case 'auth/invalid-email':
        return 'Invalid email address';
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
    <Box sx={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', backgroundColor: '#F8FAFC' }}>
      <Typography variant="h3" sx={{ fontFamily: 'Merriweather, serif', fontWeight: 700, color: '#2D3748', textAlign: 'center', position: 'absolute', top: '10%', zIndex: 2, width: '100%', fontSize: { xs: '2rem', sm: '2.5rem' }, letterSpacing: '0.5px' }}>
        Personalized Learning Management System
      </Typography>
      
      <Particles id="tsparticles" init={particlesInit} options={{ background: { color: { value: '#F8FAFC' } }, fpsLimit: 60, interactivity: { events: { onHover: { enable: true, mode: 'repulse' }, resize: true }, modes: { repulse: { distance: 100, duration: 0.4 } } }, particles: { color: { value: ['#4B8EC9', '#FF9A8D', '#6C5CE7'] }, links: { color: '#4B8EC9', distance: 150, enable: true, opacity: 0.4, width: 1 }, collisions: { enable: true }, move: { direction: 'none', enable: true, outModes: { default: 'bounce' }, speed: 1.5 }, number: { density: { enable: true, area: 800 }, value: 40 }, opacity: { value: 0.5 }, shape: { type: 'circle' }, size: { value: { min: 1, max: 5 } }, } }} />

      <Container maxWidth="xs" sx={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: 4, p: 4, boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)', backdropFilter: 'blur(12px)', animation: `${fadeIn} 0.6s ease-out`, width: '100%', maxWidth: '400px', mx: 'auto', marginTop: '30px' }}>
        <Typography variant="h2" gutterBottom sx={{ color: 'text.primary', mb: 3, fontWeight: 700, background: 'linear-gradient(45deg, #4B8EC9 30%, #FF9A8D 90%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontSize: '2rem' }}>
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </Typography>

        {/* Authentication status message */}
        {authMessage && (
          <Alert severity={authSuccess ? "success" : "info"} sx={{ width: '100%', mb: 2 }}>
            {authMessage}
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleAuth} style={{ width: '100%' }}>
          {!isLogin && (
            <TextField 
              fullWidth 
              margin="normal" 
              label="Full Name" 
              variant="outlined" 
              required 
              sx={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                borderRadius: 2, 
                '& .MuiOutlinedInput-root': { 
                  '& fieldset': { borderColor: '#E0E0E0' }, 
                  '&:hover fieldset': { borderColor: '#4B8EC9' }, 
                  '&.Mui-focused fieldset': { borderColor: '#4B8EC9' } 
                } 
              }} 
              onChange={(e) => setName(e.target.value)} 
            />
          )}

          {!isLogin && (
            <FormControl component="fieldset" fullWidth margin="normal" sx={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.9)', 
              borderRadius: 2,
              p: 2
            }}>
              <FormLabel component="legend">Account Type</FormLabel>
              <RadioGroup 
                row 
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <FormControlLabel value="user" control={<Radio />} label="Learner" />
                <FormControlLabel value="admin" control={<Radio />} label="Administrator" />
              </RadioGroup>
            </FormControl>
          )}

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
                '& fieldset': { borderColor: '#E0E0E0' }, 
                '&:hover fieldset': { borderColor: '#4B8EC9' }, 
                '&.Mui-focused fieldset': { borderColor: '#4B8EC9' } 
              } 
            }} 
            onChange={(e) => setEmail(e.target.value)} 
          />
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
                '& fieldset': { borderColor: '#E0E0E0' }, 
                '&:hover fieldset': { borderColor: '#4B8EC9' }, 
                '&.Mui-focused fieldset': { borderColor: '#4B8EC9' } 
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
          
          {isLogin && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 0.5 }}>
              <Button 
                variant="text" 
                size="small" 
                sx={{ 
                  textTransform: 'none', 
                  color: 'text.secondary',
                  '&:hover': { 
                    textDecoration: 'underline',
                    backgroundColor: 'transparent'
                  }
                }}
                onClick={() => setForgotPasswordOpen(true)}
              >
                Forgot password?
              </Button>
            </Box>
          )}

          <Button 
            fullWidth 
            type="submit" 
            variant="contained" 
            size="large" 
            sx={{ 
              mt: 1, 
              py: 1.5, 
              borderRadius: 2, 
              fontWeight: 600, 
              background: 'linear-gradient(45deg, #4B8EC9 30%, #FF9A8D 90%)', 
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', 
              transition: 'all 0.3s ease', 
              '&:hover': { 
                boxShadow: '0 6px 8px rgba(0, 0, 0, 0.2)', 
                transform: 'translateY(-1px)' 
              } 
            }} 
          > 
            {isLogin ? 'Sign In' : 'Create Account'} 
          </Button>
          
          <Typography variant="body2" sx={{ mt: 2, textAlign: 'center', color: 'text.secondary' }}> 
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
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
              }}
            > 
              {isLogin ? 'Sign up instead' : 'Sign in instead'} 
            </Button> 
          </Typography>
          
          <Box sx={{ mt: 0.5, width: '100%' }}> 
            <Typography variant="body2" sx={{ textAlign: 'center', color: 'text.secondary', mb: 2 }}> 
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

      {/* Forgot Password Dialog */}
      <Dialog open={forgotPasswordOpen} onClose={() => {
        setForgotPasswordOpen(false);
        setResetSent(false);
        setError(null);
      }}>
        <DialogTitle>Reset Password</DialogTitle>
        <DialogContent>
          {resetSent ? (
            <Alert severity="success" sx={{ mb: 2 }}>
              Password reset email sent. Please check your inbox.
            </Alert>
          ) : (
            <>
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}
              <Typography variant="body1" sx={{ mb: 2 }}>
                Enter your email address and we'll send you a link to reset your password.
              </Typography>
              <TextField
                fullWidth
                label="Email"
                variant="outlined"
                type="email"
                required
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                sx={{ mt: 1 }}
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          {!resetSent && (
            <>
              <Button onClick={() => {
                setForgotPasswordOpen(false);
                setResetSent(false);
                setError(null);
              }}>
                Cancel
              </Button>
              <Button 
                onClick={handleForgotPassword}
                variant="contained"
                disabled={!resetEmail}
              >
                Send Reset Link
              </Button>
            </>
          )}
          {resetSent && (
            <Button 
              onClick={() => {
                setForgotPasswordOpen(false);
                setResetSent(false);
                setError(null);
              }}
              variant="contained"
            >
              Close
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Role Selection Dialog for Google Sign-In */}
      <Dialog open={googleRoleDialogOpen} onClose={() => setGoogleRoleDialogOpen(false)}>
        <DialogTitle>Select Account Type</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Please select your account type:
          </Typography>
          <RadioGroup defaultValue="user">
            <FormControlLabel 
              value="user" 
              control={<Radio />} 
              label="Learner" 
              onClick={() => handleGoogleRoleSelect('user')}
            />
            <FormControlLabel 
              value="admin" 
              control={<Radio />} 
              label="Administrator" 
              onClick={() => handleGoogleRoleSelect('admin')}
            />
          </RadioGroup>
        </DialogContent>
      </Dialog>
    </Box>
  );
}