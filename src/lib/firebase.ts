import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  projectId: "peerless-purpose-d6shk",
  appId: "1:494424374203:web:d06c5a1369aa2d9503a29e",
  apiKey: "AIzaSyBMegZK99qRdriRsbrNWMbVxjKx-fulqas",
  authDomain: "peerless-purpose-d6shk.firebaseapp.com",
  storageBucket: "peerless-purpose-d6shk.firebasestorage.app",
  messagingSenderId: "494424374203",
  measurementId: "",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, "ai-studio-pestcontrolmanag-69c8846c-edaa-41c5-863f-957f242d5a14");
export const auth = getAuth(app);
