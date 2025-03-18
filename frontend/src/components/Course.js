import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { Button, Typography, Box, Card, CardContent } from '@mui/material';

export default function Course() {
  const { courseId } = useParams();
  const [chapters, setChapters] = useState([]);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [userProgress, setUserProgress] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch chapters
        const chaptersCol = collection(db, `courses/${courseId}/chapters`);
        const chaptersSnapshot = await getDocs(chaptersCol);
        setChapters(chaptersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

        // Fetch user progress
        if (auth.currentUser) {
          const progressRef = doc(db, `users/${auth.currentUser.uid}/progress/${courseId}`);
          const progressSnap = await getDoc(progressRef);
          setUserProgress(progressSnap.exists() ? progressSnap.data() : null);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [courseId]);

  const startQuiz = async () => {
    // Implement quiz logic
  };

  return (
    <Box sx={{ mt: 4, px: 2 }}>
      {!selectedChapter ? (
        <>
          <Typography variant="h3">Chapters</Typography>
          {chapters.map(chapter => (
            <Card key={chapter.id} sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h5">{chapter.title}</Typography>
                <Typography>Difficulty: {chapter.difficulty}</Typography>
                <Button onClick={() => setSelectedChapter(chapter)}>
                  Start Chapter
                </Button>
              </CardContent>
            </Card>
          ))}
        </>
      ) : (
        <div>
          <Button onClick={() => setSelectedChapter(null)}>Back to Chapters</Button>
          <Typography variant="h2">{selectedChapter.title}</Typography>
          <Typography variant="body1">{selectedChapter.content}</Typography>
          
          <Button variant="contained" sx={{ mt: 4 }} onClick={startQuiz}>
            Start Quiz
          </Button>
        </div>
      )}
    </Box>
  );
}