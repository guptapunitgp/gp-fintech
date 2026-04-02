import mongoose from 'mongoose';

export async function connectDb(mongoUri) {
  if (!mongoUri) {
    throw new Error('MONGO_URI is missing. Add it to the server environment.');
  }

  await mongoose.connect(mongoUri);
}
