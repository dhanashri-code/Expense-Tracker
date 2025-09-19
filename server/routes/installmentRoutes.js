const express = require("express");
const router = express.Router();
const { addInstallment } = require("../controllers/installmentsController");

router.post("/:expenseId", addInstallment);

module.exports = router;
