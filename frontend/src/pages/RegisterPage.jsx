import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/client";
import { useAuth } from "../hooks/useAuth";

const RegisterPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
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
      const { data } = await api.post("/auth/register", form);
      login(data);
      navigate("/quizzes");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="card auth-card">
      <h1>Register</h1>
      <form onSubmit={onSubmit} className="form">
        <label>
          Name
          <input required name="name" value={form.name} onChange={onChange} />
        </label>
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
          {isSubmitting ? "Creating account..." : "Register"}
        </button>
      </form>
      <p>
        Already registered? <Link to="/login">Login</Link>
      </p>
    </section>
  );
};

export default RegisterPage;
