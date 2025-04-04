require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { admin, db } = require('./firebase');

const app = express();
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());

const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).send('Unauthorized');
  
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    res.status(401).send('Invalid token');
  }
};

app.post('/api/update-progress', authenticate, async (req, res) => {
  try {
    const { courseId, chapterId, score } = req.body;
    const userId = req.user.uid;

    const userProgressRef = db.collection('users').doc(userId)
      .collection('progress').doc(courseId);

    const currentProgress = (await userProgressRef.get()).data() || {};
    
    let newDifficulty = currentProgress.difficulty || 'beginner';
    if(score >= 80) newDifficulty = 'advanced';
    else if(score >= 50) newDifficulty = 'intermediate';
    else newDifficulty = 'beginner';

    await userProgressRef.set({
      lastChapter: chapterId,
      lastScore: score,
      difficulty: newDifficulty,
      scores: [...(currentProgress.scores || []), score],
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    res.status(200).json({ difficulty: newDifficulty });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.get('/api/courses/:courseId', authenticate, async (req, res) => {
  try {
    const userId = req.user.uid;
    const courseId = req.params.courseId;
    
    const progressRef = db.collection('users').doc(userId).collection('progress').doc(courseId);
    const progressDoc = await progressRef.get();
    
    const difficulty = progressDoc.exists ? 
      progressDoc.data().difficulty : 'beginner';

    const contentRef = db.collection('courses').doc(courseId)
      .collection('content').where('difficulty', '==', difficulty);
    const snapshot = await contentRef.get();
    
    const content = snapshot.docs.map(doc => doc.data());
    res.status(200).json(content);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));