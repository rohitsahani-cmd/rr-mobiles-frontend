import React, { useEffect, useState } from "react";

const Orders = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      const token = localStorage.getItem("token");

      try {
        const res = await fetch("https://rr-mobiles-backend.onrender.com/api/orders/my-orders", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (data.success) {
          setOrders(data.orders);
        }
      } catch (error) {
        console.log(error);
      }
    };

    fetchOrders();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 pb-10">
      <div className="max-w-6xl mx-auto px-4 pt-6">
        <h1 className="text-3xl font-bold mb-6">My Orders</h1>

        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order._id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5"
            >
              <div className="flex justify-between mb-3">
                <p className="font-bold">Order #{order._id.slice(-6)}</p>
                <p className="text-orange-500 font-semibold">{order.orderStatus}</p>
              </div>

              <p className="text-sm text-gray-500 mb-3">
                Total: ₹{order.total}
              </p>

              <div className="space-y-2">
                {order.items.map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-14 h-14 object-cover rounded-lg"
                    />
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-500">
                        ₹{item.price} x {item.quantity}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Orders;