import "./App.css";
import "./index.css";
import { Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";
import AddProduct from "./Addproduct";
import "react-toastify/dist/ReactToastify.css";
import Layout from "./components/ui/authcomponent/Auth";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Adminview from "./components/ui/adminview/Adminview";

import Home from "./components/Home";
import Shop from "./components/Shop";
import Checkauth from "./components/commoncomponent/Checkauth";
import { ToastContainer } from "react-toastify";
import Products from "./Products";
import Favourites from "./Favourites";
import Cart from "./Cart";
import Orders from "./Orders";
import Support from "./Support";
import Homemain from "./Homemain";
import Checkout from "./Checkout";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem("token")
  );

  const user = JSON.parse(localStorage.getItem("loggedInUser"));

  return (
    <div className="flex flex-col overflow-hidden bg-white">
      <Routes>
        <Route path="/" element={<Navigate to="/home/shop" replace />} />
        <Route
          path="/auth"
          element={
            <Checkauth isAuthenticated={isAuthenticated} user={user}>
              <Layout />
            </Checkauth>
          }
        >
          <Route
            path="login"
            element={<Login setIsAuthenticated={setIsAuthenticated} />}
          />
          <Route path="register" element={<Register />} />
        </Route>

        <Route
          path="/admin"
          element={
            <Checkauth isAuthenticated={isAuthenticated} user={user}>
              <Adminview />
            </Checkauth>
          }
        >
          <Route path="add-product" element={<AddProduct />} />
        </Route>

        <Route path="/home" element={<Home />}>

          <Route path="shop" element={<Homemain />} />
          <Route path="products" element={<Products />} />
          <Route path="favourites" element={<Favourites />} />
          <Route path="cart" element={<Cart />} />
          <Route path="orders" element={<Orders />} />
          <Route path="support" element={<Support />} />
          

          <Route path="checkout" element={<Checkout />} />
        </Route>
      </Routes>
<ToastContainer
  position="top-right"
  autoClose={2000}
  hideProgressBar={false}
  closeOnClick
  pauseOnHover
  draggable
  toastStyle={{
    boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
    backgroundColor: "#ffffff",
    color: "#000000",
    fontWeight: "600",
    borderRadius: "10px",
  }}
  progressStyle={{
    background: "#ef8521",
  }}
/>
    </div>
  );
}

export default App;