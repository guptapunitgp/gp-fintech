import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { isDeletionDue, permanentlyDeleteUser } from '../utils/accountDeletion.js';
import { env } from '../config/env.js';

export async function authenticateToken(request, response, next) {
  try {
    const authHeader = request.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      return response.status(401).json({ message: 'Authentication token is required.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, env.jwtSecret);
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return response.status(401).json({ message: 'User not found for this token.' });
    }

    if (isDeletionDue(user)) {
      await permanentlyDeleteUser(user._id);
      return response.status(401).json({ message: 'This account was deleted after the probation period.' });
    }

    request.user = user;
    next();
  } catch (error) {
    return response.status(401).json({ message: 'Invalid or expired authentication token.' });
  }
}
