import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Box, IconButton, Avatar, Menu, MenuItem, ListItemIcon, Tooltip } from '@mui/material';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { ReactComponent as AdminHomeIcon } from '../assets/home-icon.svg';
import Logout from '@mui/icons-material/Logout';

export default function AdminHeader() {
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

  const handleDashboardClick = () => {
    navigate('/admin/dashboard');
  };

  const handleProfileClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <AppBar position="fixed" sx={{ 
      background: 'linear-gradient(45deg, #2C3E50 45%, #3498DB 90%)', 
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
        }} onClick={handleDashboardClick}>
          Admin Dashboard
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <IconButton color="inherit" onClick={handleDashboardClick} sx={{ 
            p: 1, 
            '&:hover': { 
              backgroundColor: 'rgba(255,255,255,0.1)', 
              transform: 'scale(1.1)' 
            }, 
            transition: 'all 0.2s ease' 
          }}>
            <AdminHomeIcon style={{ width: 28, height: 28, fill: 'currentColor' }} />
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
                background: 'linear-gradient(225deg, #2C3E50, #3498DB) border-box', 
                padding: '2px' 
              }}>
                <Avatar src={auth.currentUser.photoURL} sx={{ width: 36, height: 36, border: '2px solid white' }} />
              </Box>
            )}
            <Typography variant="subtitle1" sx={{ color: 'white', fontFamily: 'Poppins, sans-serif', fontWeight: 500 }}>
              {auth.currentUser?.displayName || 'Admin'}
            </Typography>
          </Box>
          
          {/* Add logout button */}
          <Tooltip title="Logout">
            <IconButton 
              color="inherit" 
              onClick={handleLogout} 
              sx={{ 
                p: 1, 
                '&:hover': { 
                  backgroundColor: 'rgba(255,255,255,0.1)', 
                  transform: 'scale(1.1)' 
                }, 
                transition: 'all 0.2s ease' 
              }}
              aria-label="logout"
            >
              <Logout style={{ width: 24, height: 24 }} />
            </IconButton>
          </Tooltip>

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