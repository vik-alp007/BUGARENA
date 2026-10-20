import { User } from '../models/User.js';
import { BugReport } from '../models/BugReport.js';
import { ChallengeProgress } from '../models/ChallengeProgress.js';

export const getProfile = async (req, res, next) => {
  try {
    const { username } = req.params;
    const query = username ? { username } : { _id: req.user._id };

    const user = await User.findOne(query)
      .select('-password')
      .populate('solvedChallenges', 'challengeId title difficulty points category');

    if (!user) {
      return res.status(404).json({ error: 'User profile not found.' });
    }

    // Calculate rank
    const higherRankCount = await User.countDocuments({
      role: 'participant',
      $or: [
        { points: { $gt: user.points } },
        { points: user.points, 'solvedChallenges.length': { $gt: user.solvedChallenges.length } }
      ]
    });
    const rank = higherRankCount + 1;

    // Report stats
    const [totalReports, approvedReports, pendingReports, rejectedReports] = await Promise.all([
      BugReport.countDocuments({ user: user._id }),
      BugReport.countDocuments({ user: user._id, status: 'approved' }),
      BugReport.countDocuments({ user: user._id, status: 'pending' }),
      BugReport.countDocuments({ user: user._id, status: 'rejected' })
    ]);

    // Challenge progress history
    const progressList = await ChallengeProgress.find({ user: user._id })
      .populate('challenge', 'challengeId title difficulty points category')
      .sort({ updatedAt: -1 });

    res.json({
      profile: {
        id: user._id,
        username: user.username,
        email: req.user && (req.user._id.toString() === user._id.toString() || req.user.role === 'admin') ? user.email : undefined,
        college: user.college,
        bio: user.bio,
        role: user.role,
        points: user.points,
        rank,
        badges: user.badges,
        solvedChallenges: user.solvedChallenges,
        stats: {
          totalReports,
          approvedReports,
          pendingReports,
          rejectedReports,
          solveRate: totalReports > 0 ? Math.round((approvedReports / totalReports) * 100) : 0
        },
        challengeHistory: progressList.map(p => ({
          challengeId: p.challengeId,
          title: p.challenge?.title,
          difficulty: p.challenge?.difficulty,
          points: p.challenge?.points,
          category: p.challenge?.category,
          status: p.status,
          simulationsRun: p.simulationsRun,
          unlockedHintsCount: p.unlockedHints.length,
          lastAttemptAt: p.lastAttemptAt,
          solvedAt: p.solvedAt
        })),
        joinedAt: user.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};
