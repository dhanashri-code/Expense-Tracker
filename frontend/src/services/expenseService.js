import axios from 'axios';

const API = 'http://localhost:5000/api';

export const getExpenses = () => axios.get(`${API}/expenses`);
export const getExpenseById = (id) => axios.get(`${API}/expenses/${id}`);

export const addExpense = (data) => axios.post(`${API}/expenses`, data);
export const updateExpense = (id, data) => axios.put(`${API}/expenses/${id}`, data);
export const deleteExpense = (id) => axios.delete(`${API}/expenses/${id}`);
export const addInstallment = (expenseId, data) => axios.post(`${API}/installments/${expenseId}`, data);
