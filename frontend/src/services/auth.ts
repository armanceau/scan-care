import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from 'firebase/auth';

import { auth } from './firebase';

export const signUpWithEmail = async (email: string, password: string) => {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  return credential.user;
};

export const signInWithEmail = async (email: string, password: string) => {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
};

export const signOutUser = () => signOut(auth);

export const watchAuthState = (handler: (user: User | null) => void) => onAuthStateChanged(auth, handler);
