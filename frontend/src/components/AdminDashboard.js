import React, { useEffect, useState } from 'react';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  CircularProgress, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Avatar,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  Divider,
  LinearProgress
} from '@mui/material';
import AdminHeader from './AdminHeader';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AssessmentIcon from '@mui/icons-material/Assessment';

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [progressDialogOpen, setProgressDialogOpen] = useState(false);
  const [userProgress, setUserProgress] = useState(null);
  const [loadingProgress, setLoadingProgress] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const verifyAdmin = async () => {
      if (!auth.currentUser) {
        navigate('/');
        return;
      }
      
      const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
      if (!userDoc.exists() || userDoc.data().role !== 'admin') {
        navigate('/');
      }
    };
    verifyAdmin();
  }, [navigate]);

  useEffect(() => {
    const fetchUsers = async () => {
      const querySnapshot = await getDocs(collection(db, 'users'));
      const usersData = [];
      const adminsData = [];
      
      for (const docRef of querySnapshot.docs) {
        const userData = docRef.data();
        const progressSnapshot = await getDocs(collection(db, `users/${docRef.id}/progress`));
        const courses = progressSnapshot.docs.map(course => ({
          id: course.id,
          ...course.data()
        }));
        
        // Use the globalAvgScore if available, otherwise calculate from courses
        let avgScore = userData.globalAvgScore;
        
        // If globalAvgScore is not available, use the avgScore from courses instead of lastScore
        if (avgScore === undefined) {
          const coursesWithScores = courses.filter(course => course.avgScore !== undefined);
          avgScore = coursesWithScores.length > 0 ? 
            coursesWithScores.reduce((acc, curr) => acc + (curr.avgScore || 0), 0) / coursesWithScores.length : 0;
        }
        
        const userWithStats = {
          id: docRef.id,
          ...userData,
          courses,
          totalCourses: courses.length,
          avgScore,
          isAdmin: userData.role === 'admin'
        };
        
        // Separate users and admins
        if (userData.role === 'admin') {
          adminsData.push(userWithStats);
        } else {
          usersData.push(userWithStats);
        }
      }
      
      setUsers(usersData);
      setAdmins(adminsData);
      setLoading(false);
    };

    fetchUsers();
  }, []);

  const handleViewProgress = async (user) => {
    setSelectedUser(user);
    setLoadingProgress(true);
    setProgressDialogOpen(true);
    
    try {
      // Fetch detailed chapter progress for each course
      const userProgressData = [];
      
      for (const course of user.courses) {
        const chaptersSnapshot = await getDocs(
          collection(db, `users/${user.id}/progress/${course.id}/chapters`)
        );
        
        const chaptersData = chaptersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        userProgressData.push({
          courseId: course.id,
          courseName: course.id.replace(/-/g, ' ').toUpperCase(),
          avgScore: course.avgScore || 0,
          chapters: chaptersData
        });
      }
      
      setUserProgress(userProgressData);
    } catch (error) {
      console.error("Error fetching user progress:", error);
    } finally {
      setLoadingProgress(false);
    }
  };

  const handleCloseProgressDialog = () => {
    setProgressDialogOpen(false);
    setSelectedUser(null);
    setUserProgress(null);
  };

  // Shared table rendering function
  const renderTable = (data, title) => {
    const isAdminTable = title === 'Admins';
    
    return (
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 600, color: '#2D3748' }}>
          {title}
        </Typography>
        <TableContainer component={Paper} sx={{ borderRadius: 4, boxShadow: 3 }}>
          <Table>
            <TableHead sx={{ backgroundColor: isAdminTable ? '#2C3E50' : '#4B8EC9' }}>
              <TableRow>
                <TableCell align="center" sx={{ color: 'white' }}>Name</TableCell>
                <TableCell align="center" sx={{ color: 'white' }}>Role</TableCell>
                <TableCell align="center" sx={{ color: 'white' }}>Email</TableCell>
                {!isAdminTable && (
                  <>
                    <TableCell align="center" sx={{ color: 'white' }}>Courses Taken</TableCell>
                    <TableCell align="center" sx={{ color: 'white' }}>Avg. Score</TableCell>
                  </>
                )}
                <TableCell align="center" sx={{ color: 'white' }}>
                  {isAdminTable ? 'Last Active' : 'Actions'}
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((user) => (
                <TableRow 
                  key={user.id}
                  sx={{ 
                    backgroundColor: user.isAdmin ? 'rgba(75, 142, 201, 0.05)' : 'inherit',
                    '&:hover': { 
                      backgroundColor: user.isAdmin ? 'rgba(75, 142, 201, 0.1)' : 'rgba(0, 0, 0, 0.04)'
                    }
                  }}
                >
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Avatar src={user.photoURL} sx={{ mr: 2 }} />
                      {user.displayName || 'Anonymous'}
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    {user.isAdmin ? (
                      <Chip label="Admin" color="primary" size="small" />
                    ) : (
                      <Chip label="User" color="default" size="small" />
                    )}
                  </TableCell>
                  <TableCell align="center">{user.email}</TableCell>
                  {!isAdminTable && (
                    <>
                      <TableCell align="center">{user.totalCourses}</TableCell>
                      <TableCell align="center">{user.avgScore.toFixed(1)}%</TableCell>
                    </>
                  )}
                  <TableCell align="center">
                    {isAdminTable ? (
                      user?.lastLogin?.toDate ? 
                        new Date(user.lastLogin.toDate()).toLocaleDateString() : 'Never'
                    ) : (
                      <Button 
                        variant="contained" 
                        color="primary" 
                        size="small"
                        startIcon={<AssessmentIcon />}
                        onClick={() => handleViewProgress(user)}
                        disabled={user.totalCourses === 0}
                        sx={{
                          borderRadius: 2,
                          textTransform: 'none',
                          boxShadow: 2
                        }}
                      >
                        View Progress
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {data.length === 0 && (
                <TableRow>
                  <TableCell colSpan={isAdminTable ? 4 : 6} align="center" sx={{ py: 3 }}>
                    No {title.toLowerCase()} found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'error';
  };

  return (
    <Box sx={{ width: '100%', minHeight: '100vh', backgroundColor: '#F8FAFC' }}>
      <AdminHeader />
      
      <Box sx={{ p: 4, mt: 8 }}>
        <Typography variant="h3" sx={{ mb: 4, fontWeight: 700, color: '#2D3748' }}>
          Admin Dashboard
        </Typography>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <CircularProgress size={60} />
          </Box>
        ) : (
          <>
            {renderTable(users, 'Users')}
            {renderTable(admins, 'Admins')}
          </>
        )}
      </Box>

      {/* User Progress Dialog */}
      <Dialog 
        open={progressDialogOpen} 
        onClose={handleCloseProgressDialog}
        fullWidth
        maxWidth="md"
        PaperProps={{
          sx: {
            borderRadius: 2,
            maxHeight: '90vh'
          }
        }}
      >
        <DialogTitle sx={{ 
          bgcolor: '#4B8EC9', 
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <AssessmentIcon />
          User Learning Progress: {selectedUser?.displayName || 'User'}
        </DialogTitle>
        <DialogContent dividers sx={{ p: 2 }}>
          {loadingProgress ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress size={40} />
            </Box>
          ) : userProgress && userProgress.length > 0 ? (
            <Box>
              {userProgress.map((course) => (
                <Accordion key={course.courseId} defaultExpanded sx={{ mb: 2, borderRadius: 1 }}>
                  <AccordionSummary 
                    expandIcon={<ExpandMoreIcon />}
                    sx={{ 
                      bgcolor: 'rgba(75, 142, 201, 0.08)', 
                      borderBottom: '1px solid rgba(0, 0, 0, 0.12)' 
                    }}
                  >
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between', 
                      width: '100%',
                      pr: 2 
                    }}>
                      <Typography variant="h6">{course.courseName}</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Chip 
                          label={`Average: ${course.avgScore.toFixed(1)}%`} 
                          color={getScoreColor(course.avgScore)}
                          size="small" 
                          sx={{ fontWeight: 'bold' }}
                        />
                        <Chip 
                          label={`${course.chapters.length} Chapters`} 
                          variant="outlined" 
                          size="small" 
                        />
                      </Box>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails sx={{ p: 0 }}>
                    <List disablePadding>
                      {course.chapters.length > 0 ? (
                        course.chapters.map((chapter, index) => (
                          <Box key={chapter.id}>
                            <ListItem sx={{ py: 2, px: 3 }}>
                              <Box sx={{ width: '100%' }}>
                                <Box sx={{ 
                                  display: 'flex', 
                                  justifyContent: 'space-between', 
                                  alignItems: 'center',
                                  mb: 1
                                }}>
                                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                    Chapter {index + 1}: {chapter.id.replace(/_/g, ' ')}
                                  </Typography>
                                  <Chip 
                                    label={`Avg: ${chapter.avgScore ? chapter.avgScore.toFixed(1) : 0}%`}
                                    color={getScoreColor(chapter.avgScore || 0)}
                                    size="small"
                                  />
                                </Box>
                                
                                <LinearProgress
                                  variant="determinate"
                                  value={chapter.avgScore || 0}
                                  color={getScoreColor(chapter.avgScore || 0)}
                                  sx={{ height: 6, borderRadius: 3, mb: 2 }}
                                />
                                
                                {chapter.scores && chapter.scores.length > 0 ? (
                                  <>
                                    <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                                      Quiz Attempts:
                                    </Typography>
                                    <Box sx={{ 
                                      display: 'flex', 
                                      flexWrap: 'wrap', 
                                      gap: 1,
                                      mb: 1
                                    }}>
                                      {chapter.scores.map((score, i) => (
                                        <Chip
                                          key={i}
                                          label={`Attempt ${i+1}: ${score}%`}
                                          variant="outlined"
                                          size="small"
                                          color={getScoreColor(score)}
                                        />
                                      ))}
                                    </Box>
                                  </>
                                ) : (
                                  <Typography variant="body2" color="text.secondary">
                                    No quiz attempts yet
                                  </Typography>
                                )}
                              </Box>
                            </ListItem>
                            {index < course.chapters.length - 1 && <Divider />}
                          </Box>
                        ))
                      ) : (
                        <ListItem>
                          <ListItemText primary="No chapters completed yet" />
                        </ListItem>
                      )}
                    </List>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Box>
          ) : (
            <Typography variant="body1" sx={{ p: 2, textAlign: 'center' }}>
              No progress data available for this user.
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={handleCloseProgressDialog} 
            variant="contained"
            sx={{ borderRadius: 2, textTransform: 'none' }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}