import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { 
  Button, 
  Typography, 
  Box, 
  Card, 
  CardContent, 
  CircularProgress, 
  Grid, 
  List, 
  ListItem, 
  ListItemText, 
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Paper,
  LinearProgress,
  Chip,
  Divider
} from '@mui/material';
import { keyframes } from '@emotion/react';
import Particles from 'react-tsparticles';
import { loadFull } from 'tsparticles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useLoading } from '../context/LoadingContext';

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

export default function Course() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quizOpen, setQuizOpen] = useState(false);
  const [currentQuizQuestion, setCurrentQuizQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [quizResult, setQuizResult] = useState(null);
  const [quizHistory, setQuizHistory] = useState([]);
  const { setIsLoading } = useLoading();

  const particlesInit = useCallback(async (engine) => {
    await loadFull(engine);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (!auth.currentUser) {
          navigate('/');
          return;
        }
        
        // Fetch course data
        const courseDoc = await getDoc(doc(db, 'courses', courseId));
        if (!courseDoc.exists()) {
          throw new Error('Course not found');
        }
        setCourse({
          id: courseDoc.id,
          ...courseDoc.data()
        });

        // Fetch chapters
        const chaptersCol = collection(db, `courses/${courseId}/chapters`);
        const chaptersSnapshot = await getDocs(chaptersCol);
        const chaptersData = chaptersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setChapters(chaptersData);

        // Fetch user progress
        const userProgressRef = doc(db, `users/${auth.currentUser.uid}/progress/${courseId}`);
        const progressDoc = await getDoc(userProgressRef);
        
        if (progressDoc.exists()) {
          const progressData = progressDoc.data();
          // Update chapters with progress data
          setChapters(prevChapters => 
            prevChapters.map(chapter => ({
              ...chapter,
              completed: !!progressData.chapterScores?.[chapter.id],
              avgScore: progressData.chapterScores?.[chapter.id]?.length > 0 ? 
                progressData.chapterScores[chapter.id].reduce((a, b) => a + b, 0) / 
                progressData.chapterScores[chapter.id].length : 0,
              scoreHistory: progressData.chapterScores?.[chapter.id] || []
            }))
          );
        }

      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [courseId, navigate]);

  const handleSelectChapter = (chapter) => {
    setSelectedChapter(chapter);
    setQuizHistory(chapter.scoreHistory || []);
  };

  const handleOpenQuiz = () => {
    setAnswers({});
    setCurrentQuizQuestion(0);
    setQuizResult(null);
    setQuizOpen(true);
  };

  const handleCloseQuiz = () => {
    setQuizOpen(false);
  };

  const handleAnswerChange = (e) => {
    setAnswers({
      ...answers,
      [currentQuizQuestion]: parseInt(e.target.value)
    });
  };

  const handleNextQuestion = () => {
    if (selectedChapter?.quiz && currentQuizQuestion < selectedChapter.quiz.length - 1) {
      setCurrentQuizQuestion(currentQuizQuestion + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuizQuestion > 0) {
      setCurrentQuizQuestion(currentQuizQuestion - 1);
    }
  };

  const calculateScore = () => {
    if (!selectedChapter?.quiz) return 0;
    
    let correct = 0;
    for (let i = 0; i < selectedChapter.quiz.length; i++) {
      if (answers[i] === selectedChapter.quiz[i].correctAnswer) {
        correct++;
      }
    }
    return Math.round((correct / selectedChapter.quiz.length) * 100);
  };

  const handleSubmitQuiz = async () => {
    setIsLoading(true);
    const score = calculateScore();

    try {
      const token = await auth.currentUser.getIdToken();
      const response = await fetch('https://personalized-learning-management-system.onrender.com/api/update-progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          courseId,
          chapterId: selectedChapter.id,
          score
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update progress');
      }

      const data = await response.json();
      setQuizResult(score);
      setQuizHistory(prev => [...prev, score]);
      
      // Update local chapters state
      setChapters(prevChapters => 
        prevChapters.map(chapter => 
          chapter.id === selectedChapter.id
            ? {
                ...chapter,
                completed: true,
                avgScore: [...(chapter.scoreHistory || []), score].reduce((a, b) => a + b, 0) / 
                          ([...(chapter.scoreHistory || []), score].length),
                scoreHistory: [...(chapter.scoreHistory || []), score]
              }
            : chapter
        )
      );

    } catch (error) {
      console.error('Error submitting quiz:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Render loading state
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  // Render course not found
  if (!course) {
    return (
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Typography variant="h4">Course not found</Typography>
        <Button onClick={() => navigate('/home')} sx={{ mt: 2 }}>
          Back to Home
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', minHeight: '100vh', backgroundColor: '#F8FAFC', position: 'relative', overflow: 'auto', pt: 8 }}>
      <Particles id="tsparticles" init={particlesInit} options={{ background: { color: { value: '#F8FAFC' } }, fpsLimit: 60, interactivity: { events: { onHover: { enable: true, mode: 'repulse' }, resize: true }, modes: { repulse: { distance: 100, duration: 0.4 } } }, particles: { color: { value: ['#4B8EC9', '#FF9A8D', '#6C5CE7'] }, links: { color: '#4B8EC9', distance: 150, enable: true, opacity: 0.4, width: 1 }, collisions: { enable: true }, move: { direction: 'none', enable: true, outModes: { default: 'bounce' }, speed: 1.5 }, number: { density: { enable: true, area: 800 }, value: 40 }, opacity: { value: 0.5 }, shape: { type: 'circle' }, size: { value: { min: 1, max: 3 } } }, detectRetina: true }} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }} />

      <Box sx={{ position: 'relative', zIndex: 1, backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: 4, p: 4, boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)', backdropFilter: 'blur(12px)', width: '100%', maxWidth: '1800px', mx: 'auto', my: 4 }}>
        {!selectedChapter ? (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 4, position: 'relative' }}>
              <ArrowBackIcon sx={{ cursor: 'pointer', position: 'absolute', left: 0, color: '#4B8EC9', '&:hover': { color: '#FF9A8D', transform: 'scale(1.1)', transition: 'all 0.3s ease' } }} onClick={() => navigate('/home')} />
              <Typography variant="h2" sx={{ fontWeight: 700, background: 'linear-gradient(45deg, #4B8EC9 30%, #FF9A8D 90%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontSize: '2.5rem', textAlign: 'center' }}>
                {course.title}
              </Typography>
            </Box>

            <Typography variant="body1" sx={{ textAlign: 'center', mb: 4, maxWidth: '800px', mx: 'auto' }}>
              {course.description}
            </Typography>

            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
              <Chip
                label={`Difficulty: ${course.difficulty?.toUpperCase() || 'BEGINNER'}`}
                sx={{
                  backgroundColor: course.difficulty === 'advanced' ? '#4CAF50' : 
                                  course.difficulty === 'intermediate' ? '#FF9800' : '#4B8EC9',
                  color: 'white',
                  fontWeight: 'bold',
                  px: 2,
                  py: 2.5
                }}
              />
            </Box>

            <Grid container spacing={3}>
              {chapters.map((chapter, index) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={chapter.id}>
                  <Card sx={{ 
                    backgroundColor: chapter.completed ? 'rgba(225, 245, 254, 0.9)' : 'rgba(255, 255, 255, 0.8)', 
                    borderRadius: 3, 
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)', 
                    transition: 'all 0.3s ease',
                    border: chapter.completed ? '1px solid #4B8EC9' : 'none',
                    position: 'relative',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    '&:hover': { 
                      transform: 'translateY(-5px)', 
                      boxShadow: '0 8px 12px rgba(0, 0, 0, 0.1)' 
                    } 
                  }}>
                    {chapter.completed && (
                      <Box sx={{ 
                        position: 'absolute', 
                        top: 10, 
                        right: 10, 
                        backgroundColor: '#4B8EC9',
                        color: 'white',
                        borderRadius: '50%',
                        width: 24,
                        height: 24,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold',
                        fontSize: '0.75rem'
                      }}>
                        ✓
                      </Box>
                    )}
                    <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                      <Typography variant="h5" sx={{ mb: 1, fontWeight: 600 }}> 
                        Chapter {index + 1}: {chapter.title} 
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}> 
                        {chapter.description}
                      </Typography>
                      
                      {chapter.completed && (
                        <Box sx={{ mt: 'auto', mb: 2 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                            Average Score: {Math.round(chapter.avgScore)}%
                          </Typography>
                          <LinearProgress 
                            variant="determinate" 
                            value={chapter.avgScore} 
                            sx={{ 
                              height: 6, 
                              borderRadius: 3,
                              bgcolor: 'rgba(0,0,0,0.1)',
                              '& .MuiLinearProgress-bar': {
                                bgcolor: chapter.avgScore > 80 ? '#4CAF50' : 
                                        chapter.avgScore > 60 ? '#FF9800' : '#F44336'
                              }
                            }} 
                          />
                        </Box>
                      )}
                      
                      <Button 
                        fullWidth 
                        variant="contained" 
                        sx={{ 
                          mt: 'auto',
                          py: 1, 
                          borderRadius: 2, 
                          fontWeight: 600, 
                          background: chapter.completed ? 
                            'linear-gradient(45deg, #4CAF50 30%, #8BC34A 90%)' :
                            'linear-gradient(45deg, #4B8EC9 30%, #FF9A8D 90%)', 
                          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', 
                          transition: 'all 0.3s ease', 
                          '&:hover': { 
                            animation: `${pulse} 1s infinite`, 
                            boxShadow: '0 6px 8px rgba(0, 0, 0, 0.2)' 
                          } 
                        }} 
                        onClick={() => handleSelectChapter(chapter)}
                      > 
                        {chapter.completed ? 'Review Chapter' : 'Start Chapter'}
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </>
        ) : (
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 4, position: 'relative' }}>
              <ArrowBackIcon sx={{ cursor: 'pointer', position: 'absolute', left: 0, color: '#4B8EC9', '&:hover': { color: '#FF9A8D', transform: 'scale(1.1)', transition: 'all 0.3s ease' } }} onClick={() => setSelectedChapter(null)} />
              <Typography variant="h2" sx={{ fontWeight: 700, background: 'linear-gradient(45deg, #4B8EC9 30%, #FF9A8D 90%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontSize: '2.5rem', textAlign: 'center' }}>
                {selectedChapter.title}
              </Typography>
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={12} md={9}>
                <Card sx={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: 3, boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)', p: 3, mb: 4 }}>
                  <Typography variant="body1" dangerouslySetInnerHTML={{ __html: selectedChapter.content.replace(/\n/g, '<br>') }} sx={{ fontSize: '1.1rem', lineHeight: 1.7, color: 'text.primary' }} />
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
                  onClick={handleOpenQuiz}
                >
                  Start Quiz
                </Button>
              </Grid>
              
              <Grid item xs={12} md={3}>
                <Paper elevation={3} sx={{ p: 3, borderRadius: 3, bgcolor: 'rgba(255, 255, 255, 0.9)' }}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    Quiz History
                  </Typography>
                  
                  {quizHistory.length > 0 ? (
                    <>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" sx={{ mb: 0.5 }}>
                          Average Score: {Math.round(quizHistory.reduce((a, b) => a + b, 0) / quizHistory.length)}%
                        </Typography>
                        <LinearProgress 
                          variant="determinate" 
                          value={quizHistory.reduce((a, b) => a + b, 0) / quizHistory.length} 
                          sx={{ 
                            height: 8, 
                            borderRadius: 4,
                            bgcolor: 'rgba(0,0,0,0.1)',
                            '& .MuiLinearProgress-bar': {
                              bgcolor: quizHistory.reduce((a, b) => a + b, 0) / quizHistory.length > 80 ? '#4CAF50' : 
                                     quizHistory.reduce((a, b) => a + b, 0) / quizHistory.length > 60 ? '#FF9800' : '#F44336'
                            }
                          }}
                        />
                      </Box>
                      
                      <Divider sx={{ my: 2 }} />
                      
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        Previous Attempts:
                      </Typography>
                      
                      <List dense sx={{ maxHeight: 200, overflow: 'auto' }}>
                        {quizHistory.map((score, index) => (
                          <ListItem key={index} sx={{ py: 0.5 }}>
                            <ListItemText 
                              primary={`Attempt ${index + 1}: ${score}%`} 
                              primaryTypographyProps={{
                                fontWeight: index === quizHistory.length - 1 ? 600 : 400,
                                color: score > 80 ? '#4CAF50' : 
                                       score > 60 ? '#FF9800' : '#F44336'
                              }}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No quiz attempts yet. Take the quiz to see your progress!
                    </Typography>
                  )}
                </Paper>
              </Grid>
            </Grid>
          </Box>
        )}
      </Box>

      {/* Quiz Dialog */}
      <Dialog open={quizOpen} onClose={handleCloseQuiz} fullWidth maxWidth="md">
        <DialogTitle sx={{ 
          background: 'linear-gradient(45deg, #4B8EC9 30%, #FF9A8D 90%)',
          color: 'white',
          fontWeight: 700
        }}>
          {quizResult !== null ? 'Quiz Results' : `Question ${currentQuizQuestion + 1} of ${selectedChapter?.quiz?.length || 0}`}
        </DialogTitle>
        <DialogContent sx={{ py: 3 }}>
          {quizResult !== null ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h4" sx={{ mb: 2, fontWeight: 700 }}>
                Your Score: {quizResult}%
              </Typography>
              
              <LinearProgress 
                variant="determinate" 
                value={quizResult} 
                sx={{ 
                  height: 10, 
                  borderRadius: 5,
                  my: 2,
                  '& .MuiLinearProgress-bar': {
                    bgcolor: quizResult > 80 ? '#4CAF50' : 
                           quizResult > 60 ? '#FF9800' : '#F44336'
                  }
                }}
              />
              
              <Typography variant="h6" sx={{ mt: 2, color: 'text.secondary' }}>
                {quizResult > 80 ? 'Excellent job! You\'ve mastered this chapter.' : 
                 quizResult > 60 ? 'Good work! Keep practicing to improve.' : 
                 'Keep learning! Review the chapter and try again.'}
              </Typography>
            </Box>
          ) : selectedChapter?.quiz?.[currentQuizQuestion] ? (
            <Box sx={{ py: 2 }}>
              <Typography variant="h6" sx={{ mb: 3 }}>
                {selectedChapter.quiz[currentQuizQuestion].question}
              </Typography>
              
              <FormControl component="fieldset" sx={{ width: '100%' }}>
                <RadioGroup
                  value={answers[currentQuizQuestion] !== undefined ? answers[currentQuizQuestion].toString() : ''}
                  onChange={handleAnswerChange}
                >
                  {selectedChapter.quiz[currentQuizQuestion].options.map((option, index) => (
                    <FormControlLabel
                      key={index}
                      value={index.toString()}
                      control={<Radio />}
                      label={option}
                      sx={{
                        mb: 1,
                        p: 1,
                        borderRadius: 2,
                        '&:hover': { bgcolor: 'rgba(75, 142, 201, 0.08)' }
                      }}
                    />
                  ))}
                </RadioGroup>
              </FormControl>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4, mb: 1 }}>
                <Button
                  variant="outlined"
                  onClick={handlePrevQuestion}
                  disabled={currentQuizQuestion === 0}
                >
                  Previous
                </Button>
                
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {Array.from({ length: selectedChapter.quiz.length }).map((_, index) => (
                    <Box
                      key={index}
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        bgcolor: index === currentQuizQuestion ? '#4B8EC9' : 
                               answers[index] !== undefined ? 'rgba(75, 142, 201, 0.5)' : 'rgba(0, 0, 0, 0.2)'
                      }}
                    />
                  ))}
                </Box>
                
                {currentQuizQuestion < selectedChapter.quiz.length - 1 ? (
                  <Button
                    variant="contained"
                    onClick={handleNextQuestion}
                    sx={{ 
                      bgcolor: '#4B8EC9',
                      '&:hover': { bgcolor: '#3d79ae' }
                    }}
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    onClick={handleSubmitQuiz}
                    disabled={Object.keys(answers).length < selectedChapter.quiz.length}
                    sx={{ 
                      bgcolor: '#4CAF50',
                      '&:hover': { bgcolor: '#3d8b40' }
                    }}
                  >
                    Submit
                  </Button>
                )}
              </Box>
            </Box>
          ) : (
            <Typography>No quiz questions available for this chapter.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseQuiz} sx={{ color: '#4B8EC9' }}>
            {quizResult !== null ? 'Close' : 'Cancel Quiz'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}