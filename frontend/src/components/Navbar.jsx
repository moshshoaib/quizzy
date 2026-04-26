import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="navbar">
      <Link to="/" className="brand">
        Quizzy
      </Link>
      {isAuthenticated ? (
        <nav className="nav-links">
          <NavLink to="/quizzes">Quizzes</NavLink>
          <NavLink to="/create-quiz">Create Quiz</NavLink>
          <NavLink to="/dashboard">Dashboard</NavLink>
          <span className="user-chip">{user?.name}</span>
          <button type="button" className="secondary" onClick={handleLogout}>
            Logout
          </button>
        </nav>
      ) : (
        <nav className="nav-links">
          <NavLink to="/login">Login</NavLink>
          <NavLink to="/register">Register</NavLink>
        </nav>
      )}
    </header>
  );
};

export default Navbar;
