import mongoose from 'mongoose';

const bugReportSchema = new mongoose.Schema(
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
    title: {
      type: String,
      required: [true, 'Report title is required'],
      trim: true,
      minlength: [5, 'Title must be at least 5 characters'],
      maxlength: [120, 'Title cannot exceed 120 characters']
    },
    category: {
      type: String,
      required: [true, 'Bug category is required']
    },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      required: [true, 'Severity is required']
    },
    reproductionSteps: {
      type: String,
      required: [true, 'Reproduction steps are required'],
      minlength: [20, 'Please provide clear, step-by-step reproduction instructions (at least 20 characters)']
    },
    expectedResult: {
      type: String,
      required: [true, 'Expected result is required'],
      minlength: [10, 'Expected result must be at least 10 characters']
    },
    actualResult: {
      type: String,
      required: [true, 'Actual result is required'],
      minlength: [10, 'Actual result must be at least 10 characters']
    },
    evidenceText: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'changes_requested'],
      default: 'pending'
    },
    adminFeedback: {
      type: String,
      default: ''
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reviewedAt: {
      type: Date
    },
    pointsAwarded: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

// Index for user queries and challenge queries
bugReportSchema.index({ user: 1, createdAt: -1 });
bugReportSchema.index({ challenge: 1, status: 1 });
bugReportSchema.index({ status: 1, createdAt: -1 });

export const BugReport = mongoose.model('BugReport', bugReportSchema);
