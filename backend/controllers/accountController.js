const Account = require('../models/Account');
const Transaction = require('../models/Transaction');

// GET /api/accounts — get all accounts of logged-in user
exports.getMyAccounts = async (req, res) => {
  try {
    const accounts = await Account.find({ user: req.user._id, isActive: true });
    res.json({ success: true, accounts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/accounts/:id — single account detail
exports.getAccount = async (req, res) => {
  try {
    const account = await Account.findOne({ _id: req.params.id, user: req.user._id });
    if (!account) return res.status(404).json({ success: false, message: 'Account not found' });
    res.json({ success: true, account });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/accounts — open a new account
exports.createAccount = async (req, res) => {
  try {
    const { accountType } = req.body;
    const account = await Account.create({ user: req.user._id, accountType });
    res.status(201).json({ success: true, account });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/accounts/:id/statement — mini statement (last 10 txns)
exports.getStatement = async (req, res) => {
  try {
    const account = await Account.findOne({ _id: req.params.id, user: req.user._id });
    if (!account) return res.status(404).json({ success: false, message: 'Account not found' });

    const transactions = await Transaction.find({
      $or: [{ fromAccount: account._id }, { toAccount: account._id }],
    })
      .sort({ createdAt: -1 })
      .limit(Number(req.query.limit) || 10)
      .populate('fromAccount', 'accountNumber')
      .populate('toAccount', 'accountNumber');

    res.json({ success: true, account, transactions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
