// Middleware to protect scheduler endpoints
const authenticateScheduler = (req, res, next) => {
  const schedulerKey = req.headers['x-scheduler-key'];
  const expectedKey = process.env.SCHEDULER_SECRET_KEY;

  if (!schedulerKey || schedulerKey !== expectedKey) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized. Invalid or missing x-scheduler-key in headers.'
    });
  }

  next();
};

module.exports = {
  authenticateScheduler
};
