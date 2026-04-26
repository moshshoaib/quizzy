const express = require("express");
const {
  createQuiz,
  getMyAttemptForQuiz,
  getQuizById,
  listQuizzes,
  submitQuiz,
} = require("../controllers/quizController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);
router.route("/").get(listQuizzes).post(createQuiz);
router.get("/:id", getQuizById);
router.post("/:id/submit", submitQuiz);
router.get("/:id/my-attempts", getMyAttemptForQuiz);

module.exports = router;
