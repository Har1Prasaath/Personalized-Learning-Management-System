const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function initializeData() {
  const courses = [
    {
      id: 'ai-101',
      title: 'Artificial Intelligence 101',
      description: 'Introduction to Artificial Intelligence',
      chapters: Array.from({ length: 12 }, (_, i) => ({
        id: `ai_chapter_${i + 1}`,
        title: `AI Chapter ${i + 1}`,
        description: `Detailed content for AI chapter ${i + 1}`,
        content: `This is the content for AI chapter ${i + 1}. It covers essential AI concepts and applications.`,
        difficulty: i < 4 ? 'beginner' : i < 8 ? 'intermediate' : 'advanced',
        quiz: [
          {
            question: `What is AI concept discussed in Chapter ${i + 1}?`,
            options: ['Concept A', 'Concept B', 'Concept C'],
            correctAnswer: 0
          }
        ]
      }))
    },
    {
      id: 'ml-101',
      title: 'Machine Learning Basics',
      description: 'Introduction to Machine Learning',
      chapters: Array.from({ length: 12 }, (_, i) => ({
        id: `ml_chapter_${i + 1}`,
        title: `ML Chapter ${i + 1}`,
        description: `Deep dive into ML concepts in chapter ${i + 1}`,
        content: `This chapter explains various Machine Learning algorithms and their applications in Chapter ${i + 1}.`,
        difficulty: i < 4 ? 'beginner' : i < 8 ? 'intermediate' : 'advanced',
        quiz: [
          {
            question: `Which ML algorithm is discussed in Chapter ${i + 1}?`,
            options: ['Algorithm X', 'Algorithm Y', 'Algorithm Z'],
            correctAnswer: 1
          }
        ]
      }))
    },
    {
      id: 'ds-101',
      title: 'Data Structures & Algorithms',
      description: 'Fundamentals of DSA',
      chapters: Array.from({ length: 12 }, (_, i) => ({
        id: `ds_chapter_${i + 1}`,
        title: `DSA Chapter ${i + 1}`,
        description: `Understanding key Data Structures in chapter ${i + 1}`,
        content: `This chapter details stacks, queues, linked lists, trees, and sorting algorithms.`,
        difficulty: i < 4 ? 'beginner' : i < 8 ? 'intermediate' : 'advanced',
        quiz: [
          {
            question: `Which data structure is covered in Chapter ${i + 1}?`,
            options: ['Stacks', 'Queues', 'Trees'],
            correctAnswer: 2
          }
        ]
      }))
    }
    // Add 9 more courses similarly
  ];

  for (const course of courses) {
    const courseRef = db.collection('courses').doc(course.id);
    await courseRef.set({
      title: course.title,
      description: course.description
    });

    const chaptersRef = courseRef.collection('chapters');
    for (const chapter of course.chapters) {
      await chaptersRef.doc(chapter.id).set(chapter);
    }
  }
}

initializeData().then(() => console.log('12 courses with 12 chapters each added successfully!'));
