import React from "react";
import { Navigate, useLocation } from "react-router-dom";

const Checkauth = ({ isAuthenticated, user, children }) => {
  const location = useLocation();
  const pathname = location.pathname;

  const isLoginPage = pathname === "/auth/login";
  const isRegisterPage = pathname === "/auth/register";
  const isForgotPasswordPage = pathname === "/auth/forgot-password";
  const isResetPasswordPage = pathname.startsWith("/auth/reset-password");

  const isAuthPage =
    isLoginPage ||
    isRegisterPage ||
    isForgotPasswordPage ||
    isResetPasswordPage;

  const isAdminPage = pathname.startsWith("/admin");

  const isPublicPage =
    pathname === "/" ||
    pathname.startsWith("/home") ||
    pathname.includes("/products") ||
    pathname.includes("/shop") ||
    pathname.includes("/cart") ||
    pathname.includes("/support") ||
    pathname.includes("/watchlist");

  const isProtectedUserPage =
    pathname.includes("/orders") || pathname.includes("/checkout");

  // Not logged in
  if (!isAuthenticated) {
    if (isAuthPage || isPublicPage) {
      return <>{children}</>;
    }

    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // Logged in user should not revisit login/register
  if (isAuthenticated && (isLoginPage || isRegisterPage)) {
    if (user?.role === "admin") {
      return <Navigate to="/admin/add-product" replace />;
    }
    return <Navigate to="/home/shop" replace />;
  }

  // Admin-only routes
  if (isAdminPage) {
    if (user?.role !== "admin") {
      return <Navigate to="/home/shop" replace />;
    }
    return <>{children}</>;
  }

  // Admin should not access user protected pages
  if (isAuthenticated && user?.role === "admin" && isProtectedUserPage) {
    return <Navigate to="/admin/add-product" replace />;
  }

  return <>{children}</>;
};

export default Checkauth;