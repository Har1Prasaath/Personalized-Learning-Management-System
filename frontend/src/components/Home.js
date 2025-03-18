import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { Button, Card, CardContent, Typography, Grid, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const [courses, setCourses] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourses = async () => {
      const querySnapshot = await getDocs(collection(db, 'courses'));
      setCourses(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchCourses();
  }, []);

  return (
    <Box sx={{ mt: 4, px: 2 }}>
      <Typography variant="h2" gutterBottom>Available Courses</Typography>
      <Grid container spacing={3}>
        {courses.map(course => (
          <Grid item xs={12} sm={6} md={4} key={course.id}>
            <Card>
              <CardContent>
                <Typography variant="h5">{course.title}</Typography>
                <Typography variant="body2">{course.description}</Typography>
                <Button 
                  variant="contained" 
                  sx={{ mt: 2 }}
                  onClick={() => navigate(`/courses/${course.id}`)}
                >
                  Start Course
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}