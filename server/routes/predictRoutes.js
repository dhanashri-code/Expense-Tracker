const express = require('express');
const router = express.Router();

// Basic keyword-based category prediction
router.post('/', (req, res) => {
  const { title } = req.body;

  if (!title) {
    return res.status(400).json({ message: 'Title is required' });
  }

  let predicted = 'Other';
  const text = title.toLowerCase();

  if (text.includes('electric')) predicted = 'Electricity';
  else if (text.includes('fuel')) predicted = 'Fuel';
  else if (text.includes('salary')) predicted = 'Salary';
  else if (text.includes('rent')) predicted = 'Rent';
  else if (text.includes('inventory') || text.includes('stock')) predicted = 'Inventory';

  return res.json({ predictedCategory: predicted });
});

module.exports = router;
