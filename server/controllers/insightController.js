const Expense = require('../models/Expense');
const dayjs = require('dayjs');
const isoWeek = require('dayjs/plugin/isoWeek');
dayjs.extend(isoWeek);


// @desc Get basic insights (legacy)
exports.getInsights = async (req, res) => {
  try {
    const expenses = await Expense.find();

    const monthlyData = {};
    const categoryData = {};

    expenses.forEach(expense => {
      const month = new Date(expense.date).toLocaleString('default', {
        month: 'short',
        year: 'numeric'
      });

      // Monthly totals
      monthlyData[month] = (monthlyData[month] || 0) + expense.amount;

      // Category totals
      categoryData[expense.category || 'Not Specified'] =
        (categoryData[expense.category || 'Not Specified'] || 0) + expense.amount;
    });

    res.status(200).json({
      success: true,
      data: {
        monthly: monthlyData,
        categories: categoryData
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error generating insights',
      error: error.message
    });
  }
};

// @desc Get aggregated expense insights for dashboar

exports.getExpenseInsights = async (req, res) => {
  try {
    const { filter = 'all' } = req.query;
    const now = dayjs();

    let match = {};

    if (filter === 'day') {
      match.date = { $gte: now.startOf('day').toDate(), $lte: now.endOf('day').toDate() };
    } else if (filter === 'week') {
      match.date = { $gte: now.startOf('week').toDate(), $lte: now.endOf('week').toDate() };
    } else if (filter === 'month') {
      match.date = { $gte: now.startOf('month').toDate(), $lte: now.endOf('month').toDate() };
    } else if (filter === 'year') {
      match.date = { $gte: now.startOf('year').toDate(), $lte: now.endOf('year').toDate() };
    }

    const pipeline = [
      { $match: match },
      {
        $facet: {
          total: [
            {
              $group: {
                _id: null,
                totalAmount: { $sum: '$amount' },
                totalCredit: { $sum: { $cond: [{ $eq: ['$type', 'credit'] }, '$amount', 0] } },
                totalDebit: { $sum: { $cond: [{ $eq: ['$type', 'debit'] }, '$amount', 0] } },
                countCredit: { $sum: { $cond: [{ $eq: ['$type', 'credit'] }, 1, 0] } },
                countDebit: { $sum: { $cond: [{ $eq: ['$type', 'debit'] }, 1, 0] } }
              }
            }
          ],
          monthlyData: [
            {
              $addFields: {
                weekOfMonth: { $ceil: { $divide: [{ $dayOfMonth: '$date' }, 7] } }
              }
            },
            {
              $group: {
                _id: filter === 'month' ? '$weekOfMonth' : '$date',
                amount: { $sum: '$amount' }
              }
            },
            {
              $project: {
                month: '$_id',
                amount: 1,
                _id: 0
              }
            },
            { $sort: { month: 1 } }
          ],
          paymentData: [
            {
              $group: {
                _id: { $ifNull: ['$paymentType', 'Unknown'] },
                value: { $sum: '$amount' }
              }
            },
            { $project: { name: '$_id', value: 1, _id: 0 } }
          ],
          categoryData: [
            {
              $group: {
                _id: { $ifNull: ['$category', 'Not Specified'] },
                value: { $sum: '$amount' }
              }
            },
            { $project: { name: '$_id', value: 1, _id: 0 } }
          ],
          payableData: [
            { $match: { type: 'debit' } },
            {
              $group: {
                _id: '$title',
                amount: { $sum: '$amount' }
              }
            },
            { $project: { name: '$_id', amount: 1, _id: 0 } }
          ]
        }
      }
    ];

    const result = await Expense.aggregate(pipeline);

    res.json({
      totalAmount: result[0].total[0]?.totalAmount || 0,
      totalCredit: result[0].total[0]?.totalCredit || 0,
      totalDebit: result[0].total[0]?.totalDebit || 0,
      countCredit: result[0].total[0]?.countCredit || 0,
      countDebit: result[0].total[0]?.countDebit || 0,
      monthlyData: result[0].monthlyData,
      paymentData: result[0].paymentData,
      categoryData: result[0].categoryData,
      payableData: result[0].payableData
    });

  } catch (error) {
    console.error('Error fetching insights:', error);
    res.status(500).json({ message: 'Failed to fetch insights' });
  }
};

// @desc AI Spending Insights (simple mock for now)
// Simple AI-like insights without OpenAI

exports.getAIInsights = async (req, res) => {
  try {
    const {
      totalAmount,
      totalCredit,
      totalDebit,
      monthlyData = [],
      categoryData = [],
      paymentData = [],
      payableData = [],
      filter,
    } = req.body;

    let summary = `📊 Financial Insights (${filter || "All Time"}):\n`;

    // Debit vs Credit
    if (totalDebit > totalCredit) {
      summary += `- Spending (₹${totalDebit}) is higher than income (₹${totalCredit}). Try to save more.\n`;
    } else if (totalCredit > totalDebit) {
      summary += `- Income (₹${totalCredit}) exceeds spending (₹${totalDebit}). Good job!\n`;
    } else {
      summary += `- Income and spending are balanced.\n`;
    }

    // Peak month
    if (monthlyData.length > 0) {
      const peak = monthlyData.reduce((a, b) => (a.amount > b.amount ? a : b));
      summary += `- Highest spending in ${peak.month} (₹${peak.amount}).\n`;
    }

    // Top category
    if (categoryData.length > 0) {
      const topCategory = categoryData.reduce((a, b) => (a.value > b.value ? a : b));
      summary += `- Most spent on '${topCategory.name}' (₹${topCategory.value}).\n`;
    }

    // Payment method
    if (paymentData.length > 0) {
      const topPay = paymentData.reduce((a, b) => (a.value > b.value ? a : b));
      summary += `- Most payments done via ${topPay.name} (₹${topPay.value}).\n`;
    }

    // Biggest payable
    if (payableData.length > 0) {
      const topBill = payableData.reduce((a, b) => (a.amount > b.amount ? a : b));
      summary += `- Biggest pending bill: '${topBill.name}' (₹${topBill.amount}).\n`;
    }

    res.json({ summary });
  } catch (err) {
    console.error("AI Insights error:", err.message);
    res.status(500).json({ error: "Failed to generate insights" });
  }
};

