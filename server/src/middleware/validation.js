export const validateRegister = (req, res, next) => {
  const { username, email, password } = req.body;
  const errors = [];

  if (!username || typeof username !== 'string' || username.trim().length < 3) {
    errors.push('Username must be at least 3 characters long');
  } else if (username.trim().length > 30) {
    errors.push('Username cannot exceed 30 characters');
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || typeof email !== 'string' || !emailRegex.test(email.trim())) {
    errors.push('A valid email address is required');
  }

  if (!password || typeof password !== 'string' || password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }

  if (errors.length > 0) {
    return res.status(400).json({ error: 'Validation failed', details: errors });
  }

  req.body.username = username.trim();
  req.body.email = email.trim().toLowerCase();
  next();
};

export const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  next();
};

export const validateBugReport = (req, res, next) => {
  const {
    challengeId,
    title,
    category,
    severity,
    reproductionSteps,
    expectedResult,
    actualResult
  } = req.body;
  const errors = [];

  if (!challengeId || typeof challengeId !== 'string') {
    errors.push('Challenge ID is required');
  }
  if (!title || typeof title !== 'string' || title.trim().length < 5) {
    errors.push('Title must be at least 5 characters long');
  }
  if (!category || typeof category !== 'string') {
    errors.push('Category is required');
  }
  const validSeverities = ['low', 'medium', 'high', 'critical'];
  if (!severity || !validSeverities.includes(severity)) {
    errors.push(`Severity must be one of: ${validSeverities.join(', ')}`);
  }
  if (!reproductionSteps || typeof reproductionSteps !== 'string' || reproductionSteps.trim().length < 20) {
    errors.push('Reproduction steps must be detailed (at least 20 characters)');
  }
  if (!expectedResult || typeof expectedResult !== 'string' || expectedResult.trim().length < 10) {
    errors.push('Expected result must be at least 10 characters');
  }
  if (!actualResult || typeof actualResult !== 'string' || actualResult.trim().length < 10) {
    errors.push('Actual result must be at least 10 characters');
  }

  if (errors.length > 0) {
    return res.status(400).json({ error: 'Validation failed', details: errors });
  }
  next();
};

export const validateReviewReport = (req, res, next) => {
  const { status, adminFeedback } = req.body;
  const validStatuses = ['approved', 'rejected', 'changes_requested'];

  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({
      error: `Status must be one of: ${validStatuses.join(', ')}`
    });
  }

  if (status === 'rejected' || status === 'changes_requested') {
    if (!adminFeedback || typeof adminFeedback !== 'string' || adminFeedback.trim().length < 5) {
      return res.status(400).json({
        error: 'Constructive admin feedback is required when rejecting or requesting changes (min 5 chars)'
      });
    }
  }

  next();
};
