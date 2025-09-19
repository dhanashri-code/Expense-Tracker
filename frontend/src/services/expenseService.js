import axios from 'axios';

const API = 'http://localhost:5000/api';

export const getExpenses = () => axios.get(`${API}/expenses`);
export const getExpenseById = (id) => axios.get(`${API}/expenses/${id}`);

export const addExpense = (data) => axios.post(`${API}/expenses`, data);
export const updateExpense = (id, data) => axios.put(`${API}/expenses/${id}`, data);

export const getGroupedExpenses = async () => {
  const res = await fetch(`${API}/expenses/grouped`);
  return res.json();
};

export const deleteExpense = (id) => axios.delete(`${API}/expenses/${id}`);
export const addInstallment = (expenseId, data) => axios.post(`${API}/installments/${expenseId}`, data);

export const getExpenseInsights = async (filter = 'all', dateRange = null) => {
  let url = `${API}/insights/dashboard?filter=${filter}`;
  if (dateRange) {
    const { startDate, endDate } = dateRange;
    url += `&startDate=${startDate}&endDate=${endDate}`;
  }
  const res = await axios.get(url);
  return res.data;
};

// ✅ FIXED: now supports sending data to AI API
export const getAIInsights = async (data) => {
  const res = await axios.post(`${API}/insights/ai`, data);
  return res.data;
};

