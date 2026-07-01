const Order = require('../models/Order');

// @desc    Create a new order
// @route   POST /api/orders
// @access  Public
exports.createOrder = async (req, res) => {
  try {
    const { customerName, phone, productName, amount, paymentStatus, orderStatus } = req.body;

    if (!customerName || !phone || !productName || amount === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide customerName, phone, productName, and amount.'
      });
    }

    // Generate a unique, structured Order ID (e.g. ORD-20260701-A12B)
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const orderId = `ORD-${dateStr}-${randomSuffix}`;

    const newOrder = new Order({
      orderId,
      customerName,
      phone,
      productName,
      amount,
      paymentStatus: paymentStatus || 'PENDING',
      orderStatus: orderStatus || 'PLACED'
    });

    await newOrder.save();

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: newOrder
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create order',
      error: error.message
    });
  }
};

// @desc    Get all orders (with filters, search, and pagination)
// @route   GET /api/orders
// @access  Public
exports.getOrders = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 10 } = req.query;

    const query = {};

    // 1. Filter by orderStatus
    if (status && status !== 'ALL') {
      query.orderStatus = status;
    }

    // 2. Search by orderId or customerName (case-insensitive regex)
    if (search) {
      query.$or = [
        { orderId: { $regex: search, $options: 'i' } },
        { customerName: { $regex: search, $options: 'i' } }
      ];
    }

    // Pagination configuration
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    // Fetch orders
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    // Get total count for pagination info
    const totalOrders = await Order.countDocuments(query);

    // Get aggregates/counts for dashboard metrics
    const stats = await Order.aggregate([
      {
        $group: {
          _id: '$orderStatus',
          count: { $sum: 1 }
        }
      }
    ]);

    // Map stats to an object for easy use on frontend
    const metrics = {
      TOTAL: 0,
      PLACED: 0,
      PROCESSING: 0,
      READY_TO_SHIP: 0,
      DELIVERED: 0,
      CANCELLED: 0
    };

    let totalCount = 0;
    stats.forEach(stat => {
      metrics[stat._id] = stat.count;
      totalCount += stat.count;
    });
    metrics.TOTAL = totalCount;

    res.status(200).json({
      success: true,
      data: orders,
      pagination: {
        totalOrders,
        currentPage: pageNum,
        totalPages: Math.ceil(totalOrders / limitNum),
        limit: limitNum
      },
      metrics
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
      error: error.message
    });
  }
};
