import { useNavigate } from 'react-router-dom';
import React, { useEffect, useState, useCallback } from 'react';
import { 
  Box, 
  Typography, 
  CircularProgress, 
  Grid, 
  Card, 
  CardContent, 
  Button, 
  List, 
  ListItem, 
  ListItemText,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  ListItemAvatar,
  Avatar,
  LinearProgress,
  Divider,
  Drawer,
  ListItemButton,
  ListItemIcon,
  Container,
  Paper,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { doc, getDoc, collection, getDocs, updateDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import Header from './Header';
import { keyframes } from '@emotion/react';
import Particles from 'react-tsparticles';
import { loadFull } from 'tsparticles';
import SchoolIcon from '@mui/icons-material/School';
import PersonIcon from '@mui/icons-material/Person';
import PsychologyIcon from '@mui/icons-material/Psychology';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import WarningIcon from '@mui/icons-material/Warning';

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const drawerWidth = 260;

export default function Profile() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [userData, setUserData] = useState(null);
  const [progressData, setProgressData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [editPersonalOpen, setEditPersonalOpen] = useState(false);
  const [formData, setFormData] = useState({
    preferences: '',
    goals: ''
  });
  const [personalData, setPersonalData] = useState({
    displayName: '',
    email: '',
    phone: '',
    bio: ''
  });
  const [strengths, setStrengths] = useState([]);
  const [weaknesses, setWeaknesses] = useState([]);
  const [activeTab, setActiveTab] = useState('progress');
  const navigate = useNavigate();

  const particlesInit = useCallback(async (engine) => {
    await loadFull(engine);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRef = doc(db, 'users', auth.currentUser.uid);
        const userSnap = await getDoc(userRef);
        
        const progressCol = collection(db, `users/${auth.currentUser.uid}/progress`);
        const progressSnapshot = await getDocs(progressCol);
        
        const progressData = progressSnapshot.docs.map(doc => ({
          courseId: doc.id,
          ...doc.data()
        }));

        const coursesWithProgress = progressData.filter(course => course.scores?.length > 0);
        const courseStats = coursesWithProgress.map(course => {
          const avgScore = course.scores.reduce((a, b) => a + b, 0) / course.scores.length;
          return {
            courseId: course.courseId,
            avgScore,
            courseName: course.courseId.replace(/-/g, ' ').toUpperCase()
          };
        });

        if (courseStats.length > 0) {
          const maxScore = Math.max(...courseStats.map(c => c.avgScore));
          const minScore = Math.min(...courseStats.map(c => c.avgScore));
          
          setStrengths(courseStats.filter(c => c.avgScore === maxScore));
          setWeaknesses(courseStats.filter(c => c.avgScore === minScore));
        }

        setUserData(userSnap.data());
        setProgressData(progressData);
        
        if (userSnap.data()?.learnerProfile) {
          setFormData(userSnap.data().learnerProfile);
        }

        setPersonalData({
          displayName: userSnap.data()?.displayName || auth.currentUser.displayName || '',
          email: userSnap.data()?.email || auth.currentUser.email || '',
          phone: userSnap.data()?.phone || '',
          bio: userSnap.data()?.bio || ''
        });
        
      } catch (error) {
        console.error('Error fetching profile data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const calculateCourseStats = (course) => {
    const scores = course.scores || [];
    const avgScore = scores.length > 0 
      ? scores.reduce((a, b) => a + b, 0) / scores.length 
      : 0;
      
    return {
      avgScore,
      completedChapters: scores.length,
      difficulty: course.difficulty || 'beginner',
      lastScore: course.lastScore || 0
    };
  };

  const handleEditOpen = () => {
    setEditOpen(true);
  };

  const handleEditClose = () => {
    setEditOpen(false);
  };

  const handlePersonalEditOpen = () => {
    setEditPersonalOpen(true);
  };

  const handlePersonalEditClose = () => {
    setEditPersonalOpen(false);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userRef, {
        learnerProfile: formData
      });
      setUserData(prev => ({ ...prev, learnerProfile: formData }));
      setEditOpen(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handlePersonalFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userRef, {
        displayName: personalData.displayName,
        email: personalData.email,
        phone: personalData.phone,
        bio: personalData.bio
      });
      
      if (personalData.email !== auth.currentUser.email) {
        await auth.currentUser.updateEmail(personalData.email);
      }
      
      if (personalData.displayName !== auth.currentUser.displayName) {
        await auth.currentUser.updateProfile({
          displayName: personalData.displayName
        });
      }

      setUserData(prev => ({ 
        ...prev, 
        displayName: personalData.displayName,
        email: personalData.email,
        phone: personalData.phone,
        bio: personalData.bio 
      }));
      
      setEditPersonalOpen(false);
    } catch (error) {
      console.error('Error updating personal data:', error);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner': return 'primary';
      case 'intermediate': return 'secondary';
      case 'advanced': return 'success';
      default: return 'info';
    }
  };

  return (
    <Box sx={{ 
      width: '100%', 
      minHeight: '100vh', 
      backgroundColor: '#F8FAFC', 
      position: 'relative',
      overflowX: 'hidden'
    }}>
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
            links: { color: '#4B8EC9', distance: 150, enable: true, opacity: 0.4, width: 1 },
            collisions: { enable: true },
            move: { direction: 'none', enable: true, outModes: { default: 'bounce' }, speed: 1.5 },
            number: { density: { enable: true, area: 800 }, value: 40 },
            opacity: { value: 0.5 },
            shape: { type: 'circle' },
            size: { value: { min: 1, max: 3 } },
          },
          detectRetina: true,
        }}
        style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}
      />

      <Header />
      
      <Container 
        maxWidth={isMobile ? false : 'xl'} 
        sx={{ 
          px: isMobile ? 2 : 4,
          position: 'relative',
          zIndex: 1,
          mt: 8,
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          gap: 3
        }}
      >
        {/* Navigation Menu */}
        <Paper 
          elevation={3} 
          sx={{
            width: isMobile ? '100%' : drawerWidth,
            flexShrink: 0,
            borderRadius: '16px',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            p: 2,
            height: 'fit-content',
            boxShadow: '0 8px 20px rgba(0, 0, 0, 0.1)',
            mb: isMobile ? 2 : 0
          }}
        >
          <List sx={{ p: 0 }}>
            <ListItem disablePadding sx={{ mb: 1 }}>
              <ListItemButton 
                selected={activeTab === 'progress'}
                onClick={() => setActiveTab('progress')}
                sx={{
                  borderRadius: '12px',
                  '&.Mui-selected': {
                    background: 'linear-gradient(135deg, rgba(75, 142, 201, 0.2) 0%, rgba(255, 154, 141, 0.2) 100%)',
                    borderLeft: '4px solid #4B8EC9'
                  },
                  '&:hover': {
                    background: 'rgba(75, 142, 201, 0.1)'
                  }
                }}
              >
                <ListItemIcon sx={{ minWidth: '40px' }}>
                  <SchoolIcon color={activeTab === 'progress' ? 'primary' : 'inherit'} />
                </ListItemIcon>
                <ListItemText 
                  primary="Learning Progress" 
                  primaryTypographyProps={{
                    fontWeight: activeTab === 'progress' ? 600 : 500,
                    color: activeTab === 'progress' ? 'primary.main' : 'text.primary'
                  }} 
                />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton 
                selected={activeTab === 'personal'}
                onClick={() => setActiveTab('personal')}
                sx={{
                  borderRadius: '12px',
                  '&.Mui-selected': {
                    background: 'linear-gradient(135deg, rgba(75, 142, 201, 0.2) 0%, rgba(255, 154, 141, 0.2) 100%)',
                    borderLeft: '4px solid #4B8EC9'
                  },
                  '&:hover': {
                    background: 'rgba(75, 142, 201, 0.1)'
                  }
                }}
              >
                <ListItemIcon sx={{ minWidth: '40px' }}>
                  <PersonIcon color={activeTab === 'personal' ? 'primary' : 'inherit'} />
                </ListItemIcon>
                <ListItemText 
                  primary="Personal Details" 
                  primaryTypographyProps={{
                    fontWeight: activeTab === 'personal' ? 600 : 500,
                    color: activeTab === 'personal' ? 'primary.main' : 'text.primary'
                  }} 
                />
              </ListItemButton>
            </ListItem>
          </List>
        </Paper>

        {/* Main Content */}
        <Box sx={{ 
          flexGrow: 1,
          minWidth: 0 // Prevent overflow
        }}>
          <Paper 
            elevation={3} 
            sx={{
              borderRadius: '16px',
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              p: isMobile ? 2 : 4,
              boxShadow: '0 8px 20px rgba(0, 0, 0, 0.1)',
              width: '100%'
            }}
          >
            <Typography variant="h2" sx={{ 
              mb: 3, 
              fontWeight: 700, 
              background: 'linear-gradient(45deg, #4B8EC9 30%, #FF9A8D 90%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontSize: isMobile ? '1.8rem' : '2.4rem'
            }}>
              {activeTab === 'progress' ? 'Learning Dashboard' : 'Personal Profile'}
            </Typography>

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress size={40} />
              </Box>
            ) : activeTab === 'progress' ? (
              <Grid container spacing={3}>
                {/* Learning Progress Section */}
                <Grid item xs={12} lg={8}>
                  <Card sx={{ 
                    mb: 3, 
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
                  }}>
                    <CardContent>
                      <Typography variant="h5" sx={{ mb: 3, fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                        <SchoolIcon color="primary" sx={{ mr: 1 }} />
                        Your Learning Progress
                      </Typography>
                      {progressData.length > 0 ? (
                        <List>
                          {progressData.map(course => {
                            const stats = calculateCourseStats(course);
                            return (
                              <ListItem key={course.courseId} sx={{ mb: 2 }}>
                                <ListItemAvatar>
                                  <Avatar sx={{ 
                                    bgcolor: getDifficultyColor(stats.difficulty),
                                    width: 56, 
                                    height: 56,
                                    fontSize: '1.25rem'
                                  }}>
                                    {course.courseId.split('-')[0].toUpperCase()}
                                  </Avatar>
                                </ListItemAvatar>
                                <ListItemText
                                  primary={course.courseId.replace(/-/g, ' ').toUpperCase()}
                                  secondary={
                                    <>
                                      <Typography component="span" variant="body2" color="text.primary">
                                        {stats.difficulty.toUpperCase()} LEVEL
                                      </Typography>
                                      <br />
                                      Completed {stats.completedChapters} chapters
                                    </>
                                  }
                                  sx={{ ml: 2 }}
                                />
                                <Box sx={{ minWidth: 120, textAlign: 'right' }}>
                                  <Typography variant="h6" color="primary">
                                    {stats.avgScore.toFixed(1)}%
                                  </Typography>
                                  <LinearProgress 
                                    variant="determinate" 
                                    value={stats.avgScore} 
                                    color={getDifficultyColor(stats.difficulty)}
                                    sx={{ height: 8, borderRadius: 4, mt: 1 }}
                                  />
                                </Box>
                              </ListItem>
                            );
                          })}
                        </List>
                      ) : (
                        <Typography variant="body1" color="text.secondary">
                          No course progress data available. Start learning to track your progress!
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>

                {/* Stats Section */}
                <Grid item xs={12} lg={4}>
                  <Card sx={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                    mb: 3
                  }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                        <Avatar 
                          src={userData?.photoURL} 
                          sx={{ 
                            width: 64, 
                            height: 64, 
                            mr: 2,
                            border: '2px solid #4B8EC9'
                          }} 
                        />
                        <Box>
                          <Typography variant="h6">{userData?.displayName}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {userData?.email}
                          </Typography>
                        </Box>
                      </Box>

                      <Divider sx={{ my: 2 }} />

                      <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                        <EmojiEventsIcon color="success" sx={{ mr: 1, fontSize: '1.2rem' }} />
                        Strength
                      </Typography>
                      {strengths.length > 0 ? (
                        strengths.map((strength, index) => (
                          <Box key={index} sx={{ mt: 1 }}>
                            <Typography variant="body2">{strength.courseName}</Typography>
                            <LinearProgress 
                              variant="determinate" 
                              value={strength.avgScore} 
                              color="success"
                              sx={{ height: 8, borderRadius: 4 }}
                            />
                            <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                              {Math.round(strength.avgScore)}% Average
                            </Typography>
                          </Box>
                        ))
                      ) : (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          No strengths identified yet
                        </Typography>
                      )}

                      <Typography variant="h6" sx={{ mt: 3, mb: 2, display: 'flex', alignItems: 'center' }}>
                        <WarningIcon color="error" sx={{ mr: 1, fontSize: '1.2rem' }} />
                        Weakness
                      </Typography>
                      {weaknesses.length > 0 ? (
                        weaknesses.map((weakness, index) => (
                          <Box key={index} sx={{ mt: 1 }}>
                            <Typography variant="body2">{weakness.courseName}</Typography>
                            <LinearProgress 
                              variant="determinate" 
                              value={weakness.avgScore} 
                              color="error"
                              sx={{ height: 8, borderRadius: 4 }}
                            />
                            <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                              {Math.round(weakness.avgScore)}% Average
                            </Typography>
                          </Box>
                        ))
                      ) : (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          No weaknesses identified yet
                        </Typography>
                      )}

                      <Divider sx={{ my: 3 }} />

                      <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                        <PsychologyIcon color="primary" sx={{ mr: 1, fontSize: '1.2rem' }} />
                        Learning Preferences
                      </Typography>
                      <List dense>
                        <ListItem>
                          <ListItemText
                            primary="Learning Goals"
                            secondary={userData?.learnerProfile?.goals || 'Not specified'}
                            secondaryTypographyProps={{ color: 'text.primary' }}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText
                            primary="Preferences"
                            secondary={userData?.learnerProfile?.preferences || 'Not specified'}
                            secondaryTypographyProps={{ color: 'text.primary' }}
                          />
                        </ListItem>
                      </List>
                      <Button 
                        variant="contained" 
                        fullWidth
                        onClick={handleEditOpen}
                        sx={{ 
                          mt: 2,
                          py: 1.5,
                          borderRadius: '12px',
                          fontWeight: 600,
                          background: 'linear-gradient(45deg, #4B8EC9 30%, #FF9A8D 90%)',
                          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            animation: `${pulse} 1s infinite`,
                            boxShadow: '0 6px 8px rgba(0, 0, 0, 0.2)'
                          }
                        }}
                      >
                        Edit Preferences
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            ) : (
              <Card sx={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
              }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Avatar 
                      src={userData?.photoURL} 
                      sx={{ 
                        width: 64, 
                        height: 64, 
                        mr: 2,
                        border: '2px solid #4B8EC9'
                      }} 
                    />
                    <Box>
                      <Typography variant="h6">{userData?.displayName}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {userData?.email}
                      </Typography>
                    </Box>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Personal Details
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemText
                        primary="Name"
                        secondary={userData?.displayName || 'Not set'}
                        secondaryTypographyProps={{ color: 'text.primary' }}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Email"
                        secondary={userData?.email || 'Not set'}
                        secondaryTypographyProps={{ color: 'text.primary' }}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Phone"
                        secondary={userData?.phone || 'Not set'}
                        secondaryTypographyProps={{ color: 'text.primary' }}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Bio"
                        secondary={userData?.bio || 'Not set'}
                        secondaryTypographyProps={{ color: 'text.primary' }}
                      />
                    </ListItem>
                  </List>
                  <Button 
                    variant="outlined" 
                    fullWidth
                    onClick={handlePersonalEditOpen}
                    sx={{ 
                      mt: 1,
                      py: 1,
                      borderRadius: '12px',
                      fontWeight: 600,
                      borderWidth: '2px',
                      '&:hover': {
                        borderWidth: '2px'
                      }
                    }}
                  >
                    Edit Personal Details
                  </Button>
                </CardContent>
              </Card>
            )}
          </Paper>
        </Box>
      </Container>

      {/* Edit Learning Preferences Dialog */}
      <Dialog open={editOpen} onClose={handleEditClose} fullWidth maxWidth="sm">
        <DialogTitle>Edit Learning Preferences</DialogTitle>
        <form onSubmit={handleFormSubmit}>
          <DialogContent>
            <TextField
              margin="normal"
              label="Learning Goals"
              fullWidth
              multiline
              rows={3}
              value={formData.goals}
              onChange={(e) => setFormData({...formData, goals: e.target.value})}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="normal"
              label="Preferences"
              fullWidth
              multiline
              rows={3}
              value={formData.preferences}
              onChange={(e) => setFormData({...formData, preferences: e.target.value})}
            />
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button 
              onClick={handleEditClose}
              sx={{ 
                px: 3,
                py: 1,
                borderRadius: '12px',
                fontWeight: 600,
                border: '2px solid',
                borderColor: 'divider'
              }}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="contained"
              sx={{ 
                px: 3,
                py: 1,
                borderRadius: '12px',
                fontWeight: 600,
                background: 'linear-gradient(45deg, #4B8EC9 30%, #FF9A8D 90%)',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                '&:hover': {
                  boxShadow: '0 6px 8px rgba(0, 0, 0, 0.2)'
                }
              }}
            >
              Save Changes
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Edit Personal Details Dialog */}
      <Dialog open={editPersonalOpen} onClose={handlePersonalEditClose} fullWidth maxWidth="sm">
        <DialogTitle>Edit Personal Details</DialogTitle>
        <form onSubmit={handlePersonalFormSubmit}>
          <DialogContent>
            <TextField
              margin="normal"
              label="Full Name"
              fullWidth
              value={personalData.displayName}
              onChange={(e) => setPersonalData({...personalData, displayName: e.target.value})}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="normal"
              label="Email"
              fullWidth
              type="email"
              value={personalData.email}
              onChange={(e) => setPersonalData({...personalData, email: e.target.value})}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="normal"
              label="Phone Number"
              fullWidth
              value={personalData.phone}
              onChange={(e) => setPersonalData({...personalData, phone: e.target.value})}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="normal"
              label="Bio"
              fullWidth
              multiline
              rows={3}
              value={personalData.bio}
              onChange={(e) => setPersonalData({...personalData, bio: e.target.value})}
            />
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button 
              onClick={handlePersonalEditClose}
              sx={{ 
                px: 3,
                py: 1,
                borderRadius: '12px',
                fontWeight: 600,
                border: '2px solid',
                borderColor: 'divider'
              }}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="contained"
              sx={{ 
                px: 3,
                py: 1,
                borderRadius: '12px',
                fontWeight: 600,
                background: 'linear-gradient(45deg, #4B8EC9 30%, #FF9A8D 90%)',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                '&:hover': {
                  boxShadow: '0 6px 8px rgba(0, 0, 0, 0.2)'
                }
              }}
            >
              Save Changes
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}