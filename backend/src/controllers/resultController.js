const mongoose = require("mongoose");
const Attempt = require("../models/Attempt");
const Quiz = require("../models/Quiz");

const ensureOwner = async (quizId, userId) => {
  if (!mongoose.Types.ObjectId.isValid(quizId)) return null;
  const quiz = await Quiz.findById(quizId);
  if (!quiz) return null;
  const isOwner = String(quiz.creator) === String(userId);
  if (!isOwner) return false;
  return quiz;
};

const getQuizResultsForOwner = async (req, res) => {
  const ownershipCheck = await ensureOwner(req.params.quizId, req.user._id);
  if (ownershipCheck === null) {
    return res.status(404).json({ message: "Quiz not found" });
  }
  if (ownershipCheck === false) {
    return res.status(403).json({
      message: "Only the quiz creator can access participant results.",
    });
  }

  const attempts = await Attempt.find({ quiz: req.params.quizId })
    .populate("participant", "name email")
    .sort({ createdAt: -1 });

  const totalAttempts = attempts.length;
  const totalScore = attempts.reduce((sum, attempt) => sum + attempt.score, 0);
  const averageScore = totalAttempts
    ? Number((totalScore / totalAttempts).toFixed(2))
    : 0;

  return res.json({
    quiz: {
      id: ownershipCheck._id,
      title: ownershipCheck.title,
      description: ownershipCheck.description,
      totalQuestions: ownershipCheck.questions.length,
    },
    analytics: {
      totalAttempts,
      averageScore,
    },
    attempts: attempts.map((attempt) => ({
      id: attempt._id,
      participant: attempt.participant,
      score: attempt.score,
      totalQuestions: attempt.totalQuestions,
      createdAt: attempt.createdAt,
    })),
  });
};

const getCreatorDashboard = async (req, res) => {
  const quizzes = await Quiz.find({ creator: req.user._id }).sort({ createdAt: -1 });
  const quizIds = quizzes.map((quiz) => quiz._id);

  const attempts = await Attempt.find({ quiz: { $in: quizIds } });
  const attemptsByQuiz = new Map();

  for (const attempt of attempts) {
    const key = String(attempt.quiz);
    const existing = attemptsByQuiz.get(key) || [];
    existing.push(attempt);
    attemptsByQuiz.set(key, existing);
  }

  const summary = quizzes.map((quiz) => {
    const quizAttempts = attemptsByQuiz.get(String(quiz._id)) || [];
    const totalAttempts = quizAttempts.length;
    const averageScore = totalAttempts
      ? Number(
          (
            quizAttempts.reduce((sum, attempt) => sum + attempt.score, 0) / totalAttempts
          ).toFixed(2)
        )
      : 0;

    return {
      id: quiz._id,
      title: quiz.title,
      description: quiz.description,
      totalQuestions: quiz.questions.length,
      isPublic: quiz.isPublic,
      timerInSeconds: quiz.timerInSeconds,
      totalAttempts,
      averageScore,
      createdAt: quiz.createdAt,
    };
  });

  return res.json({
    totalQuizzes: quizzes.length,
    quizzes: summary,
  });
};

module.exports = {
  getQuizResultsForOwner,
  getCreatorDashboard,
};
