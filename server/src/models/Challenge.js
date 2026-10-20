import mongoose from 'mongoose';

const hintSchema = new mongoose.Schema(
  {
    tier: {
      type: Number,
      required: true,
      min: 1,
      max: 3
    },
    title: {
      type: String,
      required: true
    },
    text: {
      type: String,
      required: true
    }
  },
  { _id: false }
);

const challengeSchema = new mongoose.Schema(
  {
    challengeId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },
    order: {
      type: Number,
      required: true,
      default: 1
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      required: true
    },
    points: {
      type: Number,
      required: true,
      enum: [10, 25, 50]
    },
    category: {
      type: String,
      required: true
    },
    summary: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    instructions: {
      type: String,
      required: true
    },
    hints: [hintSchema],
    tags: [
      {
        type: String,
        trim: true
      }
    ],
    active: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

export const Challenge = mongoose.model('Challenge', challengeSchema);
