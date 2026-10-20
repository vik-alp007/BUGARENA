export const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    error: `API endpoint not found: ${req.method} ${req.originalUrl}`
  });
};

export const errorHandler = (err, req, res, next) => {
  console.error('[API Error]:', err.message || err);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(val => val.message);
    return res.status(400).json({ error: 'Validation Error', details: messages });
  }

  // Duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return res.status(409).json({ error: `An entry with this ${field} already exists.` });
  }

  // Cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({ error: `Invalid ID format for parameter: ${err.path}` });
  }

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};
