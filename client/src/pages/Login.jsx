
import { useState } from "react";
import { Link } from "react-router-dom";
import {
    FaSignInAlt,
    FaGoogle,
    FaArrowLeft,
    FaEye,
    FaEyeSlash,
} from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const [showPassword, setShowPassword] = useState(false);
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
    setError("");

    try {
        setLoading(true);

        await login(
            formData.email.trim(),
            formData.password
        );

        navigate("/dashboard");
    } catch (err) {
        setError(
            err.response?.data?.message ||
            err.message ||
            "Unable to connect to the server. Please try again."
        );
    } finally {
        setLoading(false);
    }
};

    return (
        <div className="h-[calc(100vh-60px)] bg-[#f5f5f5] flex items-center justify-center px-3 py-4">
            <div className="w-[320px] max-w-[95%] bg-white p-5 rounded-lg">

                <div className="text-center">
                    <FaSignInAlt className="text-blue-700 text-xl mx-auto mb-1" />

                    <h1 className="text-lg font-bold text-[#111]">
                        Welcome Back
                    </h1>

                    <p className="text-sm text-[#777] mt-3 mb-3">
                        login to continue
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-2.5">
                    <input
                        type="email"
                        name="email"
                        placeholder="Your Email"
                        autoComplete="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full h-9 border border-[#ccc] rounded px-3 text-sm outline-none focus:border-blue-400"
                    />

                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            placeholder="Your Password"
                            autoComplete="current-password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            className="w-full h-9 border border-[#ccc] rounded pl-3 pr-9 text-sm outline-none focus:border-blue-400"
                        />

                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6A89A7]"
                            aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                    </div>

                    {error && (
                        <p className="text-xs text-red-600" role="alert">
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full h-8 bg-[#1976d2] text-white text-sm rounded shadow-md hover:bg-blue-700 disabled:opacity-60"
                    >
                        {loading ? "LOGGING IN..." : "LOGIN"}
                    </button>
                </form>

                <div className="flex items-center gap-3 my-3">
                    <hr className="flex-1 border-[#e0e0e0]" />
                    <span className="text-xs">Or</span>
                    <hr className="flex-1 border-[#e0e0e0]" />
                </div>

                <button
                    type="button"
                    className="w-full h-8 border border-blue-300 text-[#1976d2] text-xs rounded flex items-center justify-center gap-2 hover:bg-blue-50"
                >
                    CONTINUE WITH GOOGLE
                    <FaGoogle />
                </button>

                <Link
                    to="/register"
                    className="mt-2.5 w-full h-8 border border-blue-300 text-[#1976d2] text-xs rounded flex items-center justify-center gap-2 hover:bg-blue-50"
                >
                    <FaArrowLeft />
                    BACK TO REGISTER
                </Link>

            </div>
        </div>
    );
}

export default Login;
