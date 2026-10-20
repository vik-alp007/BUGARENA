import { BugReport } from '../models/BugReport.js';
import { Challenge } from '../models/Challenge.js';
import { ChallengeProgress } from '../models/ChallengeProgress.js';
import { AuditLog } from '../models/AuditLog.js';

export const submitReport = async (req, res, next) => {
  try {
    const {
      challengeId,
      title,
      category,
      severity,
      reproductionSteps,
      expectedResult,
      actualResult,
      evidenceText
    } = req.body;

    const challenge = await Challenge.findOne({ challengeId, active: true });
    if (!challenge) {
      return res.status(404).json({ error: `Challenge '${challengeId}' not found.` });
    }

    // Check if user already has an approved report for this challenge
    const existingApproved = await BugReport.findOne({
      user: req.user._id,
      challenge: challenge._id,
      status: 'approved'
    });

    if (existingApproved) {
      return res.status(409).json({
        error: 'You have already solved this challenge and earned full points. Duplicate submissions are not rewarded.'
      });
    }

    // Check if user already has a pending report for this challenge
    const existingPending = await BugReport.findOne({
      user: req.user._id,
      challenge: challenge._id,
      status: 'pending'
    });

    if (existingPending) {
      return res.status(409).json({
        error: 'You already have a pending report under review for this challenge. Please await admin triage.'
      });
    }

    const report = new BugReport({
      user: req.user._id,
      challenge: challenge._id,
      challengeId: challenge.challengeId,
      title: title.trim(),
      category: category.trim(),
      severity,
      reproductionSteps: reproductionSteps.trim(),
      expectedResult: expectedResult.trim(),
      actualResult: actualResult.trim(),
      evidenceText: (evidenceText || '').trim(),
      status: 'pending'
    });

    await report.save();

    // Ensure challenge progress is marked attempted
    let progress = await ChallengeProgress.findOne({
      user: req.user._id,
      challenge: challenge._id
    });

    if (!progress) {
      progress = new ChallengeProgress({
        user: req.user._id,
        challenge: challenge._id,
        challengeId: challenge.challengeId,
        status: 'attempted'
      });
      await progress.save();
    }

    await AuditLog.create({
      actor: req.user._id,
      action: 'REPORT_SUBMITTED',
      targetType: 'BugReport',
      targetId: report._id.toString(),
      metadata: { challengeId: challenge.challengeId, severity },
      ipAddress: req.ip
    });

    res.status(201).json({
      message: 'Bug report submitted successfully! It has been queued for admin review.',
      report: {
        id: report._id,
        title: report.title,
        challengeId: report.challengeId,
        severity: report.severity,
        status: report.status,
        createdAt: report.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getMyReports = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = { user: req.user._id };
    if (status && ['pending', 'approved', 'rejected', 'changes_requested'].includes(status)) {
      filter.status = status;
    }

    const reports = await BugReport.find(filter)
      .populate('challenge', 'title difficulty points category challengeId')
      .sort({ createdAt: -1 });

    res.json({ reports });
  } catch (error) {
    next(error);
  }
};

export const getReportById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const report = await BugReport.findById(id)
      .populate('challenge', 'title difficulty points category challengeId')
      .populate('user', 'username email college');

    if (!report) {
      return res.status(404).json({ error: 'Bug report not found.' });
    }

    // Authorization: only the owner or an admin can access
    const isOwner = report.user._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: 'Access denied to this report.' });
    }

    res.json({ report });
  } catch (error) {
    next(error);
  }
};
