import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client";

const newQuestion = () => ({
  prompt: "",
  choices: [{ text: "" }, { text: "" }],
  correctAnswerIndex: 0,
});

const CreateQuizPage = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [timerInSeconds, setTimerInSeconds] = useState("");
  const [questions, setQuestions] = useState([newQuestion()]);
  const [error, setError] = useState("");

  const updateQuestion = (questionIndex, updater) => {
    setQuestions((prev) =>
      prev.map((q, idx) => (idx === questionIndex ? updater(q) : q))
    );
  };

  const addChoice = (questionIndex) => {
    updateQuestion(questionIndex, (q) => ({
      ...q,
      choices: [...q.choices, { text: "" }],
    }));
  };

  const addQuestion = () => setQuestions((prev) => [...prev, newQuestion()]);

  const submit = async (event) => {
    event.preventDefault();
    setError("");

    try {
      await api.post("/quizzes", {
        title,
        description,
        isPublic,
        timerInSeconds: timerInSeconds ? Number(timerInSeconds) : null,
        questions,
      });
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create quiz.");
    }
  };

  return (
    <section className="card">
      <h1>Create Quiz</h1>
      <form className="form" onSubmit={submit}>
        <label>
          Title
          <input required value={title} onChange={(e) => setTitle(e.target.value)} />
        </label>
        <label>
          Description
          <textarea
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </label>
        <label>
          Quiz Visibility
          <select
            value={isPublic ? "public" : "private"}
            onChange={(e) => setIsPublic(e.target.value === "public")}
          >
            <option value="public">Public</option>
            <option value="private">Private</option>
          </select>
        </label>
        <label>
          Timer in seconds (optional, min 10)
          <input
            type="number"
            min={10}
            value={timerInSeconds}
            onChange={(e) => setTimerInSeconds(e.target.value)}
          />
        </label>

        {questions.map((question, qIdx) => (
          <div key={qIdx} className="question-box">
            <h3>Question {qIdx + 1}</h3>
            <label>
              Prompt
              <input
                required
                value={question.prompt}
                onChange={(e) =>
                  updateQuestion(qIdx, (q) => ({ ...q, prompt: e.target.value }))
                }
              />
            </label>
            {question.choices.map((choice, cIdx) => (
              <label key={cIdx}>
                Choice {cIdx + 1}
                <input
                  required
                  value={choice.text}
                  onChange={(e) =>
                    updateQuestion(qIdx, (q) => ({
                      ...q,
                      choices: q.choices.map((c, idx) =>
                        idx === cIdx ? { text: e.target.value } : c
                      ),
                    }))
                  }
                />
              </label>
            ))}
            <button type="button" className="secondary" onClick={() => addChoice(qIdx)}>
              + Add Choice
            </button>
            <label>
              Correct Answer
              <select
                value={question.correctAnswerIndex}
                onChange={(e) =>
                  updateQuestion(qIdx, (q) => ({
                    ...q,
                    correctAnswerIndex: Number(e.target.value),
                  }))
                }
              >
                {question.choices.map((_, cIdx) => (
                  <option key={cIdx} value={cIdx}>
                    Choice {cIdx + 1}
                  </option>
                ))}
              </select>
            </label>
          </div>
        ))}
        <button type="button" className="secondary" onClick={addQuestion}>
          + Add Question
        </button>
        {error && <p className="error">{error}</p>}
        <button type="submit">Save Quiz</button>
      </form>
    </section>
  );
};

export default CreateQuizPage;
