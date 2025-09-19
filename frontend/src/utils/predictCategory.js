// src/utils/predictCategory.js
import axios from 'axios';

export const predictCategory = async (title) => {
  try {
    const response = await axios.post('http://localhost:5000/api/predict', { title });
    return response.data.predictedCategory || 'Other';
  } catch (error) {
    console.error("Prediction API error:", error.message);
    return 'Other';
  }
};
