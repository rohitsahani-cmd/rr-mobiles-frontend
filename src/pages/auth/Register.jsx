import React, { useState } from "react";
import "./Login.css";
import { Link, useNavigate } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import { handleerror, handlesuccess } from "./utils.js";

const Register = () => {
  const navigate = useNavigate();

  const [singinInfo, setSignInInfo] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setSignInInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    const { name, email, password } = singinInfo;

    if (!name || !email || !password) {
      return handleerror("All fields are required");
    }

    try {
      const url = "http://localhost:8000/auth/signup";

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(singinInfo),
      });

      const result = await response.json();
      console.log(result);

      const { success, message } = result;

      if (success) {
        handlesuccess(message || "Signup successful");

        setSignInInfo({
          name: "",
          email: "",
          password: "",
        });

        setTimeout(() => {
          navigate("/auth/login");
        }, 1000);
      } else {
        handleerror(message || "Signup failed");
      }
    } catch (error) {
      console.log(error);
      handleerror("Something went wrong");
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#0d0d0d] overflow-hidden">
      {/* Animated Background Glow */}
      <div className="absolute w-96 h-96 bg-orange-500/20 rounded-full blur-3xl top-[-100px] left-[-100px] animate-pulse"></div>
      <div className="absolute w-96 h-96 bg-red-500/20 rounded-full blur-3xl bottom-[-100px] right-[-100px] animate-pulse"></div>

      <div className="w-full max-w-5xl bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl grid md:grid-cols-2 overflow-hidden relative z-10 transition duration-500">
        {/* LEFT - FORM */}
        <div className="p-10 text-white animate-fadeIn">
          <form onSubmit={handleSignup}>
            <h2 className="text-3xl font-bold mb-8">Create Account 🚀</h2>

            <div className="mb-5">
              <label className="block mb-2 text-sm font-semibold text-gray-300">
                Name
              </label>
              <input
                name="name"
                value={singinInfo.name}
                onChange={handleChange}
                type="text"
                autoFocus
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition placeholder-gray-400"
                placeholder="Enter your name"
              />
            </div>

            <div className="mb-5">
              <label className="block mb-2 text-sm font-semibold text-gray-300">
                Email address
              </label>
              <input
                name="email"
                value={singinInfo.email}
                onChange={handleChange}
                type="email"
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition placeholder-gray-400"
                placeholder="Enter your email"
              />
            </div>

            <div className="mb-5">
              <label className="block mb-2 text-sm font-semibold text-gray-300">
                Password
              </label>
              <input
                name="password"
                value={singinInfo.password}
                onChange={handleChange}
                type="password"
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition placeholder-gray-400"
                placeholder="Create password"
              />
            </div>

            <div className="flex justify-between items-center mb-6 text-sm">
              <label className="flex items-center gap-2 text-gray-300">
                <input type="checkbox" className="accent-orange-500" />
                Remember me
              </label>
            </div>

            <button
              type="submit"
              className="w-full bg-orange-500 hover:bg-orange-600 hover:shadow-lg hover:shadow-orange-500/40 text-white transition-all duration-300 py-3 rounded-xl font-semibold"
            >
              Sign Up
            </button>

            <div className="my-6 text-center text-gray-400 text-sm">
              Already have an account?{" "}
              <Link to="/auth/login" className="text-orange-400 font-semibold">
                Login
              </Link>
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                className="w-full bg-white/10 border border-white/20 text-white hover:bg-white/20 py-2 rounded-xl transition"
              >
                Continue with Google
              </button>
            </div>
          </form>
        </div>

        {/* RIGHT SIDE */}
        <div
          className="hidden md:flex items-center justify-center bg-cover bg-center relative"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(0,0,0,0.75), rgba(0,0,0,0.5)), url('https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1000&q=80')",
          }}
        >
          <div className="text-center text-white p-10 animate-slideUp">
            <h2 className="text-4xl font-bold mb-4">
              Join RR Mobile Solutions
            </h2>
            <p className="text-gray-300">
              Shop latest mobiles, gadgets & accessories with ease.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;