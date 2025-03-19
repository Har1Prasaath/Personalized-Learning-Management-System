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
          content: 'Artificial Intelligence is the simulation of human intelligence...',
          difficulty: 'beginner',
          quiz: [
            {
              question: 'What is AI?',
              options: ['Artificial Intelligence', 'Automated Intelligence', 'Advanced Information'],
              correctAnswer: 0
            }
          ]
        },
        {
          id: 'machine_learning',
          title: 'Machine Learning Basics',
          description: 'Understanding how machines learn',
          content: 'Machine learning enables systems to learn from data...',
          difficulty: 'intermediate',
          quiz: [
            {
              question: 'Which algorithm is used for classification?',
              options: ['K-Means', 'Linear Regression', 'Decision Tree'],
              correctAnswer: 2
            }
          ]
        },
        {
          id: 'neural_networks',
          title: 'Neural Networks',
          description: 'Introduction to artificial neural networks',
          content: 'Neural networks are inspired by the human brain...',
          difficulty: 'hard',
          quiz: [
            {
              question: 'What is the activation function in a neural network?',
              options: ['Softmax', 'Gradient', 'Momentum'],
              correctAnswer: 0
            }
          ]
        }
      ]
    },
    {
      id: 'economics-101',
      title: 'Economics 101',
      description: 'Basics of Economics',
      chapters: [
        {
          id: 'demand_supply',
          title: 'Demand and Supply',
          description: 'Understanding market forces',
          content: 'Demand and supply determine market prices...',
          difficulty: 'beginner',
          quiz: [
            {
              question: 'What happens when demand increases and supply remains constant?',
              options: ['Price falls', 'Price rises', 'No change'],
              correctAnswer: 1
            }
          ]
        },
        {
          id: 'microeconomics',
          title: 'Microeconomics',
          description: 'Study of individual economic behavior',
          content: 'Microeconomics focuses on individual markets...',
          difficulty: 'intermediate',
          quiz: [
            {
              question: 'Which concept explains the satisfaction from consuming goods?',
              options: ['Utility', 'Demand', 'Elasticity'],
              correctAnswer: 0
            }
          ]
        },
        {
          id: 'macroeconomics',
          title: 'Macroeconomics',
          description: 'Study of the overall economy',
          content: 'Macroeconomics deals with national and global economies...',
          difficulty: 'hard',
          quiz: [
            {
              question: 'What is GDP?',
              options: ['Gross Domestic Product', 'Global Development Plan', 'General Debt Payment'],
              correctAnswer: 0
            }
          ]
        }
      ]
    },
    {
      id: 'history-101',
      title: 'History 101',
      description: 'Introduction to World History',
      chapters: [
        {
          id: 'ancient_civilizations',
          title: 'Ancient Civilizations',
          description: 'Exploring early human societies',
          content: 'Ancient civilizations such as Mesopotamia...',
          difficulty: 'beginner',
          quiz: [
            {
              question: 'Which civilization is known for the pyramids?',
              options: ['Roman', 'Egyptian', 'Greek'],
              correctAnswer: 1
            }
          ]
        },
        {
          id: 'world_wars',
          title: 'World Wars',
          description: 'Study of World War I and II',
          content: 'World War I began in 1914 due to political tensions...',
          difficulty: 'intermediate',
          quiz: [
            {
              question: 'Which event triggered World War I?',
              options: ['Treaty of Versailles', 'Assassination of Archduke Ferdinand', 'Pearl Harbor attack'],
              correctAnswer: 1
            }
          ]
        },
        {
          id: 'modern_history',
          title: 'Modern History',
          description: 'Post-World War II events',
          content: 'The Cold War shaped the modern political landscape...',
          difficulty: 'hard',
          quiz: [
            {
              question: 'What was the main ideological conflict during the Cold War?',
              options: ['Capitalism vs Socialism', 'Democracy vs Anarchy', 'Communism vs Fascism'],
              correctAnswer: 0
            }
          ]
        }
      ]
    },
    {
      id: 'env-sci-101',
      title: 'Environmental Science 101',
      description: 'Basics of Environmental Science',
      chapters: [
        {
          id: 'ecosystem',
          title: 'Ecosystem',
          description: 'Understanding ecosystems',
          content: 'An ecosystem consists of living and non-living components...',
          difficulty: 'beginner',
          quiz: [
            {
              question: 'What is the primary source of energy in most ecosystems?',
              options: ['Sunlight', 'Water', 'Wind'],
              correctAnswer: 0
            }
          ]
        },
        {
          id: 'pollution',
          title: 'Pollution',
          description: 'Types and effects of pollution',
          content: 'Pollution impacts air, water, and soil...',
          difficulty: 'intermediate',
          quiz: [
            {
              question: 'What is the major cause of air pollution?',
              options: ['Plant growth', 'Burning fossil fuels', 'Photosynthesis'],
              correctAnswer: 1
            }
          ]
        },
        {
          id: 'climate_change',
          title: 'Climate Change',
          description: 'Impact of human activity on climate',
          content: 'Climate change is driven by human activity...',
          difficulty: 'hard',
          quiz: [
            {
              question: 'What gas is primarily responsible for global warming?',
              options: ['Oxygen', 'Carbon Dioxide', 'Nitrogen'],
              correctAnswer: 1
            }
          ]
        }
      ]
    },
    {
      id: 'psychology-101',
      title: 'Psychology 101',
      description: 'Introduction to Psychology',
      chapters: [
        {
          id: 'human_behavior',
          title: 'Human Behavior',
          description: 'Understanding why people behave the way they do',
          content: 'Human behavior is influenced by various factors...',
          difficulty: 'beginner',
          quiz: [
            {
              question: 'Which part of the brain controls emotions?',
              options: ['Cerebellum', 'Amygdala', 'Brainstem'],
              correctAnswer: 1
            }
          ]
        },
        {
          id: 'cognitive_psychology',
          title: 'Cognitive Psychology',
          description: 'Study of mental processes',
          content: 'Cognitive psychology explores how people think...',
          difficulty: 'intermediate',
          quiz: [
            {
              question: 'Which term refers to the process of storing information?',
              options: ['Perception', 'Memory', 'Cognition'],
              correctAnswer: 1
            }
          ]
        },
        {
          id: 'social_psychology',
          title: 'Social Psychology',
          description: 'How people interact with others',
          content: 'Social psychology studies group behavior...',
          difficulty: 'hard',
          quiz: [
            {
              question: 'What is the term for adjusting behavior to match others?',
              options: ['Conformity', 'Rebellion', 'Independence'],
              correctAnswer: 0
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
