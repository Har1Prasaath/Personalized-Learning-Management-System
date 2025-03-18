const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function initializeData() {
  const courses = [
    {
      id: 'math-101',
      title: 'Mathematics 101',
      description: 'Introductory mathematics course',
      chapters: [
        {
          id: 'algebra_intro',
          title: 'Introduction to Algebra',
          description: 'Basic algebraic concepts',
          content: 'Algebra is the branch of mathematics...',
          difficulty: 'beginner',
          quiz: [
            {
              question: 'Solve 2x + 5 = 15',
              options: ['5', '7', '10'],
              correctAnswer: 0
            }
          ]
        },
        {
          id: 'calculus_basics',
          title: 'Basics of Calculus',
          description: 'Introduction to derivatives and integrals',
          content: 'Calculus is the study of change...',
          difficulty: 'intermediate',
          quiz: [
            {
              question: 'What is the derivative of x²?',
              options: ['2x', 'x', 'x²'],
              correctAnswer: 0
            }
          ]
        },
        {
          id: 'linear_algebra',
          title: 'Linear Algebra',
          description: 'Introduction to vector spaces and matrices',
          content: 'Linear algebra studies vector spaces...',
          difficulty: 'hard',
          quiz: [
            {
              question: 'Find the determinant of [[1,2],[3,4]]',
              options: ['-2', '2', '4'],
              correctAnswer: 0
            }
          ]
        }
      ]
    },
    {
      id: 'physics-101',
      title: 'Physics 101',
      description: 'Basic physics concepts',
      chapters: [
        {
          id: 'motion_intro',
          title: 'Introduction to Motion',
          description: 'Understanding displacement, velocity, and acceleration',
          content: 'Motion describes how objects move...',
          difficulty: 'beginner',
          quiz: [
            {
              question: 'What is the SI unit of velocity?',
              options: ['m/s', 'km/h', 'm'],
              correctAnswer: 0
            }
          ]
        },
        {
          id: 'newtons_laws',
          title: "Newton's Laws of Motion",
          description: 'Understanding the three laws of motion',
          content: "Newton's laws describe the relationship...",
          difficulty: 'intermediate',
          quiz: [
            {
              question: 'Which law states that F = ma?',
              options: ['First Law', 'Second Law', 'Third Law'],
              correctAnswer: 1
            }
          ]
        },
        {
          id: 'thermodynamics',
          title: 'Thermodynamics',
          description: 'Study of heat and energy transfer',
          content: 'Thermodynamics explores heat and work...',
          difficulty: 'hard',
          quiz: [
            {
              question: 'What is the first law of thermodynamics?',
              options: ['Conservation of energy', 'Entropy increases', 'PV = nRT'],
              correctAnswer: 0
            }
          ]
        }
      ]
    },
    {
      id: 'chemistry-101',
      title: 'Chemistry 101',
      description: 'Fundamentals of chemistry',
      chapters: [
        {
          id: 'atomic_structure',
          title: 'Atomic Structure',
          description: 'Understanding protons, neutrons, and electrons',
          content: 'Atoms are the building blocks of matter...',
          difficulty: 'beginner',
          quiz: [
            {
              question: 'What is the charge of an electron?',
              options: ['Positive', 'Negative', 'Neutral'],
              correctAnswer: 1
            }
          ]
        },
        {
          id: 'periodic_table',
          title: 'Periodic Table',
          description: 'Learning about elements and their properties',
          content: 'The periodic table organizes elements...',
          difficulty: 'intermediate',
          quiz: [
            {
              question: 'What is the atomic number of carbon?',
              options: ['6', '12', '14'],
              correctAnswer: 0
            }
          ]
        },
        {
          id: 'chemical_bonding',
          title: 'Chemical Bonding',
          description: 'Understanding ionic and covalent bonds',
          content: 'Atoms form bonds to achieve stability...',
          difficulty: 'hard',
          quiz: [
            {
              question: 'What type of bond involves the sharing of electrons?',
              options: ['Ionic', 'Covalent', 'Metallic'],
              correctAnswer: 1
            }
          ]
        }
      ]
    },
    {
      id: 'computer-101',
      title: 'Computer Science 101',
      description: 'Introduction to computer science',
      chapters: [
        {
          id: 'programming_basics',
          title: 'Programming Basics',
          description: 'Introduction to programming languages',
          content: 'Programming involves writing code...',
          difficulty: 'beginner',
          quiz: [
            {
              question: 'What is a variable in programming?',
              options: ['Constant', 'Container for data', 'Function'],
              correctAnswer: 1
            }
          ]
        },
        {
          id: 'data_structures',
          title: 'Data Structures',
          description: 'Understanding arrays, linked lists, and trees',
          content: 'Data structures help organize data...',
          difficulty: 'intermediate',
          quiz: [
            {
              question: 'Which data structure follows LIFO?',
              options: ['Queue', 'Stack', 'Array'],
              correctAnswer: 1
            }
          ]
        },
        {
          id: 'algorithms',
          title: 'Algorithms',
          description: 'Introduction to sorting and searching algorithms',
          content: 'Algorithms solve computational problems...',
          difficulty: 'hard',
          quiz: [
            {
              question: 'What is the time complexity of binary search?',
              options: ['O(n)', 'O(log n)', 'O(n²)'],
              correctAnswer: 1
            }
          ]
        }
      ]
    },
    {
      id: 'english-101',
      title: 'English 101',
      description: 'Introduction to English language',
      chapters: [
        {
          id: 'grammar_basics',
          title: 'Grammar Basics',
          description: 'Learning about nouns, verbs, and adjectives',
          content: 'Grammar defines the rules of language...',
          difficulty: 'beginner',
          quiz: [
            {
              question: 'Which is a verb?',
              options: ['Run', 'Apple', 'Happy'],
              correctAnswer: 0
            }
          ]
        },
        {
          id: 'sentence_structure',
          title: 'Sentence Structure',
          description: 'Understanding subjects, predicates, and objects',
          content: 'Sentence structure defines how words...',
          difficulty: 'intermediate',
          quiz: [
            {
              question: 'Which is the subject in "John runs fast"?',
              options: ['John', 'Runs', 'Fast'],
              correctAnswer: 0
            }
          ]
        },
        {
          id: 'literary_analysis',
          title: 'Literary Analysis',
          description: 'Analyzing poems and novels',
          content: 'Literary analysis explores themes...',
          difficulty: 'hard',
          quiz: [
            {
              question: 'Who wrote "Romeo and Juliet"?',
              options: ['Shakespeare', 'Hemingway', 'Dickens'],
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

initializeData().then(() => console.log('Data initialized'));
