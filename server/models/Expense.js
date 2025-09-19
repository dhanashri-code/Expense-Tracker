const mongoose = require("mongoose");

// Sub-schema for installments
const installmentSchema = new mongoose.Schema({
  amount: { type: Number, required: true },        // total installment amount
  paidAmount: { type: Number, default: 0 },        // amount actually paid
  note: { type: String },
  date: { type: Date, default: Date.now },
});

// Main expense schema
const expenseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  amount: { type: Number, required: true },
  type: { type: String, enum: ["debit", "credit"], required: true },
  category: String,
  predictedCategory: { type: String, required: false }, // AI suggested category
  
  date: { type: Date, default: Date.now },

  // Payment method
  paymentType: {
    type: String,
    enum: ["cash", "online", "installment"],
    default: "cash",
  },

  // Installment details
  totalInstallments: { type: Number, default: 0 },
  paidInstallments: { type: Number, default: 0 },
  installments: [installmentSchema],
});

// Virtual: total paid
expenseSchema.virtual("totalPaid").get(function () {
  const installments = this.installments || [];
  return installments.reduce((sum, i) => sum + (i.paidAmount || 0), 0);
});

// Virtual: remaining amount
expenseSchema.virtual("remaining").get(function () {
  return Math.max(0, (this.amount || 0) - this.totalPaid);
});

// Virtual: status
expenseSchema.virtual("status").get(function () {
  if (this.paymentType === "cash" || this.paymentType === "online") {
    return "Cleared";
  }
  return this.remaining <= 0 ? "Cleared" : "Pending";
});

// Enable virtuals in JSON output
expenseSchema.set("toJSON", { virtuals: true });
expenseSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Expense", expenseSchema);
