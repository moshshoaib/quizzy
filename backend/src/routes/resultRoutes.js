const express = require("express");
const {
  getCreatorDashboard,
  getQuizResultsForOwner,
} = require("../controllers/resultController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);
router.get("/dashboard", getCreatorDashboard);
router.get("/quiz/:quizId", getQuizResultsForOwner);

module.exports = router;
