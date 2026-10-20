import mongoose from 'mongoose';

const challengeProgressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    challenge: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Challenge',
      required: true
    },
    challengeId: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['unattempted', 'attempted', 'solved'],
      default: 'unattempted'
    },
    unlockedHints: [
      {
        type: Number,
        min: 1,
        max: 3
      }
    ],
    simulationsRun: {
      type: Number,
      default: 0
    },
    lastAttemptAt: {
      type: Date,
      default: Date.now
    },
    solvedAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

// Compound unique index ensuring one progress document per user and challenge
challengeProgressSchema.index({ user: 1, challenge: 1 }, { unique: true });
challengeProgressSchema.index({ user: 1, challengeId: 1 });

export const ChallengeProgress = mongoose.model('ChallengeProgress', challengeProgressSchema);
