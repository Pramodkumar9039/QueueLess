
import { useState } from "react";
import { Link } from "react-router-dom";
import { FaUserPlus, FaGoogle, FaArrowLeft } from "react-icons/fa";
import api from "../api/axios";

function Register() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (event) => {
        setFormData({
            ...formData,
            [event.target.name]: event.target.value,
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

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

            setMessage(response.data.message || "Registration successful!");

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

    return (
        <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center px-4 py-6">
            <div className="w-[360px] max-w-[95%] bg-white p-6 rounded-lg">

                <div className="text-center">
                    <FaUserPlus className="text-blue-700 text-2xl mx-auto mb-2" />

                    <h1 className="text-xl font-bold text-[#111]">
                        Create New Account
                    </h1>

                    <p className="text-[#777] mt-4 mb-4">
                        sign up to continue
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-3">
                    <input
                        type="text"
                        name="name"
                        placeholder="Your Name"
                        autoComplete="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full h-10 border border-[#ccc] rounded px-4 text-sm outline-none focus:border-blue-400"
                    />

                    <input
                        type="email"
                        name="email"
                        placeholder="Your Email"
                        autoComplete="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full h-10 border border-[#ccc] rounded px-4 text-sm outline-none focus:border-blue-400"
                    />

                    <input
                        type="password"
                        name="password"
                        placeholder="Your Password"
                        autoComplete="new-password"
                        value={formData.password}
                        onChange={handleChange}
                        minLength={8}
                        required
                        className="w-full h-10 border border-[#ccc] rounded px-4 text-sm outline-none focus:border-blue-400"
                    />

                    <input
                        type="password"
                        name="confirmPassword"
                        placeholder="Confirm Password"
                        autoComplete="new-password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        minLength={8}
                        required
                        className="w-full h-10 border border-[#ccc] rounded px-4 text-sm outline-none focus:border-blue-400"
                    />

                    {error && (
                        <p className="text-sm text-red-600" role="alert">
                            {error}
                        </p>
                    )}

                    {message && (
                        <p className="text-sm text-green-700" role="status">
                            {message}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full h-9 bg-[#1976d2] text-white text-sm rounded shadow-md hover:bg-blue-700 disabled:opacity-60"
                    >
                        {loading ? "REGISTERING..." : "REGISTER"}
                    </button>
                </form>

                <div className="flex items-center gap-3 my-4">
                    <hr className="flex-1 border-[#e0e0e0]" />
                    <span className="text-sm">Or</span>
                    <hr className="flex-1 border-[#e0e0e0]" />
                </div>

                <button
                    type="button"
                    onClick={() => setError("Google sign-in is not configured yet.")}
                    className="w-full h-9 border border-blue-300 text-[#1976d2] text-sm rounded flex items-center justify-center gap-3 hover:bg-blue-50"
                >
                    CONTINUE WITH GOOGLE
                    <FaGoogle />
                </button>

                <Link
                    to="/login"
                    className="mt-3 w-full h-9 border border-blue-300 text-[#1976d2] text-sm rounded flex items-center justify-center gap-3 hover:bg-blue-50"
                >
                    <FaArrowLeft />
                    BACK TO LOGIN
                </Link>

            </div>
        </div>
    );
}

export default Register;
