import { Challenge } from '../models/Challenge.js';
import { ChallengeProgress } from '../models/ChallengeProgress.js';
import { AuditLog } from '../models/AuditLog.js';

export const getAllChallenges = async (req, res, next) => {
  try {
    const challenges = await Challenge.find({ active: true })
      .sort({ order: 1 })
      .select('-hints.text'); // Exclude hint text in listing

    let progressMap = {};
    if (req.user) {
      const progressDocs = await ChallengeProgress.find({ user: req.user._id });
      progressDocs.forEach(p => {
        progressMap[p.challengeId] = {
          status: p.status,
          unlockedHintsCount: p.unlockedHints?.length || 0,
          simulationsRun: p.simulationsRun || 0
        };
      });
    }

    const challengesWithProgress = challenges.map(c => {
      const p = progressMap[c.challengeId] || {
        status: 'unattempted',
        unlockedHintsCount: 0,
        simulationsRun: 0
      };
      return {
        _id: c._id,
        challengeId: c.challengeId,
        order: c.order,
        title: c.title,
        difficulty: c.difficulty,
        points: c.points,
        category: c.category,
        summary: c.summary,
        tags: c.tags,
        totalHints: c.hints.length,
        status: p.status,
        unlockedHintsCount: p.unlockedHintsCount,
        simulationsRun: p.simulationsRun
      };
    });

    res.json({ challenges: challengesWithProgress });
  } catch (error) {
    next(error);
  }
};

export const getChallengeById = async (req, res, next) => {
  try {
    const { challengeId } = req.params;
    const challenge = await Challenge.findOne({ challengeId, active: true });

    if (!challenge) {
      return res.status(404).json({ error: `Challenge '${challengeId}' not found.` });
    }

    let progress = null;
    let unlockedHintTiers = [];

    if (req.user) {
      progress = await ChallengeProgress.findOne({
        user: req.user._id,
        challenge: challenge._id
      });
      if (progress) {
        unlockedHintTiers = progress.unlockedHints || [];
      }
    }

    // Filter hints so text is only visible if unlocked
    const sanitizedHints = challenge.hints.map(h => ({
      tier: h.tier,
      title: h.title,
      isUnlocked: unlockedHintTiers.includes(h.tier),
      text: unlockedHintTiers.includes(h.tier) ? h.text : null
    }));

    res.json({
      challenge: {
        _id: challenge._id,
        challengeId: challenge.challengeId,
        order: challenge.order,
        title: challenge.title,
        difficulty: challenge.difficulty,
        points: challenge.points,
        category: challenge.category,
        summary: challenge.summary,
        description: challenge.description,
        instructions: challenge.instructions,
        tags: challenge.tags,
        hints: sanitizedHints,
        status: progress ? progress.status : 'unattempted',
        simulationsRun: progress ? progress.simulationsRun : 0
      }
    });
  } catch (error) {
    next(error);
  }
};

export const unlockHint = async (req, res, next) => {
  try {
    const { challengeId } = req.params;
    const tier = parseInt(req.body.tier, 10);

    if (![1, 2, 3].includes(tier)) {
      return res.status(400).json({ error: 'Hint tier must be 1, 2, or 3.' });
    }

    const challenge = await Challenge.findOne({ challengeId, active: true });
    if (!challenge) {
      return res.status(404).json({ error: 'Challenge not found.' });
    }

    const hint = challenge.hints.find(h => h.tier === tier);
    if (!hint) {
      return res.status(404).json({ error: `Hint tier ${tier} does not exist for this challenge.` });
    }

    let progress = await ChallengeProgress.findOne({
      user: req.user._id,
      challenge: challenge._id
    });

    if (!progress) {
      progress = new ChallengeProgress({
        user: req.user._id,
        challenge: challenge._id,
        challengeId: challenge.challengeId,
        status: 'attempted',
        unlockedHints: [tier]
      });
    } else {
      if (!progress.unlockedHints.includes(tier)) {
        // Enforce progressive hints: tier 2 requires 1, tier 3 requires 2
        if (tier > 1 && !progress.unlockedHints.includes(tier - 1)) {
          return res.status(400).json({
            error: `You must unlock Hint Tier ${tier - 1} before unlocking Tier ${tier}.`
          });
        }
        progress.unlockedHints.push(tier);
        progress.unlockedHints.sort((a, b) => a - b);
      }
    }

    await progress.save();

    await AuditLog.create({
      actor: req.user._id,
      action: 'HINT_UNLOCKED',
      targetType: 'Challenge',
      targetId: challenge.challengeId,
      metadata: { tier },
      ipAddress: req.ip
    });

    res.json({
      message: `Hint Tier ${tier} unlocked!`,
      hint: {
        tier: hint.tier,
        title: hint.title,
        text: hint.text,
        isUnlocked: true
      },
      unlockedHints: progress.unlockedHints
    });
  } catch (error) {
    next(error);
  }
};

export const recordAttempt = async (req, res, next) => {
  try {
    const { challengeId } = req.params;
    const challenge = await Challenge.findOne({ challengeId, active: true });
    if (!challenge) {
      return res.status(404).json({ error: 'Challenge not found.' });
    }

    let progress = await ChallengeProgress.findOne({
      user: req.user._id,
      challenge: challenge._id
    });

    if (!progress) {
      progress = new ChallengeProgress({
        user: req.user._id,
        challenge: challenge._id,
        challengeId: challenge.challengeId,
        status: 'attempted',
        simulationsRun: 1,
        lastAttemptAt: new Date()
      });
    } else {
      progress.simulationsRun = (progress.simulationsRun || 0) + 1;
      progress.lastAttemptAt = new Date();
      if (progress.status === 'unattempted') {
        progress.status = 'attempted';
      }
    }

    await progress.save();

    res.json({
      message: 'Simulation attempt logged',
      status: progress.status,
      simulationsRun: progress.simulationsRun
    });
  } catch (error) {
    next(error);
  }
};
