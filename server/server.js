const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const expenseRoutes = require('./routes/expenseRoutes');
const installmentRoutes = require("./routes/installmentRoutes");
const predictRoutes = require('./routes/predictRoutes');
const insightRoutes = require('./routes/insightRoutes');



dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Server is running!');
});

// Routes
app.use('/api/expenses', expenseRoutes);
app.use("/api/installments", installmentRoutes);
// Add this line after other routes
app.use('/api/predict', predictRoutes);
app.use('/api/insights', insightRoutes);

// Connect DB and start server
connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
