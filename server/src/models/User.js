import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      default: '',
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      default: '',
      validate: {
        validator(value) {
          if (this.authProvider === 'local') {
            return typeof value === 'string' && value.length >= 6;
          }

          return true;
        },
        message: 'Password must be at least 6 characters for local accounts.',
      },
    },
    authProvider: {
      type: String,
      enum: ['local', 'google'],
      default: 'local',
    },
    googleId: {
      type: String,
      default: '',
      index: true,
    },
    role: {
      type: String,
      enum: ['admin', 'viewer'],
      default: 'viewer',
    },
    monthlyIncome: {
      type: Number,
      default: 0,
      min: 0,
    },
    savingGoal: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastLoginAt: {
      type: Date,
      default: Date.now,
    },
    deletionRequestedAt: {
      type: Date,
      default: null,
    },
    deletionScheduledFor: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

const User = mongoose.model('User', userSchema);

export default User;
