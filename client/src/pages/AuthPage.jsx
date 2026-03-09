import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { login, signup } from "../api/api";
import { loginSuccess } from "../redux/slices/authSlice";
import { useToast } from "../components/ToastProvider";
import "./AuthPage.scss";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const AuthPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState("login");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const validateEmail = (value) => emailRegex.test(value);

  const handleLogin = async () => {
    if (!email) return toast.error("Email is required.");
    if (!validateEmail(email)) return toast.error("Invalid email address.");
    if (!password) return toast.error("Password is required.");

    try {
      setLoading(true);
      const response = await login({ email, password });
      if (response.data?.success) {
        dispatch(loginSuccess(response.data.message));
        toast.success("Logged in successfully.");
        navigate("/", { replace: true });
      } else {
        toast.error(response.data?.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed. Email or password is incorrect.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    if (!name) return toast.error("Name is required.");
    if (!email) return toast.error("Email is required.");
    if (!validateEmail(email)) return toast.error("Invalid email address.");
    if (password.length < 6) return toast.error("Password must be at least 6 characters.");
    if (password !== confirmPassword) return toast.error("Password and confirm password do not match.");

    try {
      setLoading(true);
      const response = await signup({ name, email, password });
      if (response.data?.success) {
        dispatch(loginSuccess(response.data.message));
        toast.success("Account created successfully.");
        navigate("/", { replace: true });
      } else {
        toast.error(response.data?.message);
      }
    } catch (error) {
      toast.error("Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-card">
        <header className="auth-card__header">
          <h1>CipherSQLStudio</h1>
          <p>Secure access for SQL assignments and query validation.</p>
        </header>

        <div className="auth-card__tabs">
          <button
            type="button"
            className={activeTab === "login" ? "is-active" : ""}
            onClick={() => setActiveTab("login")}
          >
            Login
          </button>
            <button
              type="button"
              className={activeTab === "signup" ? "is-active" : ""}
              onClick={() => setActiveTab("signup")}
            >
              Sign Up
            </button>
        </div>

        {activeTab === "login" && (
          <div className="auth-card__form">
            <input
              placeholder="Email address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              placeholder="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button type="button" onClick={handleLogin} disabled={loading}>
              {loading ? "Please wait..." : "Login"}
            </button>
          </div>
        )}

        { activeTab === "signup" && (
          <div className="auth-card__form">
            <input
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              placeholder="Email address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              placeholder="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <input
              placeholder="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <button type="button" onClick={handleSignUp} disabled={loading}>
              {loading ? "Please wait..." : "Create Account"}
            </button>
          </div>
        )}
      </section>
    </main>
  );
};

export default AuthPage;
