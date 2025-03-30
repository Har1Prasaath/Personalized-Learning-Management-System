// components/Profile.js
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
  LinearProgress
} from '@mui/material';
import { doc, getDoc, collection, getDocs, updateDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import Header from './Header';
import { keyframes } from '@emotion/react';
import Particles from 'react-tsparticles';
import { loadFull } from 'tsparticles';

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

export default function Profile() {
  const [userData, setUserData] = useState(null);
  const [progressData, setProgressData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [formData, setFormData] = useState({
    preferences: '',
    goals: '',
    strengths: '',
    weaknesses: ''
  });
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

        setUserData(userSnap.data());
        setProgressData(progressData);
        
        if (userSnap.data()?.learnerProfile) {
          setFormData(userSnap.data().learnerProfile);
        }
        
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

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner': return 'primary';
      case 'intermediate': return 'secondary';
      case 'advanced': return 'success';
      default: return 'info';
    }
  };

  return (
    <Box sx={{ width: '100%', minHeight: '100vh', backgroundColor: '#F8FAFC', position: 'relative' }}>
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
      
      <Box sx={{ 
        maxWidth: '1200px', 
        mx: 'auto', 
        p: 4, 
        mt: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: 4,
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        position: 'relative',
        zIndex: 1
      }}>
        <Typography variant="h2" sx={{ 
          mb: 4, 
          fontWeight: 700, 
          background: 'linear-gradient(45deg, #4B8EC9 30%, #FF9A8D 90%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Learner Profile
        </Typography>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={40} />
          </Box>
        ) : (
          <Grid container spacing={4}>
            {/* Progress Summary */}
            <Grid item xs={12} md={8}>
              <Card sx={{ mb: 3, backgroundColor: 'rgba(255, 255, 255, 0.8)' }}>
                <CardContent>
                  <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
                    Learning Progress
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

            {/* Profile Details */}
            <Grid item xs={12} md={4}>
              <Card sx={{ backgroundColor: 'rgba(255, 255, 255, 0.8)' }}>
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

                  <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                    Learning Profile
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemText
                        primary="Strengths"
                        secondary={userData?.learnerProfile?.strengths || 'Not specified'}
                        secondaryTypographyProps={{ color: 'text.primary' }}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Weaknesses"
                        secondary={userData?.learnerProfile?.weaknesses || 'Not specified'}
                        secondaryTypographyProps={{ color: 'text.primary' }}
                      />
                    </ListItem>
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
                      borderRadius: 2,
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
                    Edit Profile
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </Box>

      {/* Edit Profile Dialog */}
      <Dialog open={editOpen} onClose={handleEditClose} fullWidth maxWidth="sm">
        <DialogTitle>Edit Learner Profile</DialogTitle>
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
              label="Strengths"
              fullWidth
              value={formData.strengths}
              onChange={(e) => setFormData({...formData, strengths: e.target.value})}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="normal"
              label="Weaknesses"
              fullWidth
              value={formData.weaknesses}
              onChange={(e) => setFormData({...formData, weaknesses: e.target.value})}
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
                borderRadius: 2,
                fontWeight: 600
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
                borderRadius: 2,
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