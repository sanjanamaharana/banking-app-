const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    fromAccount:  { type: mongoose.Schema.Types.ObjectId, ref: 'Account' },
    toAccount:    { type: mongoose.Schema.Types.ObjectId, ref: 'Account' },
    type: {
      type: String,
      enum: ['deposit', 'withdrawal', 'transfer', 'payment'],
      required: true,
    },
    amount:       { type: Number, required: true, min: 0.01 },
    currency:     { type: String, default: 'USD' },
    description:  { type: String, trim: true },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'reversed'],
      default: 'completed',
    },
    reference:    { type: String, unique: true },
    balanceAfter: { type: Number },              // snapshot of balance after txn
    fee:          { type: Number, default: 0 },
    category: {
      type: String,
      enum: ['food', 'utilities', 'entertainment', 'transfer', 'salary', 'other'],
      default: 'other',
    },
  },
  { timestamps: true }
);

// Auto-generate reference
transactionSchema.pre('save', function (next) {
  if (!this.reference) {
    this.reference = 'TXN' + Date.now() + Math.floor(Math.random() * 9999);
  }
  next();
});

module.exports = mongoose.model('Transaction', transactionSchema);
