import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const isFirebaseConfigured = Object.values(firebaseConfig).every(Boolean);
const missingFirebaseConfigKeys = Object.entries({
  VITE_FIREBASE_API_KEY: firebaseConfig.apiKey,
  VITE_FIREBASE_AUTH_DOMAIN: firebaseConfig.authDomain,
  VITE_FIREBASE_PROJECT_ID: firebaseConfig.projectId,
  VITE_FIREBASE_APP_ID: firebaseConfig.appId,
})
  .filter(([, value]) => !value)
  .map(([key]) => key);

let auth = null;
let googleProvider = null;

if (isFirebaseConfigured) {
  const app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  googleProvider = new GoogleAuthProvider();
  googleProvider.setCustomParameters({ prompt: 'select_account' });
}

export { auth, googleProvider, isFirebaseConfigured, missingFirebaseConfigKeys };

export async function signOutFirebase() {
  if (!auth) {
    return;
  }

  await signOut(auth).catch(() => null);
}

export async function signInWithGooglePopup() {
  if (!auth || !googleProvider) {
    return null;
  }

  return signInWithPopup(auth, googleProvider);
}
