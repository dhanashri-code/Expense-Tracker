const Expense = require('../models/Expense');
const axios = require('axios');

/* @desc Add new expense
exports.addExpense = async (req, res) => {
  try {
    const newExpense = await Expense.create(req.body);
    res.status(201).json(newExpense);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}; */
exports.addExpense = async (req, res) => {
  try {
    console.log("Incoming Expense Data:", req.body);

    const {
      title,
      amount,
      type,
      paymentType,
      totalInstallments,
      category,
      predictedCategory
    } = req.body;

    const newExpense = new Expense({
      title,
      amount,
      type,
      paymentType,
      category: category || predictedCategory || 'Other', // Save category
      predictedCategory: predictedCategory || '',         // Save AI suggestion
      totalInstallments:
        paymentType === 'installment' && type === 'debit'
          ? totalInstallments || 0
          : 0,
    });
    console.log("add expense - ",newExpense);
    await newExpense.save();
    res.status(201).json(newExpense);
  } catch (error) {
    res.status(500).json({ message: 'Failed to add expense', error });
  }
};

// @desc Get all expenses (can add filters later)
exports.getExpenses = async (req, res) => {
  try {
    const { type, category, startDate, endDate } = req.query;

    let query = {};

    if (type) query.type = type;
    if (category) query.category = category;
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const expenses = await Expense.find(query).sort({ date: -1 });
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getGroupedExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find();
    console.log('Expenses fetched:', expenses.length);

    const grouped = expenses.reduce((acc, expense) => {
      const key = expense.title ? expense.title.trim().toLowerCase() : '';
      if (!key) {
        console.log('Skipping expense with invalid name:', expense);
        return acc;
      }
      if (!acc[key]) {
        acc[key] = {
          title: expense.title.trim(),
          transactions: []
        };
      }
      acc[key].transactions.push(expense);
      return acc;
    }, {});

    console.log('Grouped object:', grouped); // Debug
    res.json(Object.values(grouped));
  } catch (error) {
    console.error('Error in getGroupedExpenses:', error);
    res.status(500).json({ message: 'Failed to fetch grouped expenses', error: error.message });
  }
};

// @desc Delete expense
exports.deleteExpense = async (req, res) => {
  try {
    const deleted = await Expense.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Expense not found' });
    res.json({ message: 'Expense deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc Update expense
exports.updateExpense = async (req, res) => {
  try {
    const updated = await Expense.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @desc Get a single expense by ID
exports.getExpenseById = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    res.json(expense);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
