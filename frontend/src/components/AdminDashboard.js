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
  Chip
} from '@mui/material';
import Header from './Header';

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
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
      
      for (const docRef of querySnapshot.docs) {
        const userData = docRef.data();
        const progressSnapshot = await getDocs(collection(db, `users/${docRef.id}/progress`));
        const courses = progressSnapshot.docs.map(course => ({
          id: course.id,
          ...course.data()
        }));
        
        const avgScore = courses.length > 0 ? 
          courses.reduce((acc, curr) => acc + (curr.lastScore || 0), 0) / courses.length : 0;
        
        usersData.push({
          id: docRef.id,
          ...userData,
          courses,
          totalCourses: courses.length,
          avgScore,
          isAdmin: userData.role === 'admin'
        });
      }
      
      setUsers(usersData);
      setLoading(false);
    };

    fetchUsers();
  }, []);

  return (
    <Box sx={{ width: '100%', minHeight: '100vh', backgroundColor: '#F8FAFC' }}>
      <Header />
      
      <Box sx={{ p: 4, mt: 8 }}>
        <Typography variant="h3" sx={{ mb: 4, fontWeight: 700, color: '#2D3748' }}>
          Admin Dashboard
        </Typography>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <CircularProgress size={60} />
          </Box>
        ) : (
          <TableContainer component={Paper} sx={{ borderRadius: 4, boxShadow: 3 }}>
            <Table>
              <TableHead sx={{ backgroundColor: '#4B8EC9' }}>
                <TableRow>
                  <TableCell sx={{ color: 'white' }}>User</TableCell>
                  <TableCell sx={{ color: 'white' }}>Role</TableCell>
                  <TableCell sx={{ color: 'white' }}>Email</TableCell>
                  <TableCell sx={{ color: 'white' }}>Courses Taken</TableCell>
                  <TableCell sx={{ color: 'white' }}>Avg. Score</TableCell>
                  <TableCell sx={{ color: 'white' }}>Last Active</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow 
                    key={user.id}
                    sx={{ 
                      backgroundColor: user.isAdmin ? 'rgba(75, 142, 201, 0.05)' : 'inherit',
                      '&:hover': { 
                        backgroundColor: user.isAdmin ? 'rgba(75, 142, 201, 0.1)' : 'rgba(0, 0, 0, 0.04)'
                      }
                    }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar src={user.photoURL} sx={{ mr: 2 }} />
                        {user.displayName || 'Anonymous'}
                      </Box>
                    </TableCell>
                    <TableCell>
                      {user.isAdmin ? (
                        <Chip label="Admin" color="primary" size="small" />
                      ) : (
                        <Chip label="User" color="default" size="small" />
                      )}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.totalCourses}</TableCell>
                    <TableCell>{user.avgScore.toFixed(1)}%</TableCell>
                    <TableCell>
                      {user?.lastLogin?.toDate ? 
                        new Date(user.lastLogin.toDate()).toLocaleDateString() : 'Never'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
    </Box>
  );
}