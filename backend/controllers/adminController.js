const User = require('../models/User');
const Account = require('../models/Account');
const Transaction = require('../models/Transaction');

// GET /api/admin/dashboard — summary stats
exports.getDashboard = async (req, res) => {
  try {
    const [totalUsers, totalAccounts, txnStats, recentUsers] = await Promise.all([
      User.countDocuments({ role: 'customer' }),
      Account.countDocuments({ isActive: true }),
      Transaction.aggregate([
        { $group: { _id: '$type', total: { $sum: '$amount' }, count: { $sum: 1 } } },
      ]),
      User.find({ role: 'customer' }).sort({ createdAt: -1 }).limit(5).select('-password'),
    ]);

    const totalBalance = await Account.aggregate([{ $group: { _id: null, total: { $sum: '$balance' } } }]);

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalAccounts,
        totalBalance: totalBalance[0]?.total || 0,
        transactions: txnStats,
      },
      recentUsers,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/admin/users
exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const filter = { role: 'customer' };
    if (search) filter.$or = [
      { firstName: new RegExp(search, 'i') },
      { lastName: new RegExp(search, 'i') },
      { email: new RegExp(search, 'i') },
    ];
    const total = await User.countDocuments(filter);
    const users = await User.find(filter).select('-password').sort({ createdAt: -1 })
      .skip((page - 1) * limit).limit(Number(limit));
    res.json({ success: true, total, users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/admin/users/:id/toggle — activate/deactivate
exports.toggleUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || user.role === 'admin') return res.status(404).json({ success: false, message: 'User not found' });
    user.isActive = !user.isActive;
    await user.save();
    res.json({ success: true, isActive: user.isActive, message: `User ${user.isActive ? 'activated' : 'deactivated'}` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/admin/transactions
exports.getAllTransactions = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const total = await Transaction.countDocuments();
    const transactions = await Transaction.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate({ path: 'fromAccount', populate: { path: 'user', select: 'firstName lastName' } })
      .populate({ path: 'toAccount',   populate: { path: 'user', select: 'firstName lastName' } });
    res.json({ success: true, total, transactions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
