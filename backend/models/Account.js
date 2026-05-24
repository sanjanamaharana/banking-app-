const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const accountSchema = new mongoose.Schema(
  {
    user:          { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    accountNumber: { type: String, unique: true },
    accountType:   { type: String, enum: ['savings', 'checking', 'fixed_deposit'], default: 'savings' },
    balance:       { type: Number, default: 0, min: 0 },
    currency:      { type: String, default: 'USD' },
    isActive:      { type: Boolean, default: true },
    interestRate:  { type: Number, default: 3.5 },
    pin:           { type: String },           // hashed 4-digit PIN
  },
  { timestamps: true }
);

// Auto-generate account number
accountSchema.pre('save', function (next) {
  if (!this.accountNumber) {
    this.accountNumber = 'ACC' + Date.now().toString().slice(-8) + Math.floor(Math.random() * 100);
  }
  next();
});

module.exports = mongoose.model('Account', accountSchema);
