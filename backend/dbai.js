const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function initializeData() {
  const course = {
    id: 'ai-101',
    title: 'Artificial Intelligence 101',
    description: 'Introduction to Artificial Intelligence',
    chapters: Array.from({ length: 12 }, (_, i) => ({
      id: `ai_chapter_${i + 1}`,
      title: `AI Chapter ${i + 1}`,
      description: `Deep dive into AI concepts in chapter ${i + 1}`,
      content: `This is an in-depth explanation of AI Chapter ${i + 1}. Artificial Intelligence (AI) is a vast and evolving field that aims to replicate human intelligence through machines. It involves machine learning, neural networks, deep learning, and cognitive computing. In this chapter, we explore various AI techniques, historical advancements, and real-world applications. AI is used in automation, recommendation systems, healthcare, finance, and autonomous vehicles. Despite its benefits, AI also raises ethical concerns, such as bias in algorithms and job displacement. As AI technology advances, balancing innovation with responsible implementation becomes crucial. The future of AI lies in achieving General AI, where machines can perform any intellectual task like humans.`,
      difficulty: i < 4 ? 'beginner' : i < 8 ? 'intermediate' : 'advanced',
      quiz: [
        {
          question: `What is the main focus of AI in Chapter ${i + 1}?`,
          options: ['Machine Learning', 'Automation', 'Cognitive Computing', 'All of the above'],
          correctAnswer: 3
        },
        {
          question: `Which field is a subdomain of AI discussed in Chapter ${i + 1}?`,
          options: ['Cybersecurity', 'Quantum Computing', 'Deep Learning', 'Blockchain'],
          correctAnswer: 2
        },
        {
          question: `What is one ethical concern regarding AI mentioned in Chapter ${i + 1}?`,
          options: ['Bias in algorithms', 'Faster computing', 'Increased automation', 'Better recommendations'],
          correctAnswer: 0
        },
        {
          question: `Which of the following is NOT an AI application discussed in Chapter ${i + 1}?`,
          options: ['Self-driving cars', 'Medical diagnosis', 'Stock trading', 'Cooking recipes'],
          correctAnswer: 3
        },
        {
          question: `What is the ultimate goal of AI as per Chapter ${i + 1}?`,
          options: ['Narrow AI', 'General AI', 'Supervised Learning', 'Data Analytics'],
          correctAnswer: 1
        }
      ]
    }))
  };

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

initializeData().then(() => console.log('Artificial Intelligence 101 course added successfully!'));
