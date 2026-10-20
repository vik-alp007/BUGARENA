import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      minlength: [3, 'Username must be at least 3 characters'],
      maxlength: [30, 'Username cannot exceed 30 characters']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/\S+@\S+\.\S+/, 'Please provide a valid email address']
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false
    },
    role: {
      type: String,
      enum: ['participant', 'admin'],
      default: 'participant'
    },
    college: {
      type: String,
      trim: true,
      default: 'Bug Arena Academy'
    },
    bio: {
      type: String,
      maxlength: [200, 'Bio cannot exceed 200 characters'],
      default: 'Cybersecurity Enthusiast & Bug Hunter'
    },
    points: {
      type: Number,
      default: 0,
      min: 0
    },
    solvedChallenges: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Challenge'
      }
    ],
    badges: [
      {
        id: String,
        name: String,
        icon: String,
        description: String,
        unlockedAt: { type: Date, default: Date.now }
      }
    ]
  },
  {
    timestamps: true
  }
);

// Hash password before save if modified
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password helper
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model('User', userSchema);
