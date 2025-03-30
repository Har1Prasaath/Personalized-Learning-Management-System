// components/Header.js
import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Button, Box, IconButton, Avatar, Menu, MenuItem, ListItemIcon } from '@mui/material';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { ReactComponent as HomeIcon } from '../assets/home-icon.svg';
import PersonIcon from '@mui/icons-material/Person';
import Logout from '@mui/icons-material/Logout';

export default function Header() {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleHomeClick = () => {
    navigate('/home');
  };

  const handleProfileClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const navigateToProfile = () => {
    navigate('/profile');
    handleClose();
  };

  return (
    <AppBar position="fixed" sx={{ 
      background: 'linear-gradient(45deg, #4B8EC9 45%,rgb(212, 139, 129) 90%)', 
      color: 'white', 
      zIndex: (theme) => theme.zIndex.drawer + 2, 
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', 
      fontFamily: 'Poppins, sans-serif' 
    }}>
      <Toolbar>
      <Typography variant="h6" component="div" sx={{ 
  flexGrow: 1, 
  cursor: 'pointer', 
  fontWeight: 700, 
  letterSpacing: '0.5px', 
  fontSize: '1.25rem', 
  fontFamily: 'Raleway, sans-serif',
  color: 'white',
  '&:hover': { opacity: 0.9 } 
}} onClick={handleHomeClick}>
  Personalized Learning Management System
</Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <IconButton color="inherit" onClick={handleHomeClick} sx={{ 
            p: 1, 
            '&:hover': { 
              backgroundColor: 'rgba(255,255,255,0.1)', 
              transform: 'scale(1.1)' 
            }, 
            transition: 'all 0.2s ease' 
          }}>
            <HomeIcon style={{ width: 28, height: 28, fill: 'currentColor' }} />
          </IconButton>

          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1.5,
              cursor: 'pointer',
              '&:hover': { opacity: 0.9 }
            }}
            onClick={handleProfileClick}
          >
            {auth.currentUser?.photoURL && (
              <Box sx={{ 
                border: '2px solid transparent', 
                borderRadius: '50%', 
                background: 'linear-gradient(225deg, #4B8EC9, rgb(212, 139, 129)) border-box', 
                padding: '2px' 
              }}>
                <Avatar src={auth.currentUser.photoURL} sx={{ width: 36, height: 36, border: '2px solid white' }} />
              </Box>
            )}
            <Typography variant="subtitle1" sx={{ color: 'white', fontFamily: 'Poppins, sans-serif', fontWeight: 500 }}>
              {auth.currentUser?.displayName}
            </Typography>
          </Box>

          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            PaperProps={{
              elevation: 0,
              sx: {
                overflow: 'visible',
                filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                mt: 1.5,
                '& .MuiAvatar-root': {
                  width: 32,
                  height: 32,
                  ml: -0.5,
                  mr: 1,
                },
              },
            }}
          >
            <MenuItem onClick={navigateToProfile}>
              <ListItemIcon>
                <PersonIcon fontSize="small" />
              </ListItemIcon>
              Learner Profile
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <Logout fontSize="small" />
              </ListItemIcon>
              Logout
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}