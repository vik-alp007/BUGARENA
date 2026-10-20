import { BugReport } from '../models/BugReport.js';
import { Challenge } from '../models/Challenge.js';
import { User } from '../models/User.js';
import { ChallengeProgress } from '../models/ChallengeProgress.js';
import { AuditLog } from '../models/AuditLog.js';

// Evaluate and award badges on challenge solve
const evaluateBadges = (user, challenge, totalSolved) => {
  const currentBadgeIds = new Set(user.badges.map(b => b.id));
  const newBadges = [];

  // 1. First Blood (First accepted report)
  if (!currentBadgeIds.has('first-blood') && totalSolved >= 1) {
    newBadges.push({
      id: 'first-blood',
      name: 'First Blood',
      icon: 'Flame',
      description: 'Submitted your first verified, accepted bug report!'
    });
  }

  // 2. Bug Hunter (3 solved challenges)
  if (!currentBadgeIds.has('bug-hunter') && totalSolved >= 3) {
    newBadges.push({
      id: 'bug-hunter',
      name: 'Bug Hunter',
      icon: 'Target',
      description: 'Successfully uncovered and reported 3 distinct vulnerabilities'
    });
  }

  // 3. Vulnerability Specialist (5 solved challenges)
  if (!currentBadgeIds.has('vuln-specialist') && totalSolved >= 5) {
    newBadges.push({
      id: 'vuln-specialist',
      name: 'Vulnerability Specialist',
      icon: 'Zap',
      description: 'Conquered 5 competition challenges across multiple categories'
    });
  }

  // 4. Elite Sleuth (Solved a Hard challenge)
  if (!currentBadgeIds.has('elite-sleuth') && challenge.difficulty === 'hard') {
    newBadges.push({
      id: 'elite-sleuth',
      name: 'Elite Sleuth',
      icon: 'Cpu',
      description: 'Cracked a Hard tier challenge (Race Condition, State Transition, or Auth Puzzle)'
    });
  }

  // 5. Grandmaster (All 12 solved)
  if (!currentBadgeIds.has('grandmaster') && totalSolved >= 12) {
    newBadges.push({
      id: 'grandmaster',
      name: 'Grandmaster Hunter',
      icon: 'Trophy',
      description: 'Solved all 12 Glitch Lab vulnerabilities. Absolute mastery.'
    });
  }

  return newBadges;
};

export const getAdminStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'participant' });
    const totalReports = await BugReport.countDocuments();
    const pendingReports = await BugReport.countDocuments({ status: 'pending' });
    const approvedReports = await BugReport.countDocuments({ status: 'approved' });
    const rejectedReports = await BugReport.countDocuments({ status: 'rejected' });
    const changesRequestedReports = await BugReport.countDocuments({ status: 'changes_requested' });

    // Aggregate points awarded
    const pointsAggregation = await BugReport.aggregate([
      { $match: { status: 'approved' } },
      { $group: { _id: null, totalPoints: { $sum: '$pointsAwarded' } } }
    ]);
    const totalPointsAwarded = pointsAggregation[0]?.totalPoints || 0;

    // Recent audit logs
    const recentAuditLogs = await AuditLog.find()
      .populate('actor', 'username email role')
      .sort({ createdAt: -1 })
      .limit(10);

    // Challenges solve count
    const challengeStats = await Challenge.aggregate([
      {
        $lookup: {
          from: 'bugreports',
          localField: '_id',
          foreignField: 'challenge',
          as: 'reports'
        }
      },
      {
        $project: {
          challengeId: 1,
          title: 1,
          difficulty: 1,
          points: 1,
          acceptedCount: {
            $size: {
              $filter: {
                input: '$reports',
                as: 'r',
                cond: { $eq: ['$$r.status', 'approved'] }
              }
            }
          }
        }
      },
      { $sort: { acceptedCount: -1 } }
    ]);

    res.json({
      stats: {
        totalUsers,
        totalReports,
        pendingReports,
        approvedReports,
        rejectedReports,
        changesRequestedReports,
        totalPointsAwarded,
        approvalRate: totalReports > 0 ? Math.round((approvedReports / totalReports) * 100) : 0
      },
      challengeStats,
      recentAuditLogs
    });
  } catch (error) {
    next(error);
  }
};

