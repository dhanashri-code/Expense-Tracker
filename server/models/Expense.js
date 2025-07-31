const mongoose = require("mongoose");

// Sub-schema for installments
const installmentSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  note: { type: String },
  date: { type: Date, default: Date.now },
});

// Main expense schema
const expenseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  amount: { type: Number, required: true },
  type: { type: String, enum: ["debit", "credit"], required: true },
  category: String,
  date: { type: Date, default: Date.now },
  installments: [installmentSchema], // ✅ Added field
});

// Virtuals for derived values
expenseSchema.virtual("totalPaid").get(function () {
  return this.installments.reduce((sum, i) => sum + i.amount, 0);
});

expenseSchema.virtual("remaining").get(function () {
  return this.amount - this.totalPaid;
});

expenseSchema.virtual("status").get(function () {
  return this.remaining <= 0 ? "Cleared" : "Pending";
});

// Enable virtuals in JSON output
expenseSchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model("Expense", expenseSchema);
