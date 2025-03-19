import React, { useEffect, useState, useCallback } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { Button, Card, CardContent, Typography, Grid, Box, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { keyframes } from '@emotion/react';
import Particles from 'react-tsparticles';
import { loadFull } from 'tsparticles';
import Header from './Header'; // Import the Header component

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

export default function Home() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const particlesInit = useCallback(async (engine) => {
    await loadFull(engine);
  }, []);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'courses'));
        setCourses(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error('Error fetching courses:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  return (
    <Box
      sx={{
        width: '100%',
        minHeight: '100vh',
        backgroundColor: '#F8FAFC',
        position: 'relative',
        overflow: 'auto', // Enable scrolling
      }}
    >
      {/* Particles Background */}
      <Particles
        id="tsparticles"
        init={particlesInit}
        options={{
          background: { 
            color: { 
              value: '#F8FAFC' 
            } 
          },
          fpsLimit: 60,
          interactivity: {
            events: {
              onHover: {
                enable: true,
                mode: 'repulse',
              },
              resize: true,
            },
            modes: {
              repulse: {
                distance: 100,
                duration: 0.4,
              },
            },
          },
          particles: {
            color: {
              value: ['#4B8EC9', '#FF9A8D', '#6C5CE7'],
            },
            links: {
              color: '#4B8EC9',
              distance: 150,
              enable: true,
              opacity: 0.4,
              width: 1,
            },
            collisions: {
              enable: true,
            },
            move: {
              direction: 'none',
              enable: true,
              outModes: {
                default: 'bounce',
              },
              random: false,
              speed: 1.5,
              straight: false,
            },
            number: {
              density: {
                enable: true,
                area: 800,
              },
              value: 40,
            },
            opacity: {
              value: 0.5,
            },
            shape: {
              type: 'circle',
            },
            size: {
              value: { min: 1, max: 3 },
            },
          },
          detectRetina: true,
        }}
        style={{
          position: 'fixed', // Fixed position for particles
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 0,
        }}
      />

      {/* Header Component */}
      <Header />

      {/* Content Container */}
      <Box
        sx={{
          position: 'relative',
          zIndex: 1,
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderRadius: 4,
          p: 4,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          backdropFilter: 'blur(12px)',
          width: '100%',
          maxWidth: '1200px',
          mx: 'auto',
          my: 4, // Add margin for spacing
          mt: 12, // Add extra margin to account for the header
        }}
      >
        <Typography 
          variant="h2" 
          sx={{ 
            mb: 4,
            fontWeight: 700,
            background: 'linear-gradient(45deg, #4B8EC9 30%, #FF9A8D 90%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textAlign: 'center'
          }}
        >
          Available Courses
        </Typography>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={40} />
          </Box>
        ) : (
          <Grid container spacing={3}>
            {courses.map(course => (
              <Grid item xs={12} sm={6} md={4} key={course.id}>
                <Card
                  sx={{
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    borderRadius: 3,
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: '0 8px 12px rgba(0, 0, 0, 0.1)'
                    }
                  }}
                >
                  <CardContent>
                    <Typography 
                      variant="h5" 
                      sx={{ 
                        mb: 2,
                        fontWeight: 600,
                        color: 'text.primary'
                      }}
                    >
                      {course.title}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: 'text.secondary',
                        minHeight: '60px'
                      }}
                    >
                      {course.description}
                    </Typography>
                    <Button
                      fullWidth
                      variant="contained"
                      sx={{
                        mt: 3,
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
                      onClick={() => navigate(`/courses/${course.id}`)}
                    >
                      Start Course
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Box>
  );
}