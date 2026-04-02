import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { cancelAccountDeletion, isDeletionDue, permanentlyDeleteUser } from '../utils/accountDeletion.js';
import { getFirebaseAdmin } from '../utils/firebaseAdmin.js';
import { generateToken } from '../utils/generateToken.js';
import { serializeUser } from '../utils/serializeUser.js';

function issueAuthResponse(response, user, status = 200) {
  const token = generateToken(user);

  return response.status(status).json({
    token,
    user: serializeUser(user),
  });
}

async function markUserLogin(user) {
  user.lastLoginAt = new Date();
  cancelAccountDeletion(user);
  await user.save();
  return user;
}

async function verifyFirebaseToken(idToken) {
  if (!idToken) {
    throw new Error('Firebase ID token is required.');
  }

  const admin = getFirebaseAdmin();
  const decodedToken = await admin.auth().verifyIdToken(idToken);

  if (!decodedToken.email || !decodedToken.email_verified) {
    throw new Error('Firebase account email is not verified.');
  }

  return decodedToken;
}

export async function register(request, response) {
  try {
    const { name = '', email, password, role = 'viewer' } = request.body;

    if (!email || !password) {
      return response.status(400).json({ message: 'Email and password are required.' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return response.status(409).json({ message: 'An account with that email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase(),
      password: hashedPassword,
      authProvider: 'local',
      role: role === 'admin' ? 'admin' : 'viewer',
      lastLoginAt: new Date(),
    });

    return issueAuthResponse(response, user, 201);
  } catch (error) {
    console.error('Register error:', error);
    return response.status(500).json({ message: 'Unable to register the user right now.' });
  }
}

export async function login(request, response) {
  try {
    const { email, password } = request.body;

    if (!email || !password) {
      return response.status(400).json({ message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return response.status(401).json({ message: 'Invalid email or password.' });
    }

    if (isDeletionDue(user)) {
      await permanentlyDeleteUser(user._id);
      return response.status(410).json({ message: 'This account was deleted after the probation period.' });
    }

    if (user.authProvider === 'google' && !user.password) {
      return response.status(400).json({ message: 'This account uses Google sign-in. Please continue with Google.' });
    }

    if (typeof user.password !== 'string' || !user.password) {
      console.error('Login error: user record is missing a valid password hash', {
        userId: user._id,
        email: user.email,
      });
      return response.status(500).json({ message: 'Stored user credentials are invalid. Please register again.' });
    }

    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      return response.status(401).json({ message: 'Invalid email or password.' });
    }

    await markUserLogin(user);
    return issueAuthResponse(response, user);
  } catch (error) {
    console.error('Login error:', error);
    return response.status(500).json({ message: 'Unable to log in right now.' });
  }
}

export async function googleAuth(request, response) {
  try {
    const { idToken, role = 'viewer' } = request.body;

    if (!idToken) {
      return response.status(400).json({ message: 'Firebase ID token is required.' });
    }

    const firebaseProfile = await verifyFirebaseToken(idToken);
    const email = firebaseProfile.email.toLowerCase();
    const requestedRole = role === 'admin' ? 'admin' : 'viewer';
    const authProvider = firebaseProfile.firebase?.sign_in_provider === 'google.com' ? 'google' : 'local';

    let user = await User.findOne({
      $or: [{ googleId: firebaseProfile.uid }, { email }],
    });

    if (!user) {
      user = await User.create({
        name: firebaseProfile.name || '',
        email,
        password: '',
        authProvider,
        googleId: firebaseProfile.uid,
        role: requestedRole,
        lastLoginAt: new Date(),
      });

      return issueAuthResponse(response, user, 201);
    }

    if (isDeletionDue(user)) {
      await permanentlyDeleteUser(user._id);
      return response.status(410).json({ message: 'This account was deleted after the probation period.' });
    }

    let shouldSave = false;

    if (!user.googleId) {
      user.googleId = firebaseProfile.uid;
      shouldSave = true;
    }

    if (!user.name && firebaseProfile.name) {
      user.name = firebaseProfile.name;
      shouldSave = true;
    }

    if (user.authProvider !== authProvider && !user.password) {
      user.authProvider = authProvider;
      shouldSave = true;
    }

    if (shouldSave) {
      await user.save();
    }

    await markUserLogin(user);
    return issueAuthResponse(response, user);
  } catch (error) {
    console.error('Google auth error:', error);
    return response.status(500).json({ message: error.message || 'Unable to continue with Google right now.' });
  }
}