export const getAllReports = async (req, res, next) => {
  try {
    const { status, challengeId, severity, search } = req.query;
    const filter = {};

    if (status && ['pending', 'approved', 'rejected', 'changes_requested'].includes(status)) {
      filter.status = status;
    }
    if (challengeId) {
      filter.challengeId = challengeId;
    }
    if (severity && ['low', 'medium', 'high', 'critical'].includes(severity)) {
      filter.severity = severity;
    }
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { reproductionSteps: { $regex: search, $options: 'i' } }
      ];
    }

    const reports = await BugReport.find(filter)
      .populate('user', 'username email college points')
      .populate('challenge', 'title difficulty points category challengeId')
      .populate('reviewedBy', 'username')
      .sort({ createdAt: -1 });

    res.json({ reports });
  } catch (error) {
    next(error);
  }
};

export const reviewReport = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, adminFeedback } = req.body;

    const report = await BugReport.findById(id).populate('challenge');
    if (!report) {
      return res.status(404).json({ error: 'Bug report not found.' });
    }

    const user = await User.findById(report.user);
    if (!user) {
      return res.status(404).json({ error: 'Reporting user not found.' });
    }

    const challenge = report.challenge;
    let pointsAwarded = 0;
    let isDuplicateReward = false;

    if (status === 'approved') {
      // PREVENT DUPLICATE REWARD FOR SAME CHALLENGE AND USER
      const alreadySolved = user.solvedChallenges.some(
        cId => cId.toString() === challenge._id.toString()
      );

      if (!alreadySolved) {
        pointsAwarded = challenge.points;
        user.points += pointsAwarded;
        user.solvedChallenges.push(challenge._id);

        // Update challenge progress to solved
        let progress = await ChallengeProgress.findOne({
          user: user._id,
          challenge: challenge._id
        });

        if (progress) {
          progress.status = 'solved';
          progress.solvedAt = new Date();
          await progress.save();
        } else {
          await ChallengeProgress.create({
            user: user._id,
            challenge: challenge._id,
            challengeId: challenge.challengeId,
            status: 'solved',
            solvedAt: new Date()
          });
        }

        // Check & award milestone badges
        const earnedBadges = evaluateBadges(user, challenge, user.solvedChallenges.length);
        if (earnedBadges.length > 0) {
          user.badges.push(...earnedBadges);
        }

        await user.save();
      } else {
        isDuplicateReward = true;
        pointsAwarded = 0; // Prevent duplicate points
      }
    }

    report.status = status;
    report.adminFeedback = adminFeedback || (status === 'approved' ? 'Bug successfully verified and accepted. Points credited!' : '');
    report.reviewedBy = req.user._id;
    report.reviewedAt = new Date();
    report.pointsAwarded = pointsAwarded;

    await report.save();

    await AuditLog.create({
      actor: req.user._id,
      action: status === 'approved' ? 'REPORT_APPROVED' : status === 'rejected' ? 'REPORT_REJECTED' : 'REPORT_CHANGES_REQUESTED',
      targetType: 'BugReport',
      targetId: report._id.toString(),
      metadata: {
        userId: user._id.toString(),
        challengeId: challenge.challengeId,
        pointsAwarded,
        isDuplicateReward
      },
      ipAddress: req.ip
    });

    res.json({
      message: `Report status updated to '${status}'.`,
      report: {
        id: report._id,
        status: report.status,
        pointsAwarded,
        adminFeedback: report.adminFeedback,
        isDuplicateReward,
        reviewedAt: report.reviewedAt
      }
    });
  } catch (error) {
    next(error);
  }
};
