import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    action: {
      type: String,
      required: true,
      enum: [
        'USER_REGISTERED',
        'USER_LOGIN',
        'REPORT_SUBMITTED',
        'REPORT_APPROVED',
        'REPORT_REJECTED',
        'REPORT_CHANGES_REQUESTED',
        'POINTS_AWARDED',
        'HINT_UNLOCKED',
        'CHALLENGE_SIMULATION_RUN',
        'ADMIN_ACTION'
      ]
    },
    targetType: {
      type: String,
      required: true
    },
    targetId: {
      type: String
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    ipAddress: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ actor: 1, action: 1 });

export const AuditLog = mongoose.model('AuditLog', auditLogSchema);
