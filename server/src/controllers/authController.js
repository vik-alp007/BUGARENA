import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { AuditLog } from '../models/AuditLog.js';
import { config } from '../config/env.js';

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role, username: user.username },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );
};

export const register = async (req, res, next) => {
  try {
    const { username, email, password, college } = req.body;

    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { username }]
    });

    if (existingUser) {
      if (existingUser.email === email.toLowerCase()) {
        return res.status(409).json({ error: 'An account with this email address already exists.' });
      }
      return res.status(409).json({ error: 'This username is already taken. Please choose another.' });
    }

    const user = new User({
      username,
      email: email.toLowerCase(),
      password,
      college: college || 'Bug Arena Academy',
      role: 'participant',
      badges: [
        {
          id: 'cadet-registered',
          name: 'Bug Arena Cadet',
          icon: 'Shield',
          description: 'Enlisted in the Bug Arena cybersecurity competition'
        }
      ]
    });

    await user.save();

    await AuditLog.create({
      actor: user._id,
      action: 'USER_REGISTERED',
      targetType: 'User',
      targetId: user._id.toString(),
      metadata: { username: user.username, email: user.email },
      ipAddress: req.ip
    });

    const token = generateToken(user);

    res.status(201).json({
      message: 'Account created successfully. Welcome to BUG ARENA!',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        college: user.college,
        points: user.points,
        badges: user.badges,
        solvedChallenges: user.solvedChallenges
      }
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials. Please verify your email and password.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials. Please verify your email and password.' });
    }

    await AuditLog.create({
      actor: user._id,
      action: 'USER_LOGIN',
      targetType: 'User',
      targetId: user._id.toString(),
      metadata: { role: user.role },
      ipAddress: req.ip
    });

    const token = generateToken(user);

    res.json({
      message: 'Authentication successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        college: user.college,
        points: user.points,
        badges: user.badges,
        solvedChallenges: user.solvedChallenges
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('solvedChallenges', 'challengeId title points difficulty');
    res.json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        college: user.college,
        bio: user.bio,
        points: user.points,
        badges: user.badges,
        solvedChallenges: user.solvedChallenges,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { college, bio } = req.body;
    const user = await User.findById(req.user._id);

    if (college !== undefined) user.college = String(college).trim();
    if (bio !== undefined) user.bio = String(bio).trim();

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        college: user.college,
        bio: user.bio,
        points: user.points,
        badges: user.badges
      }
    });
  } catch (error) {
    next(error);
  }
};
