import React, { useState } from "react";
import "./Login.css";
import { Link, useNavigate } from "react-router-dom";
import { handleerror } from "./utils";
import { GoogleLogin } from "@react-oauth/google";

const Login = ({ setIsAuthenticated }) => {
  const navigate = useNavigate();

  const [loginInfo, setLoginInfo] = useState({
    email: "",
    password: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [loginStatus, setLoginStatus] = useState("idle"); // idle | loading | success

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLoginInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const saveUserAndRedirect = (token, user) => {
    localStorage.setItem("token", token);
    localStorage.setItem("loggedInUser", JSON.stringify(user));
    setIsAuthenticated(true);

    setLoginStatus("loading");

    setTimeout(() => {
      setLoginStatus("success");

      setTimeout(() => {
        if (user?.role === "admin") {
          navigate("/admin/add-product", { replace: true });
        } else {
          navigate("/home/shop", { replace: true });
        }
      }, 1200);
    }, 800);
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    const { email, password } = loginInfo;

    if (!email || !password) {
      return handleerror("All fields are required");
    }

    try {
      setIsLoading(true);

      const response = await fetch(
        "https://rr-mobiles-backend-1.onrender.com/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(loginInfo),
        }
      );

      const result = await response.json();
      const { success, token, user, message } = result;

      if (!success) {
        setIsLoading(false);
        return handleerror(message || "Login failed");
      }

      saveUserAndRedirect(token, user);
    } catch (error) {
      setIsLoading(false);
      handleerror("Server error or network issue");
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setIsLoading(true);

      const response = await fetch(
        "https://rr-mobiles-backend-1.onrender.com/auth/google-login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token: credentialResponse.credential,
          }),
        }
      );

      const result = await response.json();
      const { success, token, user, message } = result;

      if (!success) {
        setIsLoading(false);
        return handleerror(message || "Google login failed");
      }

      saveUserAndRedirect(token, user);
    } catch (error) {
      setIsLoading(false);
      handleerror("Google login failed");
    }
  };

  if (loginStatus === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-6">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-lg font-semibold text-gray-700">
            Logging you in...
          </p>
        </div>
      </div>
    );
  }

  if (loginStatus === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center animate-bounce">
            <svg
              className="w-10 h-10 text-green-600"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <h2 className="text-2xl font-bold text-gray-800">
            Login Successful
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#0d0d0d] overflow-hidden px-4">
      <div className="absolute w-96 h-96 bg-orange-500/20 rounded-full blur-3xl top-[-100px] left-[-100px] animate-pulse"></div>
      <div className="absolute w-96 h-96 bg-red-500/20 rounded-full blur-3xl bottom-[-100px] right-[-100px] animate-pulse"></div>

      <div className="w-full max-w-5xl bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl grid md:grid-cols-2 overflow-hidden relative z-10">
        <div className="p-8 md:p-10 text-white">
          <form onSubmit={handleLogin}>
            <h2 className="text-3xl font-bold mb-8">Welcome to RR Mobiles</h2>

            <div className="mb-6">
              <label className="block mb-2 text-sm font-semibold text-gray-300">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={loginInfo.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 focus:border-orange-500 focus:ring-2 focus:ring-orange-500 outline-none transition"
              />
            </div>

            <div className="mb-2">
              <label className="block mb-2 text-sm font-semibold text-gray-300">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={loginInfo.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 focus:border-orange-500 focus:ring-2 focus:ring-orange-500 outline-none transition"
              />
            </div>

            <div className="flex justify-end mb-6">
              <Link
                to="/auth/forgot-password"
                className="text-sm text-orange-400 hover:text-orange-300 font-medium"
              >
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 rounded-xl font-semibold transition ${
                isLoading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-orange-500 hover:bg-orange-600 hover:shadow-lg hover:shadow-orange-500/40"
              }`}
            >
              {isLoading ? "Signing in..." : "Login"}
            </button>

            <div className="my-6 text-center text-gray-400 text-sm">
              Don&apos;t have an account?{" "}
              <Link
                to="/auth/register"
                className="text-orange-400 font-semibold"
              >
                Register
              </Link>
            </div>

            <div className="flex justify-center mt-4">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => handleerror("Google login failed")}
                theme="outline"
                size="large"
                text="signin_with"
                shape="rectangular"
                logo_alignment="left"
              />
            </div>
          </form>
        </div>

        <div className="hidden md:flex items-center justify-center bg-gradient-to-br from-orange-500 to-red-600 p-10">
          <div className="text-center text-black">
            <h2 className="text-4xl font-bold mb-4">RR Mobile Solutions</h2>
            <p className="text-orange-100">
              Premium gadgets. Trusted service. Fast delivery.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;