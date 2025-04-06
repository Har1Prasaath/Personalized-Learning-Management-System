# Personalized Learning Management System

A modern, adaptive learning platform that tailors educational content to individual student needs.

![Personalized Learning Management System](./frontend/public/assets/logo.png)

## Overview

The Personalized Learning Management System is a full-featured e-learning platform built with React and Firebase. It provides personalized learning experiences by adapting content difficulty based on student performance and learning patterns.

## Key Features

- **Personalized Learning Paths**: Content adapts to each student's performance and learning pace
- **Interactive Dashboard**: Track learning progress, strengths, and areas for improvement
- **Adaptive Quizzes**: Quiz difficulty adjusts based on user performance
- **Course Management**: Rich course content with multiple chapters and interactive quizzes
- **User Management**: Different permission levels for students and administrators
- **Progress Tracking**: Detailed analytics for students and administrators
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Technology Stack

### Frontend
- React.js
- Material UI
- React Router
- Emotion (CSS-in-JS)
- TsParticles (for interactive backgrounds)
- Firebase client SDK

### Backend
- Firebase (Firestore, Authentication)
- Express.js
- Node.js

## Project Structure

```
Personalized-Learning-Management-System/
│
├── frontend/                # React frontend application
│   ├── public/              # Static files
│   └── src/                 # Source files
│       ├── assets/          # Images and icons
│       ├── components/      # React components
│       ├── context/         # React context providers
│       ├── firebase.js      # Firebase configuration
│       ├── theme.js         # MUI theme customization
│       └── utils/           # Utility functions
│
└── backend/                 # Node.js backend
    ├── index.js             # Main server file
    ├── firebase.js          # Server-side Firebase configuration
    ├── initializeCourses.js # Script to initialize course data
    └── serviceAccountKey.json # Firebase service account credentials
```

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn
- Firebase account

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/Personalized-Learning-Management-System.git
cd Personalized-Learning-Management-System
```

2. Install dependencies
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

3. Setup Firebase
   - Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication (Email/Password and Google Sign-in)
   - Create a Firestore database
   - Add your Firebase configuration to `frontend/src/firebase.js`
   - Generate a service account key and save it as `backend/serviceAccountKey.json`

4. Initialize the database
```bash
cd ../backend
node initializeCourses.js
```

5. Start the development servers
```bash
# Start backend server
cd backend
npm start

# In a new terminal, start frontend server
cd frontend
npm start
```

6. Open your browser to `http://localhost:3000`

## Usage

### User Roles

#### Students
- Register with email or Google account
- Browse available courses
- Enroll in courses
- Complete chapter content and quizzes
- Track personal progress
- Update learning preferences and profile

#### Administrators
- Manage users (view details, track progress)
- View detailed analytics on course performance
- Monitor student activities and progress

### Course Structure

Each course contains:
- Multiple chapters with educational content
- Chapter quizzes to test knowledge
- Adaptive difficulty levels (beginner, intermediate, advanced)
- Progress tracking

## Features In Detail

### Adaptive Learning
The system adjusts content difficulty based on user quiz performance:
- Scores ≥ 80%: Advanced content
- Scores ≥ 50%: Intermediate content
- Scores < 50%: Beginner content

### Progress Tracking
- Detailed progress statistics and visualizations
- Strength and weakness analysis
- Historical performance data

### User Profiles
Users can set and update:
- Learning goals
- Learning preferences
- Personal information

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [React.js](https://reactjs.org/)
- [Material UI](https://mui.com/)
- [Firebase](https://firebase.google.com/)
- [TsParticles](https://particles.js.org/)