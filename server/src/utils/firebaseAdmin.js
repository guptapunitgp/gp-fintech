import admin from 'firebase-admin';
import { env } from '../config/env.js';

let firebaseApp;

function formatPrivateKey(value) {
  return value ? value.replace(/\\n/g, '\n') : '';
}

export function getFirebaseAdmin() {
  if (firebaseApp) {
    return admin;
  }

  if (!env.firebaseProjectId || !env.firebaseClientEmail || !env.firebasePrivateKey) {
    throw new Error('Firebase Admin credentials are missing from the server environment.');
  }

  firebaseApp = admin.initializeApp({
    credential: admin.credential.cert({
      projectId: env.firebaseProjectId,
      clientEmail: env.firebaseClientEmail,
      privateKey: formatPrivateKey(env.firebasePrivateKey),
    }),
  });

  return admin;
}
