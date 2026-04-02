import User from '../models/User.js';
import { serializeUser } from '../utils/serializeUser.js';
import {
  ACCOUNT_DELETE_PROBATION_DAYS,
  cancelAccountDeletion,
  hasPendingDeletion,
  requestAccountDeletion,
} from '../utils/accountDeletion.js';

export async function getProfile(request, response) {
  try {
    const user = await User.findById(request.user._id).select('-password');

    if (!user) {
      return response.status(404).json({ message: 'User profile not found.' });
    }

    return response.status(200).json(serializeUser(user));
  } catch (error) {
    return response.status(500).json({ message: 'Unable to load the profile.' });
  }
}

export async function updateProfile(request, response) {
  try {
    const { name = '', monthlyIncome = 0, savingGoal = 0 } = request.body;

    const sanitizedIncome = Number(monthlyIncome) || 0;
    const sanitizedGoal = Number(savingGoal) || 0;

    if (sanitizedIncome < 0 || sanitizedGoal < 0) {
      return response.status(400).json({ message: 'Income and saving goal must be non-negative.' });
    }

    const user = await User.findByIdAndUpdate(
      request.user._id,
      {
        name: String(name).trim(),
        monthlyIncome: sanitizedIncome,
        savingGoal: sanitizedGoal,
      },
      { new: true, runValidators: true },
    ).select('-password');

    if (!user) {
      return response.status(404).json({ message: 'User profile not found.' });
    }

    return response.status(200).json(serializeUser(user));
  } catch (error) {
    return response.status(500).json({ message: 'Unable to update the profile.' });
  }
}

export async function requestDeleteAccount(request, response) {
  try {
    const user = await User.findById(request.user._id);

    if (!user) {
      return response.status(404).json({ message: 'User profile not found.' });
    }

    requestAccountDeletion(user);
    await user.save();

    return response.status(200).json({
      message: `Account deletion requested. Your account will be deleted after ${ACCOUNT_DELETE_PROBATION_DAYS} days if you do not log in again.`,
      profile: serializeUser(user),
    });
  } catch (error) {
    return response.status(500).json({ message: 'Unable to request account deletion right now.' });
  }
}

export async function cancelDeleteAccount(request, response) {
  try {
    const user = await User.findById(request.user._id).select('-password');

    if (!user) {
      return response.status(404).json({ message: 'User profile not found.' });
    }

    if (!hasPendingDeletion(user)) {
      return response.status(400).json({ message: 'No account deletion request is active.' });
    }

    cancelAccountDeletion(user);
    await user.save();

    return response.status(200).json({
      message: 'Account deletion request canceled.',
      profile: serializeUser(user),
    });
  } catch (error) {
    return response.status(500).json({ message: 'Unable to cancel account deletion right now.' });
  }
}
