import { User } from '../models/User.js';
import { Challenge } from '../models/Challenge.js';
import { BugReport } from '../models/BugReport.js';

export const getLeaderboard = async (req, res, next) => {
  try {
    const { limit = 50, page = 1 } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));

    // Fetch participants sorted by points descending, then solved count descending
    const participants = await User.find({ role: 'participant' })
      .select('username college points solvedChallenges badges createdAt')
      .sort({ points: -1, 'solvedChallenges.length': -1, createdAt: 1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    const totalParticipants = await User.countDocuments({ role: 'participant' });

    const rankings = participants.map((p, index) => ({
      rank: (pageNum - 1) * limitNum + index + 1,
      id: p._id,
      username: p.username,
      college: p.college,
      points: p.points,
      solvedCount: p.solvedChallenges?.length || 0,
      badgesCount: p.badges?.length || 0,
      topBadge: p.badges?.[p.badges.length - 1] || null
    }));

    res.json({
      leaderboard: rankings,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalParticipants,
        totalPages: Math.ceil(totalParticipants / limitNum)
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getPublicStats = async (req, res, next) => {
  try {
    const [totalParticipants, totalChallenges, approvedReports, totalPointsResult] = await Promise.all([
      User.countDocuments({ role: 'participant' }),
      Challenge.countDocuments({ active: true }),
      BugReport.countDocuments({ status: 'approved' }),
      BugReport.aggregate([
        { $match: { status: 'approved' } },
        { $group: { _id: null, sum: { $sum: '$pointsAwarded' } } }
      ])
    ]);

    const totalPointsAwarded = totalPointsResult[0]?.sum || 0;

    res.json({
      stats: {
        totalParticipants,
        totalChallenges,
        approvedReports,
        totalPointsAwarded,
        maxPossiblePoints: 10 * 4 + 25 * 4 + 50 * 4 // 40 + 100 + 200 = 340 pts
      }
    });
  } catch (error) {
    next(error);
  }
};
