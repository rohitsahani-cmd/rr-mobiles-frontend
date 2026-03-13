import React, { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";

const Adminview = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: "Add Product", path: "/admin/add-product" },
    { name: "Orders", path: "/admin/orders" },
  ];

  const closeMenu = () => setIsOpen(false);

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Mobile Topbar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-black text-white flex items-center justify-between px-4 py-4 shadow-lg">
        <h2 className="text-xl font-bold text-orange-400">Admin Panel</h2>
        <button onClick={() => setIsOpen(true)} className="text-white">
          <Menu size={28} />
        </button>
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={closeMenu}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:static top-0 left-0 z-50 h-full w-64 bg-black text-white p-6 transform transition-transform duration-300
        ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        {/* Mobile close button */}
        <div className="md:hidden flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-orange-400">Admin Panel</h2>
          <button onClick={closeMenu} className="text-white">
            <X size={28} />
          </button>
        </div>

        {/* Desktop title */}
        <h2 className="hidden md:block text-2xl font-bold text-orange-400 mb-10">
          Admin Panel
        </h2>

        <nav className="space-y-4">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;

            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={closeMenu}
                className={`block px-4 py-3 rounded-xl transition font-medium ${
                  isActive
                    ? "bg-orange-500 text-white shadow-md"
                    : "text-white hover:bg-gray-800"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 w-full mt-16 md:mt-0 md:ml-0">
        <div className="bg-white rounded-2xl shadow-sm p-4 md:p-6 min-h-[calc(100vh-6rem)]">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Adminview;