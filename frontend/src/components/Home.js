import React, { useEffect, useState, useCallback, useRef } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { Button, Card, CardContent, Typography, Grid, Box, CircularProgress, Alert, List, ListItem, ListItemText } from '@mui/material';
import { keyframes } from '@emotion/react';
import Particles from 'react-tsparticles';
import { loadFull } from 'tsparticles';
import Header from './Header';

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const slideIn = keyframes`
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
`;

const slideOut = keyframes`
  from { transform: translateX(0); opacity: 1; }
  to { transform: translateX(100%); opacity: 0; }
`;

const shrinkLeft = keyframes`
  from { width: 100%; }
  to { width: 65%; }
`;

const expandLeft = keyframes`
  from { width: 65%; }
  to { width: 100%; }
`;

export default function Home() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [chapters, setChapters] = useState([]);
  const navigate = useNavigate();
  const detailsBoxRef = useRef(null);
  const coursesBoxRef = useRef(null);

  const particlesInit = useCallback(async (engine) => {
    await loadFull(engine);
  }, []);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'courses'));
        if (querySnapshot.empty) {
          setError('No courses found. Please check database initialization.');
        } else {
          setCourses(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        }
      } catch (error) {
        console.error('Error fetching courses:', error);
        setError('Failed to load courses. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const handleCourseClick = async (courseId) => {
    try {
      const chaptersSnapshot = await getDocs(collection(db, `courses/${courseId}/chapters`));
      setChapters(chaptersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setSelectedCourse(courseId);
    } catch (error) {
      console.error('Error fetching chapters:', error);
    }
  };

  const handleCloseDetails = () => {
    setSelectedCourse(null);
    setChapters([]);
  };

  // Close details box when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        detailsBoxRef.current &&
        !detailsBoxRef.current.contains(event.target) &&
        !event.target.closest('.course-card') // Prevent closing if clicking on a course card
      ) {
        handleCloseDetails();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <Box sx={{ width: '100%', minHeight: '100vh', backgroundColor: '#F8FAFC', position: 'relative', overflow: 'hidden' }}>
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
        style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}
      />

      <Header />

      <Box sx={{ 
        position: 'relative',
        zIndex: 1,
        display: 'flex',
        gap: 4,
        width: '100%',
        maxWidth: '1800px',
        mx: 'auto',
        p: 6,
        transition: 'all 0.3s ease',
      }}>
        {/* Left Box: Available Courses */}
        <Box 
          ref={coursesBoxRef}
          sx={{ 
            flex: selectedCourse ? 0.65 : 1,
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            borderRadius: 4,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            backdropFilter: 'blur(12px)',
            p: 4,
            animation: selectedCourse ? `${shrinkLeft} 0.3s ease-out` : `${expandLeft} 0.3s ease-out`,
            transition: 'all 0.3s ease',
          }}
        >
          <Typography variant="h2" sx={{ 
            mb: 4, 
            fontWeight: 700, 
            background: 'linear-gradient(45deg, #4B8EC9 30%, #FF9A8D 90%)', 
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textAlign: 'center',
            fontSize: '2.5rem'
          }}>
            Available Courses
          </Typography>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress size={40} />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          ) : (
            <Grid container spacing={4}>
              {courses.map(course => (
                <Grid item xs={12} sm={selectedCourse ? 6 : 4} key={course.id}>
                  <Card 
                    className="course-card" // Add a class to identify course cards
                    sx={{ 
                      height: '100%',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      backgroundColor: 'rgba(255, 255, 255, 0.8)',
                      borderRadius: 3,
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: '0 8px 12px rgba(0, 0, 0, 0.1)'
                      }
                    }}
                    onClick={() => handleCourseClick(course.id)}
                  >
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography variant="h5" sx={{ 
                        mb: 2, 
                        fontWeight: 600, 
                        color: 'text.primary',
                        minHeight: '64px'
                      }}>
                        {course.title}
                      </Typography>
                      <Typography variant="body2" sx={{ 
                        color: 'text.secondary', 
                        minHeight: '80px',
                        mb: 2
                      }}>
                        {course.description}
                      </Typography>
                      <Button
                        fullWidth
                        variant="contained"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/courses/${course.id}`);
                        }}
                        sx={{
                          mt: 'auto',
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
                        Start Course
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>

        {/* Right Box: Selected Course Details */}
        {selectedCourse && (
          <Box
            ref={detailsBoxRef}
            sx={{
              flex: 0.35,
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              borderRadius: 4,
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              backdropFilter: 'blur(12px)',
              p: 4,
              animation: `${slideIn} 0.3s ease-out`,
              overflowY: 'auto',
              zIndex: 2,
            }}
          >
            {courses.find(c => c.id === selectedCourse) && (
              <>
                <Typography variant="h2" sx={{ 
                  mb: 4, 
                  fontWeight: 700, 
                  background: 'linear-gradient(45deg, #4B8EC9 30%, #FF9A8D 90%)', 
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textAlign: 'center',
                  fontSize: '2.5rem'
                }}>
                  {courses.find(c => c.id === selectedCourse).title}
                </Typography>
                <Typography variant="body1" sx={{ 
                  mb: 4, 
                  color: 'text.secondary',
                  textAlign: 'center'
                }}>
                  {courses.find(c => c.id === selectedCourse).description}
                </Typography>
                
                <Typography variant="h4" sx={{ 
                  mb: 3, 
                  fontWeight: 600, 
                  color: 'text.primary',
                  textAlign: 'center'
                }}>
                  Chapters
                </Typography>
                <List>
                  {chapters.map((chapter, index) => (
                    <ListItem key={chapter.id} sx={{ 
                      backgroundColor: 'rgba(0, 0, 0, 0.05)',
                      borderRadius: 2,
                      mb: 1,
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        transform: 'translateX(5px)',
                        backgroundColor: 'rgba(0, 0, 0, 0.08)'
                      }
                    }}>
                      <ListItemText
                        primary={`Chapter ${index + 1}: ${chapter.title}`}
                        secondary={chapter.description}
                      />
                    </ListItem>
                  ))}
                </List>

                {/* Start Course Button */}
                <Button
                  fullWidth
                  variant="contained"
                  onClick={() => navigate(`/courses/${selectedCourse}`)}
                  sx={{
                    mt: 4,
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
                  Start Course
                </Button>
              </>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
}