// src/utils/predictCategory.js
import axios from 'axios';

export const predictCategory = async (title) => {
  try {
    const response = await axios.post('https://expense-tracker-1-pjm7.onrender.com/api/predict', { title });
    return response.data.predictedCategory || 'Other';
  } catch (error) {
    console.error("Prediction API error:", error.message);
    return 'Other';
  }
};
