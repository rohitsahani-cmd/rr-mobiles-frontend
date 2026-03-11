// import React from 'react'
// import { Navigate, useLocation } from 'react-router-dom'

// const Checkauth = ({ isAuthenticated, user, children }) => {
//   const location = useLocation()

//   const isLoginPage = location.pathname.includes('/login')
//   const isRegisterPage = location.pathname.includes('/register')
//   const isAuthPage = isLoginPage || isRegisterPage
//   const isAdminPage = location.pathname.includes('/admin')
//   const isHomePage = location.pathname.includes('/home')
//   const isShopPage = location.pathname.includes('/shop')

//   // Not logged in -> only allow auth pages
//   if (!isAuthenticated && !isAuthPage) {
//     return <Navigate to="/auth/login" />
//   }

//   // Logged in -> don't allow login/register again
//   if (isAuthenticated && isAuthPage) {
//     if (user?.role === 'admin') {
//       return <Navigate to="/admin/sidebar" />
//     } else {
//       return <Navigate to="/home" />
//     }
//   }

//   // Normal user trying admin page
//   if (isAuthenticated && user?.role !== 'admin' && isAdminPage) {
//     return <Navigate to="/unauth-page" />
//   }

//   // Admin trying user pages
//   if (isAuthenticated && user?.role === 'admin' && (isHomePage || isShopPage)) {
//     return <Navigate to="/admin/sidebar" />
//   }

//   return <>{children}</>
// }

// export default Checkauth


//METHOD-2
import React from "react";
import { Navigate, useLocation } from "react-router-dom";

const Checkauth = ({ isAuthenticated, user, children }) => {
  const location = useLocation();

  const pathname = location.pathname;

  const isLoginPage = pathname.includes("/login");
  const isRegisterPage = pathname.includes("/register");
  const isAuthPage = isLoginPage || isRegisterPage;

  const isAdminPage = pathname.startsWith("/admin");

  const isPublicPage =
    pathname.startsWith("/home") ||
    pathname === "/" ||
    pathname.includes("/products") ||
    pathname.includes("/shop") ||
    pathname.includes("/cart") ||
    pathname.includes("/support") ||
    pathname.includes("/watchlist");

  const isProtectedUserPage =
    pathname.includes("/orders") ||
    pathname.includes("/checkout");

  if (!isAuthenticated) {
    if (isAuthPage) {
      return <>{children}</>;
    }

    if (isPublicPage) {
      return <>{children}</>;
    }

    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  if (isAuthenticated && isAuthPage) {
    if (user?.role === "admin") {
      return <Navigate to="/admin/add-product" replace />;
    }
    return <Navigate to="/home/shop" replace />;
  }

  if (isAdminPage) {
    if (user?.role !== "admin") {
      return <Navigate to="/home/shop" replace />;
    }
    return <>{children}</>;
  }

  if (isAuthenticated && user?.role === "admin" && isProtectedUserPage) {
    return <Navigate to="/admin/add-product" replace />;
  }

  return <>{children}</>;
};

export default Checkauth;