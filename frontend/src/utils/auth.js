// frontend/src/utils/auth.js
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

export const isAdmin = async () => {
  if (!auth.currentUser) return false;
  const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
  return userDoc.exists() && userDoc.data().role === 'admin';
};

export const getUserRole = async () => {
  if (!auth.currentUser) return null;
  const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
  return userDoc.exists() ? userDoc.data().role : null;
};