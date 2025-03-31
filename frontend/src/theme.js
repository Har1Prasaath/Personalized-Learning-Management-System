// theme.js
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: { main: '#4B8EC9' },
    secondary: { main: '#FF9A8D' },
    background: { default: '#F8FAFC', paper: '#FFFFFF' },
    text: { primary: '#2D3748', secondary: '#718096' },
    success: { main: '#4CAF50' },
    info: { main: '#2196F3' },
  },
  typography: {
    fontFamily: 'Raleway, sans-serif',
    h1: { fontSize: '2.5rem', fontWeight: 600, color: '#2D3748', letterSpacing: '-0.02em' },
    h2: { fontSize: '2rem', fontWeight: 600, color: '#2D3748', letterSpacing: '-0.015em' },
    h3: { fontSize: '1.75rem', fontWeight: 600, color: '#2D3748' },
    h4: { fontSize: '1.5rem', fontWeight: 600, color: '#2D3748' },
    h5: { fontSize: '1.25rem', fontWeight: 600, color: '#2D3748' },
    h6: { fontSize: '1rem', fontWeight: 600, color: '#2D3748' },
    body1: { fontSize: '1rem', lineHeight: 1.6, color: '#4A5568' },
    body2: { fontSize: '0.875rem', lineHeight: 1.6, color: '#718096' },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: '8px', padding: '12px 24px', textTransform: 'none', fontSize: '1rem' },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: { 
          borderRadius: '12px', 
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', 
          transition: 'transform 0.2s, box-shadow 0.2s', 
          '&:hover': { 
            transform: 'translateY(-2px)', 
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' 
          } 
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          transition: 'all 0.2s ease',
          '&:hover': {
            backgroundColor: 'rgba(75, 142, 201, 0.08)'
          }
        }
      }
    },
  },
});

export default theme;