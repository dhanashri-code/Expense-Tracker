const Expense = require("../models/Expense");

// @desc Add installment to a debit expense
exports.addInstallment = async (req, res) => {
  const { expenseId } = req.params;
  const { amount, note } = req.body;

  try {
    const expense = await Expense.findById(expenseId);
    if (!expense) return res.status(404).json({ error: "Expense not found" });

    if (expense.type !== "debit") {
      return res.status(400).json({ error: "Installments allowed only for debit expenses" });
    }

    // Add installment with paidAmount
    expense.installments.push({
      amount,
      paidAmount: amount,
      note
    });

    await expense.save();

    res.status(200).json(expense.toJSON());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
