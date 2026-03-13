import React, { useEffect, useMemo, useState } from "react";

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [trackingData, setTrackingData] = useState({});
  const [loadingOrderId, setLoadingOrderId] = useState(null);

  const getToken = () => localStorage.getItem("token");

  const fetchOrders = async () => {
    try {
      const res = await fetch("https://rr-mobiles-backend-1.onrender.com/api/orders/admin/all", {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });

      const data = await res.json();

      if (data.success) {
        setOrders(data.orders || []);
      } else {
        alert(data.message || "Failed to fetch orders");
      }
    } catch (error) {
      console.log("Fetch admin orders error:", error);
      alert("Something went wrong while fetching orders");
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleFieldChange = (orderId, field, value) => {
    setTrackingData((prev) => ({
      ...prev,
      [orderId]: {
        ...prev[orderId],
        [field]: value,
      },
    }));
  };

  const createShipment = async (orderId) => {
    setLoadingOrderId(orderId);

    try {
      const res = await fetch(
        `https://rr-mobiles-backend-1.onrender.com/api/orders/admin/ship/${orderId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );

      const data = await res.json();

      if (data.success) {
        alert(data.message || "Shipment processed successfully");
        fetchOrders();
      } else {
        alert(data.message || "Failed to create shipment");
      }
    } catch (error) {
      console.log("Create shipment error:", error);
      alert("Something went wrong while creating shipment");
    } finally {
      setLoadingOrderId(null);
    }
  };

  const updateOrder = async (orderId, fallbackOrder) => {
    setLoadingOrderId(orderId);

    const formData = trackingData[orderId] || {};

    try {
      const res = await fetch(
        `https://rr-mobiles-backend-1.onrender.com/api/orders/admin/update/${orderId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
          },
          body: JSON.stringify({
            orderStatus: formData.orderStatus || fallbackOrder.orderStatus,
            courierPartner:
              formData.courierPartner ?? fallbackOrder.courierPartner ?? "",
            trackingId: formData.trackingId ?? fallbackOrder.trackingId ?? "",
            estimatedDelivery:
              formData.estimatedDelivery ??
              (fallbackOrder.estimatedDelivery
                ? new Date(fallbackOrder.estimatedDelivery)
                    .toISOString()
                    .split("T")[0]
                : ""),
          }),
        }
      );

      const data = await res.json();

      if (data.success) {
        alert(data.message || "Order updated successfully");
        fetchOrders();
      } else {
        alert(data.message || "Failed to update order");
      }
    } catch (error) {
      console.log("Update order error:", error);
      alert("Something went wrong while updating the order");
    } finally {
      setLoadingOrderId(null);
    }
  };

  const deleteOrder = async (orderId) => {
    if (
      !window.confirm(
        "Are you sure you want to permanently delete this cancelled order?"
      )
    ) {
      return;
    }

    setLoadingOrderId(orderId);

    try {
      const res = await fetch(
        `https://rr-mobiles-backend-1.onrender.com/api/orders/admin/delete/${orderId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );

      const data = await res.json();

      if (data.success) {
        alert(data.message || "Order deleted successfully");
        fetchOrders();
      } else {
        alert(data.message || "Failed to delete order");
      }
    } catch (error) {
      console.log("Delete order error:", error);
      alert("Something went wrong while deleting the order");
    } finally {
      setLoadingOrderId(null);
    }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const query = search.toLowerCase();

      const matchesSearch =
        order._id?.toLowerCase().includes(query) ||
        order.user?.name?.toLowerCase().includes(query) ||
        order.user?.email?.toLowerCase().includes(query) ||
        order.address?.phone?.includes(search);

      const matchesStatus =
        statusFilter === "All" || order.orderStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [orders, search, statusFilter]);

  const summary = useMemo(() => {
    return {
      total: orders.length,
      pending: orders.filter((o) => o.orderStatus === "Pending").length,
      confirmed: orders.filter((o) => o.orderStatus === "Confirmed").length,
      shipped: orders.filter(
        (o) =>
          o.orderStatus === "Shipped" ||
          o.orderStatus === "Out for Delivery"
      ).length,
      delivered: orders.filter((o) => o.orderStatus === "Delivered").length,
    };
  }, [orders]);

  const getOrderStatusBadge = (status) => {
    const styles = {
      Pending: "bg-yellow-100 text-yellow-700",
      Confirmed: "bg-blue-100 text-blue-700",
      Shipped: "bg-indigo-100 text-indigo-700",
      "Out for Delivery": "bg-purple-100 text-purple-700",
      Delivered: "bg-green-100 text-green-700",
      Cancelled: "bg-red-100 text-red-700",
    };

    return styles[status] || "bg-gray-100 text-gray-700";
  };

  return (
    <div className="min-h-screen bg-gray-100 pb-10">
      <div className="max-w-7xl mx-auto px-4 pt-6">
        <div className="mb-6">
          <h1 className="text-3xl sm:text-4xl font-bold text-black">Orders</h1>
          <p className="text-gray-500 mt-1">
            Manage all customer orders professionally
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <p className="text-sm text-gray-500">Total Orders</p>
            <h2 className="text-2xl font-bold text-black mt-1">
              {summary.total}
            </h2>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <p className="text-sm text-gray-500">Pending</p>
            <h2 className="text-2xl font-bold text-yellow-600 mt-1">
              {summary.pending}
            </h2>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <p className="text-sm text-gray-500">Confirmed</p>
            <h2 className="text-2xl font-bold text-blue-600 mt-1">
              {summary.confirmed}
            </h2>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <p className="text-sm text-gray-500">In Transit</p>
            <h2 className="text-2xl font-bold text-indigo-600 mt-1">
              {summary.shipped}
            </h2>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <p className="text-sm text-gray-500">Delivered</p>
            <h2 className="text-2xl font-bold text-green-600 mt-1">
              {summary.delivered}
            </h2>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6 flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
          <input
            type="text"
            placeholder="Search by order ID, customer, email, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-gray-300 rounded-xl px-4 py-3 w-full md:max-w-lg outline-none focus:ring-2 focus:ring-orange-500"
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="All">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Shipped">Shipped</option>
            <option value="Out for Delivery">Out for Delivery</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        <div className="space-y-6">
          {filteredOrders.map((order) => {
            const formData = trackingData[order._id] || {};
            const isLoading = loadingOrderId === order._id;

            return (
              <div
                key={order._id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5"
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-5">
                  <div>
                    <h2 className="text-xl font-bold text-black">
                      Order #{order._id?.slice(-8)}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleString()
                        : "No date"}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getOrderStatusBadge(
                        order.orderStatus
                      )}`}
                    >
                      {order.orderStatus}
                    </span>

                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700">
                      {order.paymentMethod || "N/A"}
                    </span>

                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-orange-50 text-orange-700">
                      ₹{order.total || 0}
                    </span>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-bold text-black mb-3">
                      Customer Details
                    </h3>

                    <div className="space-y-2 text-sm sm:text-base">
                      <p>
                        <span className="font-semibold">Name:</span>{" "}
                        {order.user?.name || "N/A"}
                      </p>
                      <p>
                        <span className="font-semibold">Email:</span>{" "}
                        {order.user?.email || "N/A"}
                      </p>
                      <p>
                        <span className="font-semibold">Phone:</span>{" "}
                        {order.address?.phone || "N/A"}
                      </p>
                      <p>
                        <span className="font-semibold">Order ID:</span>{" "}
                        {order._id}
                      </p>
                      {order.razorpayPaymentId && (
                        <p>
                          <span className="font-semibold">Payment ID:</span>{" "}
                          {order.razorpayPaymentId}
                        </p>
                      )}
                    </div>

                    <div className="mt-5">
                      <div className="flex flex-wrap gap-3 mb-4">
                        {order.orderStatus === "Cancelled" && (
                          <button
                            onClick={() => deleteOrder(order._id)}
                            disabled={isLoading}
                            className="bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white px-4 py-2 rounded-xl font-medium transition"
                          >
                            {isLoading ? "Deleting..." : "Delete Order"}
                          </button>
                        )}

                        {order.orderStatus === "Confirmed" && (
                          <button
                            onClick={() => createShipment(order._id)}
                            disabled={isLoading}
                            className="bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white px-4 py-2 rounded-xl font-medium transition"
                          >
                            {isLoading ? "Processing..." : "Create Shipment"}
                          </button>
                        )}
                      </div>

                      <h3 className="text-lg font-bold text-black mb-3">
                        Delivery Address
                      </h3>
                      <div className="text-sm sm:text-base text-gray-700 leading-6">
                        <p>{order.address?.fullName}</p>
                        <p>{order.address?.street}</p>
                        <p>
                          {order.address?.city}, {order.address?.state}
                        </p>
                        <p>{order.address?.pincode}</p>
                      </div>
                    </div>

                    {(order.courierPartner ||
                      order.trackingId ||
                      order.shiprocketOrderId ||
                      order.estimatedDelivery) && (
                      <div className="mt-5 bg-gray-50 border border-gray-200 rounded-xl p-4">
                        <h3 className="text-base font-bold text-black mb-3">
                          Shipping Details
                        </h3>

                        <div className="space-y-2 text-sm text-gray-700">
                          {order.shiprocketOrderId && (
                            <p>
                              <span className="font-semibold">
                                Shiprocket Order ID:
                              </span>{" "}
                              {order.shiprocketOrderId}
                            </p>
                          )}
                          {order.courierPartner && (
                            <p>
                              <span className="font-semibold">Courier:</span>{" "}
                              {order.courierPartner}
                            </p>
                          )}
                          {order.trackingId && (
                            <p>
                              <span className="font-semibold">Tracking ID:</span>{" "}
                              {order.trackingId}
                            </p>
                          )}
                          {order.estimatedDelivery && (
                            <p>
                              <span className="font-semibold">
                                Estimated Delivery:
                              </span>{" "}
                              {new Date(
                                order.estimatedDelivery
                              ).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-black mb-3">
                      Ordered Items
                    </h3>

                    <div className="space-y-3">
                      {(order.items || []).map((item, index) => (
                        <div
                          key={index}
                          className="flex gap-3 items-center border border-gray-100 rounded-xl p-3"
                        >
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                          <div className="flex-1">
                            <p className="font-semibold text-black line-clamp-2">
                              {item.name}
                            </p>
                            <p className="text-sm text-gray-500">
                              ₹{item.price} × {item.quantity}
                            </p>
                            {item.category && (
                              <p className="text-sm text-gray-500">
                                {item.category}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-5 border-t pt-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600">Subtotal</span>
                        <span>₹{order.subtotal || 0}</span>
                      </div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600">Delivery</span>
                        <span>₹{0}</span>
                      </div>
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total</span>
                        <span>₹{order.total || 0}</span>
                      </div>
                    </div>

                    <div className="mt-5">
                      <h3 className="text-lg font-bold text-black mb-3">
                        Update Order / Tracking
                      </h3>

                      <div className="space-y-3">
                        <select
                          value={formData.orderStatus || order.orderStatus}
                          onChange={(e) =>
                            handleFieldChange(
                              order._id,
                              "orderStatus",
                              e.target.value
                            )
                          }
                          className="border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500 w-full"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Confirmed">Confirmed</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Out for Delivery">
                            Out for Delivery
                          </option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>

                        <input
                          type="text"
                          placeholder="Courier Partner"
                          value={
                            formData.courierPartner ??
                            order.courierPartner ??
                            ""
                          }
                          onChange={(e) =>
                            handleFieldChange(
                              order._id,
                              "courierPartner",
                              e.target.value
                            )
                          }
                          className="border border-gray-300 rounded-lg px-3 py-2 w-full"
                        />

                        <input
                          type="text"
                          placeholder="Tracking ID"
                          value={formData.trackingId ?? order.trackingId ?? ""}
                          onChange={(e) =>
                            handleFieldChange(
                              order._id,
                              "trackingId",
                              e.target.value
                            )
                          }
                          className="border border-gray-300 rounded-lg px-3 py-2 w-full"
                        />

                        <input
                          type="date"
                          value={
                            formData.estimatedDelivery ??
                            (order.estimatedDelivery
                              ? new Date(order.estimatedDelivery)
                                  .toISOString()
                                  .split("T")[0]
                              : "")
                          }
                          onChange={(e) =>
                            handleFieldChange(
                              order._id,
                              "estimatedDelivery",
                              e.target.value
                            )
                          }
                          className="border border-gray-300 rounded-lg px-3 py-2 w-full"
                        />

                        <button
                          onClick={() => updateOrder(order._id, order)}
                          disabled={isLoading}
                          className="w-full bg-black hover:bg-gray-800 disabled:opacity-60 text-white px-5 py-3 rounded-xl font-medium transition"
                        >
                          {isLoading ? "Saving..." : "Save Changes"}
                        </button>
                      </div>

                      {(order.courierPartner ||
                        order.trackingId ||
                        order.estimatedDelivery) && (
                        <div className="mt-4 bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm text-gray-700">
                          {order.courierPartner && (
                            <p>
                              <span className="font-semibold">Courier:</span>{" "}
                              {order.courierPartner}
                            </p>
                          )}
                          {order.trackingId && (
                            <p>
                              <span className="font-semibold">Tracking ID:</span>{" "}
                              {order.trackingId}
                            </p>
                          )}
                          {order.estimatedDelivery && (
                            <p>
                              <span className="font-semibold">
                                Estimated Delivery:
                              </span>{" "}
                              {new Date(
                                order.estimatedDelivery
                              ).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {filteredOrders.length === 0 && (
            <div className="bg-white rounded-2xl p-10 text-center border border-gray-100">
              <h2 className="text-2xl font-bold text-black mb-2">
                No orders found
              </h2>
              <p className="text-gray-500">
                Try changing search or filter options.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminOrders;