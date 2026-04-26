const mongoose = require("mongoose");

const choiceSchema = new mongoose.Schema(
  {
    text: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const questionSchema = new mongoose.Schema(
  {
    prompt: { type: String, required: true, trim: true },
    choices: {
      type: [choiceSchema],
      validate: {
        validator: (choices) => choices.length >= 2,
        message: "Each question must have at least two choices.",
      },
    },
    correctAnswerIndex: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

const quizSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    questions: {
      type: [questionSchema],
      validate: {
        validator: (questions) => questions.length > 0,
        message: "Quiz must contain at least one question.",
      },
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
    timerInSeconds: {
      type: Number,
      default: null,
      min: 10,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Quiz", quizSchema);
