import moment from 'moment';

export const getTotalAmount = (expenses, type) => {
  return expenses
    .filter((e) => e.type === type)
    .reduce((sum, e) => sum + e.amount, 0);
};

export const getCategoryData = (expenses) => {
  const grouped = {};
  expenses.forEach((e) => {
    if (!grouped[e.category]) grouped[e.category] = 0;
    grouped[e.category] += e.amount;
  });
  return Object.entries(grouped).map(([category, value]) => ({
    name: category,
    value,
  }));
};

export const getMonthlyData = (expenses) => {
  const grouped = {};
  expenses.forEach((e) => {
    const month = moment(e.date).format('MMM YYYY');
    if (!grouped[month]) grouped[month] = 0;
    grouped[month] += e.amount;
  });
  return Object.entries(grouped).map(([month, value]) => ({
    name: month,
    value,
  }));
};
