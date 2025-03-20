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
      chapters: [
        {
          id: 'ai_intro',
          title: 'Introduction to AI',
          description: 'Understanding the basics of AI',
          content: `
## What is Artificial Intelligence (AI)?
Artificial Intelligence (AI) refers to the simulation of human intelligence processes by machines, particularly computer systems. AI enables machines to perceive, reason, learn, and act autonomously. The core idea behind AI is to create systems that can mimic human thought processes and improve their performance over time without human intervention.

---

## History of AI
### 1. Ancient Times  
- Early philosophical inquiries about the nature of thought and intelligence can be traced back to ancient Greece. Philosophers like Aristotle explored the concepts of reasoning and logic.

### 2. 1950s  
- Alan Turing proposed the concept of a "universal machine" capable of performing any computation described algorithmically.  
- In 1956, the term "Artificial Intelligence" was coined by John McCarthy at the Dartmouth Conference, marking the official birth of AI as a field of study.

### 3. Modern Era  
- Rapid development in machine learning, natural language processing (NLP), and robotics during the 1990s and early 2000s.  
- Breakthroughs in neural networks and deep learning have led to practical applications like speech recognition, image processing, and autonomous vehicles.

---

## Types of AI
### 1. **Narrow AI**  
- Focused on specific tasks like voice recognition and image classification.  
- Examples: Siri, Alexa, and Google Assistant.

### 2. **General AI**  
- Hypothetical AI that can perform any intellectual task a human can do.  
- True General AI remains a theoretical concept, but advancements in machine learning and cognitive computing aim to achieve it.

### 3. **Superintelligent AI**  
- AI that surpasses human intelligence in all aspects.  
- Potential risks include loss of human control and ethical challenges.

---

## Core Areas of AI
### 1. **Machine Learning (ML)**  
- Algorithms that allow machines to learn from data and improve performance without being explicitly programmed.  
- Types of Machine Learning:
    - **Supervised Learning** – Learning from labeled data.
    - **Unsupervised Learning** – Identifying patterns in data without labels.
    - **Reinforcement Learning** – Learning based on trial and error.

### 2. **Natural Language Processing (NLP)**  
- The ability to understand and respond to human language.  
- Examples: Chatbots, language translation, and sentiment analysis.

### 3. **Computer Vision**  
- The ability to interpret and analyze visual data.  
- Examples: Facial recognition, object detection, and medical imaging.

### 4. **Robotics**  
- Designing and programming robots to perform tasks autonomously.  
- Examples: Industrial robots and autonomous vehicles.

---

## Applications of AI
### 1. **Healthcare**  
- AI-powered diagnostics, personalized medicine, and drug discovery.  
- Example: IBM Watson helps doctors diagnose diseases more accurately.

### 2. **Finance**  
- Fraud detection, algorithmic trading, and risk management.  
- Example: AI algorithms analyze stock market trends in real-time.

### 3. **Transportation**  
- Autonomous vehicles and route optimization.  
- Example: Tesla's Autopilot uses AI for self-driving cars.

### 4. **Entertainment**  
- Recommendation systems and content generation.  
- Example: Netflix and YouTube recommend content based on user behavior.

---

## Ethical and Social Challenges
### 1. Bias in Algorithms  
- AI systems can inherit biases from training data, leading to unfair decisions.  

### 2. Job Displacement  
- Automation may lead to the displacement of jobs, requiring workforce adaptation.  

### 3. Privacy and Security  
- AI systems handling sensitive data pose privacy and security risks.  

---

## Future of AI  
AI continues to evolve rapidly, with advancements in deep learning, neural networks, and cognitive computing paving the way for more sophisticated applications. The development of General AI remains a key goal, but ethical concerns and regulatory frameworks will play a crucial role in shaping AI's future impact on society.

---

`,
          difficulty: 'beginner',
          quiz: [
            {
              question: 'Who proposed the concept of a "universal machine" capable of performing any computation?',
              options: ['Alan Turing', 'John McCarthy', 'Isaac Newton'],
              correctAnswer: 0
            },
            {
              question: 'What type of AI focuses on specific tasks like voice recognition?',
              options: ['Narrow AI', 'General AI', 'Superintelligent AI'],
              correctAnswer: 0
            },
            {
              question: 'Which area of AI involves the ability to understand and respond to human language?',
              options: ['Computer Vision', 'Machine Learning', 'Natural Language Processing'],
              correctAnswer: 2
            }
          ]
        }
      ]
    }
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

initializeData().then(() => console.log('New courses added!'));
