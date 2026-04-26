import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";

const DashboardPage = () => {
  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const { data } = await api.get("/results/dashboard");
        setDashboard(data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load dashboard.");
      }
    };
    fetchDashboard();
  }, []);

  if (error) return <p className="error">{error}</p>;
  if (!dashboard) return <p className="loading">Loading dashboard...</p>;

  return (
    <section>
      <div className="page-title-row">
        <h1>Creator Dashboard</h1>
        <span className="muted">{dashboard.totalQuizzes} quizzes created</span>
      </div>
      <div className="grid">
        {dashboard.quizzes.map((quiz) => (
          <article key={quiz.id} className="card">
            <h3>{quiz.title}</h3>
            <p>{quiz.description}</p>
            <p className="muted">Questions: {quiz.totalQuestions}</p>
            <p className="muted">Attempts: {quiz.totalAttempts}</p>
            <p className="muted">Average score: {quiz.averageScore}</p>
            <Link to={`/dashboard/quiz/${quiz.id}`}>View participant results</Link>
          </article>
        ))}
      </div>
    </section>
  );
};

export default DashboardPage;
