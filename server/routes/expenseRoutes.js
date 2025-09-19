const express = require('express');
const router = express.Router();
const {
  addExpense,
  getExpenses,
  getGroupedExpenses,
  deleteExpense,
  updateExpense,
  getExpenseById,
} = require('../controllers/expenseController');

router.post('/', addExpense);
router.get('/', getExpenses);
router.get('/grouped', getGroupedExpenses);
router.delete('/:id', deleteExpense);
router.put('/:id', updateExpense);
router.get('/:id', getExpenseById);

module.exports = router;
