import React, { useState } from "react";
import "./Login.css";
import { Link, useNavigate } from "react-router-dom";
import { handlesuccess, handleerror } from "./utils";

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
      const response = await fetch("https://rr-mobiles-backend.onrender.com/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginInfo),
      });

      const result = await response.json();
      console.log("Login result:", result);

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

  return ( <div className="relative min-h-screen flex items-center justify-center bg-[#0d0d0d] overflow-hidden">

    {/* Animated Background Blobs */}
    <div className="absolute w-96 h-96 bg-orange-500/20 rounded-full blur-3xl top-[-100px] left-[-100px] animate-pulse"></div>
    <div className="absolute w-96 h-96 bg-red-500/20 rounded-full blur-3xl bottom-[-100px] right-[-100px] animate-pulse"></div>

    <div className="w-full max-w-5xl bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl grid md:grid-cols-2 overflow-hidden relative z-10 transition duration-500">

      {/* LEFT - FORM */}
      <div className="p-10 text-white animate-fadeIn">
        <form onSubmit={handleLogin}>
          <h2 className="text-3xl font-bold mb-8">
            Welcome to RR Mobiles
          </h2>

          {/* Email */}
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

          {/* Password */}
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

            <span className="text-orange-400 hover:underline cursor-pointer">
              Forgot password?
            </span>
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

          <button
            type="button"
            className="w-full bg-white/10 border border-white/20 hover:bg-white/20 transition py-2 rounded-xl"
          >
            Continue with Google
          </button>
        </form>
      </div>

      {/* RIGHT SIDE */}
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