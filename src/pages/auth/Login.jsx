import React, { useState } from "react";
import "./Login.css";
import { Link, useNavigate } from "react-router-dom";
import { handlesuccess, handleerror } from "./utils";
import { GoogleLogin } from "@react-oauth/google";

const Login = ({ setIsAuthenticated }) => {
  const navigate = useNavigate();

  const [loginInfo, setLoginInfo] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setLoginInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    const { email, password } = loginInfo;

    if (!email || !password) {
      return handleerror("All fields are required");
    }

    try {
      const response = await fetch("http://localhost:8000/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginInfo),
      });

      const result = await response.json();
      const { success, message, token, user, error } = result;

      if (success) {
        handlesuccess(message || "Login successful");

        localStorage.setItem("token", token);
        localStorage.setItem("loggedInUser", JSON.stringify(user));

        setIsAuthenticated(true);

        if (user?.role === "admin") {
          navigate("/admin/add-product", { replace: true });
        } else {
          navigate("/home/shop", { replace: true });
        }
      } else {
        handleerror(error || message || "Login failed");
      }
    } catch (err) {
      console.log(err);
      handleerror("Server error or network issue");
    }
  };

  const handleGoogleLoginSuccess = async (credentialResponse) => {
    try {
      const response = await fetch("http://localhost:8000/auth/google-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: credentialResponse.credential,
        }),
      });

      const data = await response.json();

      if (data.success) {
        handlesuccess(data.message || "Google login successful");

        localStorage.setItem("token", data.token);
        localStorage.setItem("loggedInUser", JSON.stringify(data.user));

        setIsAuthenticated(true);

        if (data.user?.role === "admin") {
          navigate("/admin/add-product", { replace: true });
        } else {
          navigate("/home/shop", { replace: true });
        }
      } else {
        handleerror(data.message || "Google login failed");
      }
    } catch (error) {
      console.log("Google login error:", error);
      handleerror("Google login failed");
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#0d0d0d] overflow-hidden">
      <div className="absolute w-96 h-96 bg-orange-500/20 rounded-full blur-3xl top-[-100px] left-[-100px] animate-pulse"></div>
      <div className="absolute w-96 h-96 bg-red-500/20 rounded-full blur-3xl bottom-[-100px] right-[-100px] animate-pulse"></div>

      <div className="w-full max-w-5xl bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl grid md:grid-cols-2 overflow-hidden relative z-10 transition duration-500">
        <div className="p-10 text-white animate-fadeIn">
          <form onSubmit={handleLogin}>
            <h2 className="text-3xl font-bold mb-8">
              Welcome to RR Mobiles
            </h2>

            <div className="mb-6">
              <label className="block mb-2 text-sm font-semibold text-gray-300">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={loginInfo.email}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 focus:border-orange-500 focus:ring-2 focus:ring-orange-500 outline-none transition placeholder-gray-400"
                placeholder="Enter your email"
              />
            </div>

            <div className="mb-6">
              <label className="block mb-2 text-sm font-semibold text-gray-300">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={loginInfo.password}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 focus:border-orange-500 focus:ring-2 focus:ring-orange-500 outline-none transition placeholder-gray-400"
                placeholder="Enter your password"
              />
            </div>

            <div className="flex justify-between items-center mb-6 text-sm">
              <label className="flex items-center gap-2 text-gray-300">
                <input type="checkbox" className="accent-orange-500" />
                Remember me
              </label>

              <Link to="/auth/forgot-password">Forgot Password?</Link>
            </div>

            <button
              type="submit"
              className="w-full bg-orange-500 hover:bg-orange-600 hover:shadow-lg hover:shadow-orange-500/40 transition-all duration-300 py-3 rounded-xl font-semibold"
            >
              Login
            </button>

            <div className="my-6 text-center text-gray-400 text-sm">
              Don’t have an account?{" "}
              <Link to="/auth/register" className="text-orange-400 font-semibold">
                Register
              </Link>
            </div>

            <div className="flex items-center gap-3 my-5">
              <div className="h-px bg-white/10 flex-1"></div>
              <span className="text-sm text-gray-400">OR</span>
              <div className="h-px bg-white/10 flex-1"></div>
            </div>

            <div className="flex justify-center mt-4">
             
                <GoogleLogin
                  onSuccess={handleGoogleLoginSuccess}
                  onError={() => handleerror("Google login failed")}
                  theme="outline"
                  size="large"
                  shape="pill"
                  text="continue_with"
                  width="280"
                  logo_alignment="left"
                />
            
            </div>
          </form>
        </div>

        <div className="hidden md:flex items-center justify-center bg-gradient-to-br from-orange-500 to-red-600 p-10">
          <div className="text-center text-black animate-slideUp">
            <h2 className="text-4xl font-bold mb-4">
              RR Mobile Solutions
            </h2>
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