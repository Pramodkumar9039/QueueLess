
import { useState } from "react";
import { Link } from "react-router-dom";
import {
    FaUserPlus,
    FaGoogle,
    FaArrowLeft,
    FaEye,
    FaEyeSlash,
} from "react-icons/fa";
import api from "../api/axios";

function Register() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");
        setError("");

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        if (formData.password.length < 8) {
            setError("Password must contain at least 8 characters.");
            return;
        }

        try {
            setLoading(true);

            const response = await api.post("/auth/register", {
                name: formData.name.trim(),
                email: formData.email.trim(),
                password: formData.password,
            });

            setMessage(response.data.message || "Registration Successful");
            setFormData({
                name: "",
                email: "",
                password: "",
                confirmPassword: "",
            });
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Registration failed. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    const inputStyle =
        "w-full h-9 border border-[#ccc] rounded px-3 pr-9 text-sm outline-none focus:border-blue-400";

    return (
        <div className="h-[calc(100vh-60px)] bg-[#f5f5f5] flex items-center justify-center px-3 py-4">
            <div className="w-[320px] max-w-[95%] bg-white p-5 rounded-lg">

                <div className="text-center">
                    <FaUserPlus className="text-blue-700 text-xl mx-auto mb-1" />

                    <h1 className="text-lg font-bold text-[#111]">
                        Create New Account
                    </h1>

                    <p className="text-sm text-[#777] mt-3 mb-3">
                        sign up to continue
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-2.5">
                    <input
                        type="text"
                        name="name"
                        placeholder="Your Name"
                        autoComplete="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className={inputStyle}
                    />

                    <input
                        type="email"
                        name="email"
                        placeholder="Your Email"
                        autoComplete="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className={inputStyle}
                    />

                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            placeholder="Your Password"
                            autoComplete="new-password"
                            value={formData.password}
                            onChange={handleChange}
                            minLength={8}
                            required
                            className={inputStyle}
                        />

                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6A89A7]"
                            aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                            {showPassword ? <FaEyeSlash /> : <FaEye style={{color: 'gray'}} />}
                        </button>
                    </div>

                    <div className="relative">
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            name="confirmPassword"
                            placeholder="Confirm Password"
                            autoComplete="new-password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            minLength={8}
                            required
                            className={inputStyle}
                        />

                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6A89A7]"
                            aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                        >
                            {showConfirmPassword ? <FaEyeSlash /> : <FaEye style={{color: 'gray'}} />}
                        </button>
                    </div>

                    {error && (
                        <p className="text-xs text-red-600" role="alert">
                            {error}
                        </p>
                    )}

                    {message && (
                        <p className="text-xs text-green-700" role="status">
                            {message}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full h-8 bg-[#1976d2] text-white text-sm rounded shadow-md hover:bg-blue-700 disabled:opacity-60"
                    >
                        {loading ? "REGISTERING..." : "REGISTER"}
                    </button>
                </form>

                <div className="flex items-center gap-3 my-3">
                    <hr className="flex-1 border-[#e0e0e0]" />
                    <span className="text-xs">Or</span>
                    <hr className="flex-1 border-[#e0e0e0]" />
                </div>

                <button
                    type="button"
                    onClick={() => setError("Google sign-in is not configured yet.")}
                    className="w-full h-8 border border-blue-300 text-[#1976d2] text-xs rounded flex items-center justify-center gap-2 hover:bg-blue-50"
                >
                    CONTINUE WITH GOOGLE
                    <FaGoogle />
                </button>

                <Link
                    to="/login"
                    className="mt-2.5 w-full h-8 border border-blue-300 text-[#1976d2] text-xs rounded flex items-center justify-center gap-2 hover:bg-blue-50"
                >
                    <FaArrowLeft />
                    BACK TO LOGIN
                </Link>

            </div>
        </div>
    );
}

export default Register;
