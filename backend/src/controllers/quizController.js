const mongoose = require("mongoose");
const Attempt = require("../models/Attempt");
const Quiz = require("../models/Quiz");

const validateQuestions = (questions = []) => {
  if (!Array.isArray(questions) || questions.length === 0) {
    return "Quiz must include at least one question.";
  }

  for (const question of questions) {
    if (!question.prompt || !Array.isArray(question.choices)) {
      return "Every question needs a prompt and choices.";
    }

    if (question.choices.length < 2) {
      return "Each question needs at least two choices.";
    }

    if (
      Number.isInteger(question.correctAnswerIndex) === false ||
      question.correctAnswerIndex < 0 ||
      question.correctAnswerIndex >= question.choices.length
    ) {
      return "Each question must have one valid correct answer index.";
    }
  }

  return null;
};

const createQuiz = async (req, res) => {
  const { title, description, questions, isPublic, timerInSeconds } = req.body;

  if (!title || !description) {
    return res.status(400).json({ message: "Title and description are required." });
  }

  const questionError = validateQuestions(questions);
  if (questionError) {
    return res.status(400).json({ message: questionError });
  }

  const quiz = await Quiz.create({
    title: title.trim(),
    description: description.trim(),
    questions: questions.map((q) => ({
      prompt: q.prompt.trim(),
      choices: q.choices.map((choice) => ({
        text: choice.text.trim(),
      })),
      correctAnswerIndex: q.correctAnswerIndex,
    })),
    creator: req.user._id,
    isPublic: typeof isPublic === "boolean" ? isPublic : true,
    timerInSeconds: timerInSeconds || null,
  });

  return res.status(201).json(quiz);
};

const sanitizeQuizForParticipant = (quiz) => ({
  id: quiz._id,
  title: quiz.title,
  description: quiz.description,
  creator: quiz.creator,
  isPublic: quiz.isPublic,
  timerInSeconds: quiz.timerInSeconds,
  createdAt: quiz.createdAt,
  questions: quiz.questions.map((question, idx) => ({
    questionIndex: idx,
    prompt: question.prompt,
    choices: question.choices.map((choice, choiceIdx) => ({
      index: choiceIdx,
      text: choice.text,
    })),
  })),
});

const listQuizzes = async (req, res) => {
  const quizzes = await Quiz.find({
    $or: [{ isPublic: true }, { creator: req.user._id }],
  })
    .populate("creator", "name email")
    .sort({ createdAt: -1 });

  return res.json(
    quizzes.map((quiz) => ({
      id: quiz._id,
      title: quiz.title,
      description: quiz.description,
      isPublic: quiz.isPublic,
      timerInSeconds: quiz.timerInSeconds,
      creator: quiz.creator,
      questionCount: quiz.questions.length,
      createdAt: quiz.createdAt,
    }))
  );
};

const getQuizById = async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(404).json({ message: "Quiz not found" });
  }

  const quiz = await Quiz.findById(req.params.id).populate("creator", "name email");
  if (!quiz) {
    return res.status(404).json({ message: "Quiz not found" });
  }

  const isOwner = String(quiz.creator._id) === String(req.user._id);
  if (!quiz.isPublic && !isOwner) {
    return res.status(403).json({ message: "This quiz is private." });
  }

  return res.json(sanitizeQuizForParticipant(quiz));
};

const submitQuiz = async (req, res) => {
  const { answers } = req.body;
  if (!Array.isArray(answers)) {
    return res.status(400).json({ message: "Answers must be an array." });
  }

  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(404).json({ message: "Quiz not found" });
  }

  const quiz = await Quiz.findById(req.params.id);
  if (!quiz) {
    return res.status(404).json({ message: "Quiz not found" });
  }

  const isOwner = String(quiz.creator) === String(req.user._id);
  if (!quiz.isPublic && !isOwner) {
    return res.status(403).json({ message: "This quiz is private." });
  }

  const evaluatedAnswers = [];
  let score = 0;

  for (let index = 0; index < quiz.questions.length; index += 1) {
    const selectedChoiceIndex = Number(answers[index]);
    const question = quiz.questions[index];
    const isCorrect = selectedChoiceIndex === question.correctAnswerIndex;
    if (isCorrect) score += 1;

    evaluatedAnswers.push({
      questionIndex: index,
      selectedChoiceIndex: Number.isNaN(selectedChoiceIndex)
        ? -1
        : selectedChoiceIndex,
      isCorrect,
    });
  }

  const attempt = await Attempt.create({
    quiz: quiz._id,
    participant: req.user._id,
    answers: evaluatedAnswers,
    score,
    totalQuestions: quiz.questions.length,
  });

  return res.status(201).json({
    attemptId: attempt._id,
    score,
    totalQuestions: quiz.questions.length,
    percentage: Number(((score / quiz.questions.length) * 100).toFixed(2)),
  });
};

const getMyAttemptForQuiz = async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(404).json({ message: "Quiz not found" });
  }

  const attempts = await Attempt.find({
    quiz: req.params.id,
    participant: req.user._id,
  }).sort({ createdAt: -1 });

  return res.json(attempts);
};

module.exports = {
  createQuiz,
  listQuizzes,
  getQuizById,
  submitQuiz,
  getMyAttemptForQuiz,
};
