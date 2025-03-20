import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { 
  Button, 
  Typography, 
  Box, 
  Card, 
  CardContent, 
  CircularProgress, 
  Grid 
} from '@mui/material';
import { keyframes } from '@emotion/react';
import Particles from 'react-tsparticles';
import { loadFull } from 'tsparticles';

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

export default function Course() {
  const { courseId } = useParams();
  const [chapters, setChapters] = useState([]);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [userProgress, setUserProgress] = useState(null);
  const [loading, setLoading] = useState(true);

  const particlesInit = useCallback(async (engine) => {
    await loadFull(engine);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const chaptersCol = collection(db, `courses/${courseId}/chapters`);
        const chaptersSnapshot = await getDocs(chaptersCol);
        setChapters(chaptersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

        if (auth.currentUser) {
          const progressRef = doc(db, `users/${auth.currentUser.uid}/progress/${courseId}`);
          const progressSnap = await getDoc(progressRef);
          setUserProgress(progressSnap.exists() ? progressSnap.data() : null);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [courseId]);

  const startQuiz = async () => {
    // Implement quiz logic
  };

  return (
    <Box sx={{ 
      width: '100%',
      minHeight: '100vh',
      backgroundColor: '#F8FAFC',
      position: 'relative',
      overflow: 'auto'
    }}>
      {/* Particles Background */}
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
            links: {
              color: '#4B8EC9',
              distance: 150,
              enable: true,
              opacity: 0.4,
              width: 1,
            },
            collisions: { enable: true },
            move: {
              direction: 'none',
              enable: true,
              outModes: { default: 'bounce' },
              speed: 1.5,
            },
            number: { density: { enable: true, area: 800 }, value: 40 },
            opacity: { value: 0.5 },
            shape: { type: 'circle' },
            size: { value: { min: 1, max: 3 } },
          },
          detectRetina: true,
        }}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 0,
        }}
      />

      <Box sx={{ 
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
        my: 4,
        mt: 12
      }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={40} />
          </Box>
        ) : !selectedChapter ? (
          <>
            <Typography variant="h2" sx={{ 
              mb: 4,
              fontWeight: 700,
              background: 'linear-gradient(45deg, #4B8EC9 30%, #FF9A8D 90%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textAlign: 'center'
            }}>
              Course Chapters
            </Typography>
            <Grid container spacing={3}>
              {chapters.map(chapter => (
                <Grid item xs={12} sm={6} md={4} key={chapter.id}>
                  <Card sx={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    borderRadius: 3,
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: '0 8px 12px rgba(0, 0, 0, 0.1)'
                    }
                  }}>
                    <CardContent>
                      <Typography variant="h5" sx={{ mb: 1, fontWeight: 600 }}>
                        {chapter.title}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                        Difficulty: {chapter.difficulty}
                      </Typography>
                      <Button
                        fullWidth
                        variant="contained"
                        sx={{
                          py: 1,
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
                        onClick={() => setSelectedChapter(chapter)}
                      >
                        Start Chapter
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </>
        ) : (
          <Box>
            <Button
              variant="contained"
              sx={{
                mb: 4,
                borderRadius: 2,
                fontWeight: 600,
                background: 'linear-gradient(45deg, #4B8EC9 30%, #FF9A8D 90%)',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                '&:hover': { boxShadow: '0 6px 8px rgba(0, 0, 0, 0.2)' }
              }}
              onClick={() => setSelectedChapter(null)}
            >
              Back to Chapters
            </Button>

            <Typography variant="h2" sx={{ 
              mb: 3,
              fontWeight: 700,
              background: 'linear-gradient(45deg, #4B8EC9 30%, #FF9A8D 90%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              {selectedChapter.title}
            </Typography>

            <Card sx={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              borderRadius: 3,
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
              p: 3,
              mb: 4
            }}>
              <Typography variant="body1" sx={{ 
                fontSize: '1.1rem',
                lineHeight: 1.7,
                color: 'text.primary'
              }}>
                {selectedChapter.content}
              </Typography>
            </Card>

            <Button
              fullWidth
              variant="contained"
              size="large"
              sx={{
                py: 1.5,
                borderRadius: 2,
                fontWeight: 700,
                fontSize: '1.1rem',
                background: 'linear-gradient(45deg, #4B8EC9 30%, #FF9A8D 90%)',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  animation: `${pulse} 1s infinite`,
                  boxShadow: '0 6px 8px rgba(0, 0, 0, 0.2)'
                }
              }}
              onClick={startQuiz}
            >
              Start Quiz
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  );
}