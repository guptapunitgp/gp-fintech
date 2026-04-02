import mongoose from 'mongoose';

const portfolioSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    stockName: {
      type: String,
      required: true,
      trim: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    buyPrice: {
      type: Number,
      required: true,
      min: 0.01,
    },
    mode: {
      type: String,
      enum: ['investment', 'study'],
      default: 'investment',
    },
    predictedDirection: {
      type: String,
      enum: ['rise', 'fall', 'stable', null],
      default: null,
    },
    studyNotes: {
      type: String,
      trim: true,
      maxlength: 240,
      default: '',
    },
    studyIndicators: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

const Portfolio = mongoose.model('Portfolio', portfolioSchema);

export default Portfolio;
