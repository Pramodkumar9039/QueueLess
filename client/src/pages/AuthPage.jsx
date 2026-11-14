
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  FaUser,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaGoogle,
} from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

const AuthPage = ({ initialTab = "login" }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [activeTab, setActiveTab] = useState(initialTab);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const isLogin = activeTab === "login";

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setError("");
    setMessage("");
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const handleChange = (event) => {
    setFormData((previous) => ({
      ...previous,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!isLogin && formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!isLogin && formData.password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    try {
      setLoading(true);

      if (isLogin) {
        await login(formData.email.trim(), formData.password);

        const requestedPage = location.state?.from;

        if (
          requestedPage?.pathname?.startsWith("/") &&
          !requestedPage.pathname.startsWith("//") &&
          requestedPage.pathname !== "/login" &&
          requestedPage.pathname !== "/register"
        ) {
          navigate(
            {
              pathname: requestedPage.pathname,
              search: requestedPage.search || "",
              hash: requestedPage.hash || "",
            },
            { replace: true }
          );
        } else {
          navigate("/dashboard", { replace: true });
        }
      } else {
        const response = await api.post("/auth/register", {
          name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password,
        });

        setMessage(
          response.data.message ||
            "Account created successfully. Please log in."
        );

        setFormData({
          name: "",
          email: formData.email.trim(),
          password: "",
          confirmPassword: "",
        });

        setActiveTab("login");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "h-9 w-full rounded-lg border border-[#D1D1D1] bg-[#FFFFFF] pl-9 pr-9 text-[11px] text-[#141619] outline-none transition placeholder:text-[#141619] focus:border-[#141619] focus:bg-white";

  return (
    <main className="relative flex min-h-[calc(100vh-60px)] items-center justify-center overflow-hidden bg-gradient-to-br from-[#FFFFFF] via-[#FFFFFF] to-[#FFFFFF] px-3 py-5">
      <div className="pointer-events-none absolute -bottom-16 -left-12 h-40 w-40 rounded-full bg-[#FFFFFF]/40 blur-3xl" />
      <div className="pointer-events-none absolute -right-12 -top-16 h-40 w-40 rounded-full bg-sky-200/50 blur-3xl" />

      <section className="relative w-full max-w-[320px]">
        {/* Login and Register tabs */}
        <div className="mx-auto grid h-10 w-[180px] grid-cols-2 overflow-hidden rounded-t-lg bg-white/75">
          <button
            type="button"
            onClick={() => handleTabChange("login")}
            className={`border-b-2 text-[11px] font-semibold transition ${
              isLogin
                ? "border-[#141619] bg-white text-[#141619]"
                : "border-transparent text-[#141619] hover:bg-[#F3F3F3]/70"
            }`}
          >
            Login
          </button>

          <button
            type="button"
            onClick={() => handleTabChange("register")}
            className={`border-b-2 text-[11px] font-semibold transition ${
              !isLogin
                ? "border-[#141619] bg-white text-[#141619]"
                : "border-transparent text-[#141619] hover:bg-[#F3F3F3]/70"
            }`}
          >
            Register
          </button>
        </div>

        {/* Compact authentication card*/}
        <div className="rounded-xl border border-white/80 bg-white px-4 py-4 shadow-[0_12px_35px_rgba(63,95,140,0.12)]">
          <div className="mb-3 text-center">
            <h1 className="text-[18px] font-bold tracking-tight text-[#141619]">
              {isLogin ? "Welcome Back" : "Create Account"}
            </h1>

            <p className="mt-1 text-[10px] text-[#141619]">
              {isLogin
                ? "Login to continue to QueueLess"
                : "Register to get started with QueueLess"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-2">
            {!isLogin && (
              <div className="relative">
                <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-[11px] text-[#141619]" />
                <input
                  type="text"
                  name="name"
                  placeholder="Full name"
                  autoComplete="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className={inputClass}
                />
              </div>
            )}

            <div className="relative">
              <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-[11px] text-[#141619]" />
              <input
                type="email"
                name="email"
                placeholder="Email address"
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                required
                className={inputClass}
              />
            </div>

            <div className="relative">
              <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-[11px] text-[#141619]" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                autoComplete={isLogin ? "current-password" : "new-password"}
                value={formData.password}
                onChange={handleChange}
                minLength={isLogin ? undefined : 8}
                required
                className={inputClass}
              />

              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-[#141619]"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            {!isLogin && (
              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-[11px] text-[#141619]" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Confirm password"
                  autoComplete="new-password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  minLength={8}
                  required
                  className={inputClass}
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword((value) => !value)
                  }
                  aria-label={
                    showConfirmPassword
                      ? "Hide confirm password"
                      : "Show confirm password"
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-[#141619]"
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            )}

            {isLogin && (
              <div className="flex items-center justify-between gap-2 py-0.5 text-[9px]">
                <label className="flex cursor-pointer items-center gap-1.5 text-[#141619]">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(event) =>
                      setRememberMe(event.target.checked)
                    }
                    className="h-3 w-3 accent-[#141619]"
                  />
                  Remember me
                </label>

                <button
                  type="button"
                  onClick={() =>
                    setError(
                      "Password reset is not configured yet. Please contact your administrator."
                    )
                  }
                  className="font-semibold text-[#141619] hover:text-[#141619]"
                >
                  Forgot password?
                </button>
              </div>
            )}

            {error && (
              <p role="alert" className="text-[10px] text-[#141619]">
                {error}
              </p>
            )}

            {message && (
              <p role="status" className="text-[10px] text-[#141619]">
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="h-9 w-full rounded-lg bg-[#141619] text-[11px] font-semibold text-white shadow-sm transition hover:bg-[#141619] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? isLogin
                  ? "LOGGING IN..."
                  : "CREATING ACCOUNT..."
                : isLogin
                  ? "Login"
                  : "Create Account"}
            </button>
          </form>

          <div className="my-3 flex items-center gap-3">
            <div className="h-px flex-1 bg-[#FFFFFF]" />
            <span className="text-[9px] text-[#141619]">or</span>
            <div className="h-px flex-1 bg-[#FFFFFF]" />
          </div>

          <button
            type="button"
            onClick={() =>
              setError("Google sign-in is not configured yet.")
            }
            className="flex h-9 w-full items-center justify-center gap-2 rounded-lg border border-[#D1D1D1] bg-white text-[10px] font-semibold text-[#141619] transition hover:bg-[#F3F3F3]"
          >
            <FaGoogle className="text-[11px] text-[#141619]" />
            Continue with Google
          </button>

          <p className="mt-3 text-center text-[9px] text-[#141619]">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              type="button"
              onClick={() =>
                handleTabChange(isLogin ? "register" : "login")
              }
              className="font-semibold text-[#141619] hover:underline"
            >
              {isLogin ? "Register" : "Login"}
            </button>
          </p>
        </div>
      </section>
    </main>
  );
};

export default AuthPage;
