import React, { useState } from "react";
import { handlesuccess, handleerror } from "./pages/auth/utils";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");

  const handleForgot = async (e) => {
    e.preventDefault();
    console.log("Forgot clicked");
    console.log("Email:", email);

    if (!email) {
      return handleerror("Please enter your email");
    }

    try {
      const response = await fetch("https://rr-mobiles-backend-1.onrender.com/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();
      console.log("Forgot response:", result);

      if (result.success) {
        handlesuccess(result.message || "Reset link sent");
      } else {
        handleerror(result.message || "Failed to send reset link");
      }
    } catch (error) {
      console.log("Forgot password error:", error);
      handleerror("Something went wrong");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <form
        onSubmit={handleForgot}
        className="bg-white/10 p-10 rounded-xl backdrop-blur-lg w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-6">Forgot Password</h2>

        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 mb-6 rounded-lg bg-white/20 text-white focus:outline-none"
        />

        <button
          type="submit"
          className="w-full bg-orange-500 hover:bg-orange-600 py-3 rounded-lg"
        >
          Send Reset Link
        </button>
      </form>
    </div>
  );
};

export default ForgotPassword;