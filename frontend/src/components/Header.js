import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box, IconButton } from '@mui/material';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { ReactComponent as HomeIcon } from '../assets/home-icon.svg'; // Import the SVG file

export default function Header() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/'); // Redirect to login page after logout
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleHomeClick = () => {
    navigate('/home'); // Navigate to home page when PLMS is clicked
  };

  return (
    <AppBar position="static" sx={{ bgcolor: 'primary.main' }}>
      <Toolbar>
        <Typography
          variant="h6"
          component="div"
          sx={{ flexGrow: 1, cursor: 'pointer' }}
          onClick={handleHomeClick}
        >
          Personalized Learning Management System
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* Home Icon Button */}
          <IconButton
            color="inherit"
            onClick={handleHomeClick}
            sx={{
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.1)',
              },
            }}
          >
            <HomeIcon />
          </IconButton>

          {/* Logout Button */}
          <Button 
            color="inherit" 
            onClick={handleLogout}
            sx={{ 
              '&:hover': { 
                backgroundColor: 'rgba(255,255,255,0.1)' 
              }
            }}
          >
            Logout
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}