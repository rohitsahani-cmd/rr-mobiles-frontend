import React from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import "./Navbar.css";
import logo from "../logo2.png";
import {
  FaHome,
  FaShoppingBag,
  FaHeart,
  FaShoppingCart,
  FaBoxOpen,
} from "react-icons/fa";

const Navbar = () => {
  const location = useLocation();

  const isAuthenticated = !!localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("loggedInUser"));

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("loggedInUser");
    window.location.href = "/auth/login";
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div>
      <nav className="nav">
        <div className="logo">
          <Link to="/home/shop" className="nav-link">
            <div className="logo-wrap">
              <img src={logo} alt="logo" className="logo-img" />
              <h2 className="logo-text">MOBILE SOLUTIONS</h2>
            </div>
          </Link>
        </div>

        <ul className="menu">
          <li>
            <Link to="/home/shop" className="nav-link">
              Home
            </Link>
          </li>
          <li>
            <Link to="/home/products" className="nav-link">
              Products
            </Link>
          </li>
          <li>
            <Link to="/home/cart" className="nav-link">
              Cart
            </Link>
          </li>
          <li>
            <Link to="/home/Favourites" className="nav-link">
              Favorites
            </Link>
          </li>
          <li>
            <Link to="/home/orders" className="nav-link">
              Orders
            </Link>
          </li>
          <li>
            <Link to="/home/support" className="nav-link">
              Support
            </Link>
          </li>

          {user?.role === "admin" && (
            <li>
              <Link to="/admin/add-product" className="nav-link">
                Admin Panel
              </Link>
            </li>
          )}
        </ul>

        <div className="right">
          {isAuthenticated ? (
            <button onClick={handleLogout} className="signin">
              Logout
            </button>
          ) : (
            <Link to="/auth/login" className="signin">
              Signin
            </Link>
          )}
        </div>
      </nav>

      <div className="page-content">
        <Outlet />
      </div>

      {/* Professional Mobile Bottom Nav */}
      <div className="mobile-bottom-nav">
        <Link
          to="/home/shop"
          className={`bottom-nav-item ${isActive("/home/shop") ? "active" : ""}`}
        >
          <div className="bottom-icon-wrap">
            <FaHome className="bottom-icon" />
          </div>
          <span>Home</span>
        </Link>

        <Link
          to="/home/products"
          className={`bottom-nav-item ${isActive("/home/products") ? "active" : ""}`}
        >
          <div className="bottom-icon-wrap">
            <FaShoppingBag className="bottom-icon" />
          </div>
          <span>Products</span>
        </Link>

        <Link
          to="/home/cart"
          className={`bottom-nav-item ${isActive("/home/cart") ? "active" : ""}`}
        >
          <div className="bottom-icon-wrap">
            <FaShoppingCart className="bottom-icon" />
          </div>
          <span>Cart</span>
        </Link>

        <Link
          to="/home/Favourites"
          className={`bottom-nav-item ${isActive("/home/Favourites") ? "active" : ""}`}
        >
          <div className="bottom-icon-wrap">
            <FaHeart className="bottom-icon" />
          </div>
          <span>Fav</span>
        </Link>

        <Link
          to="/home/orders"
          className={`bottom-nav-item ${isActive("/home/orders") ? "active" : ""}`}
        >
          <div className="bottom-icon-wrap">
            <FaBoxOpen className="bottom-icon" />
          </div>
          <span>Orders</span>
        </Link>
      </div>
    </div>
  );
};

export default Navbar;