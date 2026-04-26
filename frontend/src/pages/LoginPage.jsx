import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/client";
import { useAuth } from "../hooks/useAuth";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      const { data } = await api.post("/auth/login", form);
      login(data);
      navigate("/quizzes");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="card auth-card">
      <h1>Login</h1>
      <form onSubmit={onSubmit} className="form">
        <label>
          Email
          <input
            required
            type="email"
            name="email"
            value={form.email}
            onChange={onChange}
          />
        </label>
        <label>
          Password
          <input
            required
            minLength={6}
            type="password"
            name="password"
            value={form.password}
            onChange={onChange}
          />
        </label>
        {error && <p className="error">{error}</p>}
        <button disabled={isSubmitting} type="submit">
          {isSubmitting ? "Signing in..." : "Login"}
        </button>
      </form>
      <p>
        No account? <Link to="/register">Create one</Link>
      </p>
    </section>
  );
};

export default LoginPage;
