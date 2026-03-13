import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { handlesuccess, handleerror } from "./pages/auth/utils";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");

  const handleReset = async (e) => {
    e.preventDefault();

    if (!password) {
      return handleerror("Password is required");
    }

    try {
      const response = await fetch(
        `http://localhost:8000/auth/reset-password/${token}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password }),
        }
      );

      const result = await response.json();

      if (result.success) {
        handlesuccess(result.message);
        setTimeout(() => {
          navigate("/auth/login");
        }, 1500);
      } else {
        handleerror(result.message);
      }
    } catch (error) {
      console.log(error);
      handleerror("Something went wrong");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <form
        onSubmit={handleReset}
        className="bg-white/10 p-10 rounded-xl backdrop-blur-lg"
      >
        <h2 className="text-2xl font-bold mb-6">Reset Password</h2>

        <input
          type="password"
          placeholder="Enter new password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-3 mb-6 rounded-lg bg-white/20 text-white focus:outline-none"
        />

        <button
          type="submit"
          className="w-full bg-orange-500 hover:bg-orange-600 py-3 rounded-lg"
        >
          Reset Password
        </button>
      </form>
    </div>
  );
};

export default ResetPassword;