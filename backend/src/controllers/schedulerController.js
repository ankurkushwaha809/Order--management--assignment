const Order = require('../models/Order');
const SchedulerLog = require('../models/SchedulerLog');
const { v4: uuidv4 } = require('crypto'); // We can use crypto built-in module for v4 UUID

// Helper to run the order status transition logic
const runStatusUpdater = async () => {
  const startTime = new Date();
  const executionId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  
  let ordersProcessed = 0;
  let ordersUpdated = 0;
  const details = [];

  try {
    // Current time
    const now = new Date();

    // 10 minutes ago
    const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000);
    // 20 minutes ago
    const twentyMinutesAgo = new Date(now.getTime() - 20 * 60 * 1000);

    // Fetch orders that need checking: PLACED or PROCESSING
    const orders = await Order.find({
      orderStatus: { $in: ['PLACED', 'PROCESSING'] }
    });

    ordersProcessed = orders.length;
    const checkedOrders = orders.map(o => o.orderId);

    for (const order of orders) {
      let statusChanged = false;
      let previousStatus = order.orderStatus;
      let newStatus = '';
      let reason = '';

      if (order.orderStatus === 'PLACED') {
        // If order status is PLACED for more than 10 minutes, move to PROCESSING
        // Check either updatedAt or createdAt, let's use updatedAt as it reflects status duration
        if (order.updatedAt <= tenMinutesAgo) {
          newStatus = 'PROCESSING';
          reason = 'Automatically updated by Scheduler: PLACED for more than 10 minutes';
          statusChanged = true;
        }
      } else if (order.orderStatus === 'PROCESSING') {
        // If order status is PROCESSING for more than 20 minutes, move to READY_TO_SHIP
        if (order.updatedAt <= twentyMinutesAgo) {
          newStatus = 'READY_TO_SHIP';
          reason = 'Automatically updated by Scheduler: PROCESSING for more than 20 minutes';
          statusChanged = true;
        }
      }

      if (statusChanged) {
        order.orderStatus = newStatus;
        order.statusHistory.push({
          status: newStatus,
          changedAt: new Date(),
          reason
        });

        await order.save();

        ordersUpdated++;
        details.push({
          orderId: order.orderId,
          previousStatus,
          newStatus
        });
      }
    }

    const endTime = new Date();
    const durationMs = endTime.getTime() - startTime.getTime();

    // Save success log
    const log = new SchedulerLog({
      executionId,
      startTime,
      endTime,
      durationMs,
      status: 'SUCCESS',
      ordersProcessed,
      ordersUpdated,
      checkedOrders,
      details
    });

    await log.save();

    return {
      success: true,
      executionId,
      ordersProcessed,
      ordersUpdated,
      details
    };
  } catch (error) {
    const endTime = new Date();
    const durationMs = endTime.getTime() - startTime.getTime();

    // Save failure log
    try {
      const log = new SchedulerLog({
        executionId,
        startTime,
        endTime,
        durationMs,
        status: 'FAILED',
        ordersProcessed,
        ordersUpdated,
        details,
        errorMessage: error.message
      });
      await log.save();
    } catch (dbError) {
      console.error('Failed to save scheduler failure log:', dbError.message);
    }

    throw error;
  }
};

// @desc    Trigger Scheduler Job manually
// @route   POST /api/scheduler/run
// @access  Private (x-scheduler-key required)
exports.triggerScheduler = async (req, res) => {
  try {
    const result = await runStatusUpdater();
    res.status(200).json({
      success: true,
      message: 'Scheduler task executed successfully.',
      result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Scheduler task failed during execution.',
      error: error.message
    });
  }
};

// @desc    Get Scheduler Execution Logs
// @route   GET /api/scheduler/logs
// @access  Public
exports.getSchedulerLogs = async (req, res) => {
  try {
    const logs = await SchedulerLog.find()
      .sort({ createdAt: -1 })
      .limit(30); // Return the last 30 executions

    res.status(200).json({
      success: true,
      data: logs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch scheduler logs.',
      error: error.message
    });
  }
};

// Export the core updater function for local cron usage too
exports.runStatusUpdater = runStatusUpdater;
