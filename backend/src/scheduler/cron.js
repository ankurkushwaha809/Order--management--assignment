const cron = require('node-cron');
const { runStatusUpdater } = require('../controllers/schedulerController');

const initScheduler = () => {
  // Cron syntax: Run every 5 minutes
  // '*/5 * * * *'
  cron.schedule('*/5 * * * *', async () => {
    console.log('Background Cron Triggered: Running Order Status Transition logic...');
    try {
      const result = await runStatusUpdater();
      console.log(`Background Cron Finished. Updated ${result.ordersUpdated} orders.`);
    } catch (error) {
      console.error('Background Cron Error:', error.message);
    }
  });
  console.log('Local Scheduler Cron Job Initialized (configured for every 5 minutes)');
};

module.exports = initScheduler;
