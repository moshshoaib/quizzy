import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";
import { useAuth } from "../hooks/useAuth";

const QuizListPage = () => {
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const { data } = await api.get("/quizzes");
        setQuizzes(data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load quizzes.");
      }
    };
    fetchQuizzes();
  }, []);

  return (
    <section>
      <div className="page-title-row">
        <h1>Available Quizzes</h1>
        <Link to="/create-quiz" className="button-like">
          + Create Quiz
        </Link>
      </div>
      {error && <p className="error">{error}</p>}
      <div className="grid">
        {quizzes.map((quiz) => {
          const isOwner = quiz.creator?.email === user?.email;
          return (
            <article key={quiz.id} className="card">
              <h3>{quiz.title}</h3>
              <p>{quiz.description}</p>
              <p className="muted">
                {quiz.questionCount} questions | By {quiz.creator?.name}
              </p>
              <p className="muted">
                {quiz.isPublic ? "Public quiz" : "Private quiz"}{" "}
                {quiz.timerInSeconds ? `| ${quiz.timerInSeconds}s timer` : ""}
              </p>
              <div className="actions">
                <Link to={`/quizzes/${quiz.id}`}>Take Quiz</Link>
                {isOwner && <Link to={`/dashboard/quiz/${quiz.id}`}>View Results</Link>}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};

export default QuizListPage;
