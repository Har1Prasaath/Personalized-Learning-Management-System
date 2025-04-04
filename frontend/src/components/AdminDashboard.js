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
import AdminHeader from './AdminHeader';

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [admins, setAdmins] = useState([]);
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
      const adminsData = [];
      
      for (const docRef of querySnapshot.docs) {
        const userData = docRef.data();
        const progressSnapshot = await getDocs(collection(db, `users/${docRef.id}/progress`));
        const courses = progressSnapshot.docs.map(course => ({
          id: course.id,
          ...course.data()
        }));
        
        const avgScore = courses.length > 0 ? 
          courses.reduce((acc, curr) => acc + (curr.lastScore || 0), 0) / courses.length : 0;
        
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
                <TableCell align="center" sx={{ color: 'white' }}>Last Active</TableCell>
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
                    {user?.lastLogin?.toDate ? 
                      new Date(user.lastLogin.toDate()).toLocaleDateString() : 'Never'}
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
    </Box>
  );
}