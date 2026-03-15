import React, { useState } from "react";
import { Link } from "react-router-dom";
import { handleerror, handlesuccess } from "./utils.js";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      return handleerror("Email is required");
    }

    try {
      const res = await fetch(
        "https://rr-mobiles-backend-1.onrender.com/auth/forgot-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );

      const data = await res.json();

      if (data.success) {
        handlesuccess("Reset link sent to your email");
      } else {
        handleerror(data.message || "Something went wrong");
      }
    } catch (error) {
      handleerror("Server error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0d0d0d] px-4">
      <div className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 text-white">
        <h2 className="text-2xl font-bold mb-6 text-center">Forgot Password</h2>

        <form onSubmit={handleSubmit}>
          <label className="block mb-2 text-sm text-gray-300">Email</label>
          <input
            type="email"
            placeholder="Enter your registered email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 focus:border-orange-500 focus:ring-2 focus:ring-orange-500 outline-none transition mb-4"
          />

          <button
            type="submit"
            className="w-full py-3 rounded-xl font-semibold bg-orange-500 hover:bg-orange-600 transition"
          >
            Send Reset Link
          </button>
        </form>

        <p className="text-sm text-center text-gray-400 mt-4">
          Back to{" "}
          <Link to="/auth/login" className="text-orange-400 font-medium">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;