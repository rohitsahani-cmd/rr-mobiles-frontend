import React, { useState } from "react";
import "./Login.css";
import { Link, useNavigate } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import { handleerror, handlesuccess } from "./utils.js";
import { GoogleLogin } from "@react-oauth/google";

const Register = ({ setIsAuthenticated }) => {
  const navigate = useNavigate();

  const [singinInfo, setSignInInfo] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [otp, setOtp] = useState("");
  const [showOtpBox, setShowOtpBox] = useState(false);
  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSignInInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    console.log("NORMAL SIGNUP TRIGGERED");

    if (googleLoading) return;

    const { name, email, password } = singinInfo;

    if (!name || !email || !password) {
      return handleerror("All fields are required");
    }

    try {
      setLoading(true);

      const response = await fetch(
        "https://rr-mobiles-backend-1.onrender.com/auth/signup",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(singinInfo),
        }
      );

      const result = await response.json();
      const { success, message } = result;

      if (success) {
        handlesuccess(message || "OTP sent to your email");
        setShowOtpBox(true);
      } else {
        handleerror(message || "Signup failed");
      }
    } catch (error) {
      console.log("Signup error:", error);
      handleerror("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    if (!otp) {
      return handleerror("Please enter OTP");
    }

    try {
      setOtpLoading(true);

      const response = await fetch(
        "https://rr-mobiles-backend-1.onrender.com/auth/verify-signup-otp",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: singinInfo.email,
            otp,
          }),
        }
      );

      const result = await response.json();
      const { success, message } = result;

      if (success) {
        handlesuccess(message || "Email verified successfully");

        setOtp("");
        setShowOtpBox(false);
        setSignInInfo({
          name: "",
          email: "",
          password: "",
        });

        setTimeout(() => {
          navigate("/auth/login");
        }, 1200);
      } else {
        handleerror(message || "OTP verification failed");
      }
    } catch (error) {
      console.log("OTP verify error:", error);
      handleerror("Something went wrong while verifying OTP");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!singinInfo.email) {
      return handleerror("Email is missing");
    }

    try {
      setResendLoading(true);

      const response = await fetch(
        "https://rr-mobiles-backend-1.onrender.com/auth/resend-signup-otp",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: singinInfo.email,
          }),
        }
      );

      const result = await response.json();
      const { success, message } = result;

      if (success) {
        handlesuccess(message || "OTP resent successfully");
      } else {
        handleerror(message || "Failed to resend OTP");
      }
    } catch (error) {
      console.log("Resend OTP error:", error);
      handleerror("Something went wrong while resending OTP");
    } finally {
      setResendLoading(false);
    }
  };

  const handleGoogleSignupSuccess = async (credentialResponse) => {
    console.log("GOOGLE SIGNUP TRIGGERED", credentialResponse);

    try {
      setGoogleLoading(true);

      const response = await fetch(
        "https://rr-mobiles-backend-1.onrender.com/auth/google-login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token: credentialResponse?.credential,
          }),
        }
      );

      const data = await response.json();
      console.log("GOOGLE SIGNUP RESPONSE", data);

      if (data.success) {
        handlesuccess(data.message || "Google signup successful");

        localStorage.setItem("token", data.token);
        localStorage.setItem("loggedInUser", JSON.stringify(data.user));

        if (setIsAuthenticated) {
          setIsAuthenticated(true);
        }

        if (data.user?.role === "admin") {
          navigate("/admin/add-product", { replace: true });
        } else {
          navigate("/home/shop", { replace: true });
        }
      } else {
        handleerror(data.message || "Google signup failed");
      }
    } catch (error) {
      console.log("Google signup error:", error);
      handleerror("Google signup failed");
    } finally {
      setGoogleLoading(false);
    }
  };

  if (googleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-6">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-lg font-semibold text-gray-700">
            Signing up with Google...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#0d0d0d] overflow-hidden">
      <div className="absolute w-96 h-96 bg-orange-500/20 rounded-full blur-3xl top-[-100px] left-[-100px] animate-pulse"></div>
      <div className="absolute w-96 h-96 bg-red-500/20 rounded-full blur-3xl bottom-[-100px] right-[-100px] animate-pulse"></div>

      <div className="w-full max-w-5xl bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl grid md:grid-cols-2 overflow-hidden relative z-10 transition duration-500">
        <div className="p-10 text-white animate-fadeIn">
          {!showOtpBox ? (
            <>
              <form onSubmit={handleSignup}>
                <h2 className="text-3xl font-bold mb-8">
                  Create Account NEW 🚀
                </h2>

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

                <button
                  type="submit"
                  disabled={loading || googleLoading}
                  className="w-full bg-orange-500 hover:bg-orange-600 hover:shadow-lg hover:shadow-orange-500/40 text-white transition-all duration-300 py-3 rounded-xl font-semibold disabled:opacity-70"
                >
                  {loading ? "Sending OTP..." : "Sign Up"}
                </button>

                <div className="my-6 text-center text-gray-400 text-sm">
                  Already have an account?{" "}
                  <Link
                    to="/auth/login"
                    className="text-orange-400 font-semibold"
                  >
                    Login
                  </Link>
                </div>
              </form>

              <div className="flex items-center gap-3 my-5">
                <div className="h-px bg-white/10 flex-1"></div>
                <span className="text-sm text-gray-400">OR</span>
                <div className="h-px bg-white/10 flex-1"></div>
              </div>

              <div
                className="flex justify-center"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
              >
                <GoogleLogin
                  onSuccess={handleGoogleSignupSuccess}
                  onError={() => {
                    console.log("Google Signup Failed");
                    handleerror("Google signup failed");
                  }}
                  theme="outline"
                  size="large"
                  shape="pill"
                  text="continue_with"
                  width="280"
                  logo_alignment="left"
                />
              </div>
            </>
          ) : (
            <form onSubmit={handleVerifyOtp}>
              <h2 className="text-3xl font-bold mb-4">Verify OTP 🔐</h2>
              <p className="text-sm text-gray-300 mb-6">
                We sent a 6-digit OTP to{" "}
                <span className="text-orange-400 font-semibold">
                  {singinInfo.email}
                </span>
              </p>

              <div className="mb-5">
                <label className="block mb-2 text-sm font-semibold text-gray-300">
                  Enter OTP
                </label>
                <input
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  type="text"
                  maxLength="6"
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white tracking-[0.4em] text-center text-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition placeholder-gray-400"
                  placeholder="------"
                />
              </div>

              <button
                type="submit"
                disabled={otpLoading}
                className="w-full bg-orange-500 hover:bg-orange-600 hover:shadow-lg hover:shadow-orange-500/40 text-white transition-all duration-300 py-3 rounded-xl font-semibold disabled:opacity-70"
              >
                {otpLoading ? "Verifying..." : "Verify OTP"}
              </button>

              <button
                type="button"
                onClick={handleResendOtp}
                disabled={resendLoading}
                className="w-full mt-4 border border-orange-500 text-orange-400 hover:bg-orange-500 hover:text-white transition-all duration-300 py-3 rounded-xl font-semibold disabled:opacity-70"
              >
                {resendLoading ? "Resending..." : "Resend OTP"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowOtpBox(false);
                  setOtp("");
                }}
                className="w-full mt-4 text-gray-300 hover:text-white transition-all duration-300 py-2"
              >
                Back
              </button>
            </form>
          )}
        </div>

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