const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Order = require('./src/models/Order');
const SchedulerLog = require('./src/models/SchedulerLog');

dotenv.config();

const mockOrders = [
  // 1. Placed just now (Should stay PLACED when scheduler runs)
  {
    orderId: 'ORD-20260701-NEW1',
    customerName: 'Aarav Sharma',
    phone: '+919876543210',
    productName: 'Boat Airdopes 141',
    amount: 1299,
    paymentStatus: 'PAID',
    orderStatus: 'PLACED',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  // 2. Placed 12 minutes ago (Should transition to PROCESSING when scheduler runs!)
  {
    orderId: 'ORD-20260701-OLD1',
    customerName: 'Priya Patel',
    phone: '+919123456789',
    productName: 'OnePlus Nord CE4',
    amount: 24999,
    paymentStatus: 'PAID',
    orderStatus: 'PLACED',
    createdAt: new Date(Date.now() - 12 * 60 * 1000),
    updatedAt: new Date(Date.now() - 12 * 60 * 1000)
  },
  // 3. Processing 5 minutes ago (Should stay PROCESSING when scheduler runs)
  {
    orderId: 'ORD-20260701-PROC1',
    customerName: 'Rohan Verma',
    phone: '+919812345670',
    productName: 'Logitech MX Master 3S',
    amount: 9499,
    paymentStatus: 'PAID',
    orderStatus: 'PROCESSING',
    createdAt: new Date(Date.now() - 25 * 60 * 1000),
    updatedAt: new Date(Date.now() - 5 * 60 * 1000) // Updated 5 min ago
  },
  // 4. Processing 22 minutes ago (Should transition to READY_TO_SHIP when scheduler runs!)
  {
    orderId: 'ORD-20260701-PROC2',
    customerName: 'Neha Gupta',
    phone: '+919567890123',
    productName: 'Sony WH-1000XM5',
    amount: 29999,
    paymentStatus: 'PAID',
    orderStatus: 'PROCESSING',
    createdAt: new Date(Date.now() - 40 * 60 * 1000),
    updatedAt: new Date(Date.now() - 22 * 60 * 1000) // Updated 22 min ago
  },
  // 5. Already Ready to Ship
  {
    orderId: 'ORD-20260701-SHIP1',
    customerName: 'Kabir Singh',
    phone: '+917012345678',
    productName: 'Adidas Running Shoes',
    amount: 4500,
    paymentStatus: 'PAID',
    orderStatus: 'READY_TO_SHIP',
    createdAt: new Date(Date.now() - 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 35 * 60 * 1000)
  }
];

const seedDB = async () => {
  try {
    console.log('Connecting to database for seeding...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Database connected!');

    // Clear existing data
    console.log('Clearing existing Orders and Logs...');
    await Order.deleteMany({});
    await SchedulerLog.deleteMany({});
    console.log('Cleared!');

    // Insert mock data
    console.log('Inserting mock orders...');
    // We add status history manually to match seed dates
    const preparedOrders = mockOrders.map(order => {
      const history = [{
        status: 'PLACED',
        changedAt: order.createdAt,
        reason: 'Order created via seeding script'
      }];
      if (order.orderStatus !== 'PLACED') {
        history.push({
          status: order.orderStatus,
          changedAt: order.updatedAt,
          reason: `Moved to ${order.orderStatus} via seeding script`
        });
      }
      return {
        ...order,
        statusHistory: history
      };
    });

    await Order.insertMany(preparedOrders);
    console.log(`Database seeded successfully with ${preparedOrders.length} orders!`);

    mongoose.connection.close();
    console.log('Database connection closed.');
  } catch (error) {
    console.error('Error seeding database:', error.message);
    process.exit(1);
  }
};

seedDB();
