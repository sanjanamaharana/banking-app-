const Account = require("../models/Account");
const Transaction = require("../models/Transaction");

// POST /api/transactions/deposit
exports.deposit = async (req, res) => {
  try {
    const { accountId, amount, description, category } = req.body;
    if (amount <= 0)
      return res
        .status(400)
        .json({ success: false, message: "Amount must be positive" });

    const account = await Account.findOne({
      _id: accountId,
      user: req.user._id,
      isActive: true,
    });
    if (!account)
      return res
        .status(404)
        .json({ success: false, message: "Account not found" });

    account.balance += Number(amount);
    await account.save();

    const txn = await Transaction.create({
      toAccount: account._id,
      type: "deposit",
      amount,
      description: description || "Deposit",
      category: category || "other",
      balanceAfter: account.balance,
    });

    res
      .status(201)
      .json({ success: true, transaction: txn, newBalance: account.balance });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/transactions/withdraw
exports.withdraw = async (req, res) => {
  try {
    const { accountId, amount, description, category } = req.body;
    if (amount <= 0)
      return res
        .status(400)
        .json({ success: false, message: "Amount must be positive" });

    const account = await Account.findOne({
      _id: accountId,
      user: req.user._id,
      isActive: true,
    });
    if (!account)
      return res
        .status(404)
        .json({ success: false, message: "Account not found" });
    if (account.balance < amount)
      return res
        .status(400)
        .json({ success: false, message: "Insufficient funds" });

    account.balance -= Number(amount);
    await account.save();

    const txn = await Transaction.create({
      fromAccount: account._id,
      type: "withdrawal",
      amount,
      description: description || "Withdrawal",
      category: category || "other",
      balanceAfter: account.balance,
    });

    res
      .status(201)
      .json({ success: true, transaction: txn, newBalance: account.balance });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/transactions/transfer
exports.transfer = async (req, res) => {
  try {
    const { fromAccountId, toAccountNumber, amount, description } = req.body;
    if (amount <= 0)
      return res
        .status(400)
        .json({ success: false, message: "Amount must be positive" });

    const fromAccount = await Account.findOne({
      _id: fromAccountId,
      user: req.user._id,
      isActive: true,
    });
    if (!fromAccount)
      return res
        .status(404)
        .json({ success: false, message: "Source account not found" });
    if (fromAccount.balance < amount)
      return res
        .status(400)
        .json({ success: false, message: "Insufficient funds" });

    const toAccount = await Account.findOne({
      accountNumber: toAccountNumber,
      isActive: true,
    });
    if (!toAccount)
      return res
        .status(404)
        .json({ success: false, message: "Destination account not found" });
    if (fromAccount._id.equals(toAccount._id))
      return res
        .status(400)
        .json({
          success: false,
          message: "Cannot transfer to the same account",
        });

    const transferAmount = Number(amount);
    fromAccount.balance -= transferAmount;
    toAccount.balance += transferAmount;

    await fromAccount.save();
    try {
      await toAccount.save();
    } catch (saveErr) {
      // Roll back the debit if crediting the destination fails
      fromAccount.balance += transferAmount;
      await fromAccount.save();
      throw saveErr;
    }

    const txn = await Transaction.create({
      fromAccount: fromAccount._id,
      toAccount: toAccount._id,
      type: "transfer",
      amount: transferAmount,
      description: description || "Transfer",
      category: "transfer",
      balanceAfter: fromAccount.balance,
    });

    res
      .status(201)
      .json({
        success: true,
        transaction: txn,
        newBalance: fromAccount.balance,
      });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// GET /api/transactions — all transactions for user's accounts
exports.getTransactions = async (req, res) => {
  try {
    const accounts = await Account.find({ user: req.user._id });
    const accountIds = accounts.map((a) => a._id);

    const { page = 1, limit = 20, type, startDate, endDate } = req.query;
    const filter = {
      $or: [
        { fromAccount: { $in: accountIds } },
        { toAccount: { $in: accountIds } },
      ],
    };
    if (type) filter.type = type;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const total = await Transaction.countDocuments(filter);
    const transactions = await Transaction.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate("fromAccount", "accountNumber accountType")
      .populate("toAccount", "accountNumber accountType");

    res.json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      transactions,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
