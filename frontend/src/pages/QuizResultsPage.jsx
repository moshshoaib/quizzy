import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/client";

const QuizResultsPage = () => {
  const { quizId } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await api.get(`/results/quiz/${quizId}`);
        setData(response.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch quiz results.");
      }
    };

    fetchResults();
  }, [quizId]);

  if (error) return <p className="error">{error}</p>;
  if (!data) return <p className="loading">Loading results...</p>;

  return (
    <section className="card">
      <h1>{data.quiz.title} - Owner Results</h1>
      <p>{data.quiz.description}</p>
      <p className="muted">
        Total attempts: {data.analytics.totalAttempts} | Average score:{" "}
        {data.analytics.averageScore}
      </p>

      <div className="result-table-wrap">
        <table className="result-table">
          <thead>
            <tr>
              <th>Participant</th>
              <th>Email</th>
              <th>Score</th>
              <th>Submitted</th>
            </tr>
          </thead>
          <tbody>
            {data.attempts.map((attempt) => (
              <tr key={attempt.id}>
                <td>{attempt.participant?.name}</td>
                <td>{attempt.participant?.email}</td>
                <td>
                  {attempt.score}/{attempt.totalQuestions}
                </td>
                <td>{new Date(attempt.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default QuizResultsPage;
