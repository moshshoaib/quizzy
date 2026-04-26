import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/client";

const TakeQuizPage = () => {
  const { id } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const { data } = await api.get(`/quizzes/${id}`);
        setQuiz(data);
        if (data.timerInSeconds) {
          setTimeLeft(data.timerInSeconds);
        }
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load quiz.");
      }
    };
    fetchQuiz();
  }, [id]);

  const answerArray = useMemo(
    () => quiz?.questions.map((question) => answers[question.questionIndex] ?? -1) || [],
    [answers, quiz]
  );

  const submit = useCallback(async () => {
    try {
      const { data } = await api.post(`/quizzes/${id}/submit`, { answers: answerArray });
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit quiz.");
    }
  }, [answerArray, id]);

  useEffect(() => {
    if (typeof timeLeft !== "number" || result || timeLeft <= 0) return undefined;

    const timerId = window.setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => window.clearInterval(timerId);
  }, [timeLeft, result]);

  useEffect(() => {
    if (timeLeft !== 0 || result) return;
    const timeoutId = window.setTimeout(() => {
      submit();
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [timeLeft, result, submit]);

  if (error) return <p className="error">{error}</p>;
  if (!quiz) return <p className="loading">Loading quiz...</p>;

  return (
    <section className="card">
      <h1>{quiz.title}</h1>
      <p>{quiz.description}</p>
      {typeof timeLeft === "number" && timeLeft > -1 && (
        <p className="muted">Time left: {Math.max(timeLeft, 0)}s</p>
      )}
      {quiz.questions.map((question) => (
        <div key={question.questionIndex} className="question-box">
          <h3>
            Q{question.questionIndex + 1}: {question.prompt}
          </h3>
          <div className="choice-list">
            {question.choices.map((choice) => (
              <label key={choice.index} className="choice-item">
                <input
                  type="radio"
                  name={`q-${question.questionIndex}`}
                  checked={answers[question.questionIndex] === choice.index}
                  onChange={() =>
                    setAnswers((prev) => ({
                      ...prev,
                      [question.questionIndex]: choice.index,
                    }))
                  }
                />
                {choice.text}
              </label>
            ))}
          </div>
        </div>
      ))}

      {!result ? (
        <button onClick={submit} type="button">
          Submit Quiz
        </button>
      ) : (
        <div className="result-box">
          <h2>Your Score</h2>
          <p>
            {result.score}/{result.totalQuestions} ({result.percentage}%)
          </p>
        </div>
      )}
    </section>
  );
};

export default TakeQuizPage;
