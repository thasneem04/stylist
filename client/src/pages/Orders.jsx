import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  CalendarDays,
  CheckCircle,
  Clock,
  Package,
  ShoppingBag,
  Truck,
  XCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import {
  cancelOrder,
  CANCELLED_STATUS,
  getCustomerOrders,
  getOrderImageUrl,
  getStatusLabel,
  ORDER_STEPS,
  ORDER_UPDATED_EVENT,
} from "../utils/orders";

const Orders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [activeTrackOrderId, setActiveTrackOrderId] = useState(null);

  const toggleTrackOrder = (orderId) => {
    setActiveTrackOrderId((prev) => (prev === orderId ? null : orderId));
  };

  useEffect(() => {
    const refreshOrders = () => setOrders(getCustomerOrders(user));

    refreshOrders();
    window.addEventListener(ORDER_UPDATED_EVENT, refreshOrders);
    window.addEventListener("focus", refreshOrders);
    window.addEventListener("storage", refreshOrders);
    document.addEventListener("visibilitychange", refreshOrders);

    return () => {
      window.removeEventListener(ORDER_UPDATED_EVENT, refreshOrders);
      window.removeEventListener("focus", refreshOrders);
      window.removeEventListener("storage", refreshOrders);
      document.removeEventListener("visibilitychange", refreshOrders);
    };
  }, [user]);

  const getStepIndex = (status) => {
    const index = ORDER_STEPS.findIndex((step) => step.key === status);
    return index >= 0 ? index : 0;
  };

  const getStatusIcon = (status) => {
    if (status === CANCELLED_STATUS)
      return <XCircle className="text-red-400" size={20} />;
    if (status === "delivered")
      return <CheckCircle className="text-green-500" size={20} />;
    if (status === "shipped" || status === "out_for_delivery")
      return <Truck className="text-accent" size={20} />;
    if (status === "packed")
      return <Package className="text-accent" size={20} />;
    return <Clock className="text-yellow-500" size={20} />;
  };

  const handleCancelOrder = (orderId) => {
    if (!window.confirm("Cancel this order?")) return;
    setOrders(
      cancelOrder(orderId).filter((order) =>
        getCustomerOrders(user).some(
          (customerOrder) => customerOrder.id === order.id,
        ),
      ),
    );
    toast.success(`Order ${orderId} cancelled`);
  };

  if (orders.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 flex flex-col items-center justify-center text-center">
        <div className="w-24 h-24 rounded-full glass flex items-center justify-center mb-6">
          <ShoppingBag size={40} className="text-gray-400" />
        </div>
        <h2 className="text-3xl font-black uppercase tracking-tight mb-4">
          No orders yet
        </h2>
        <p className="text-gray-400 mb-8 max-w-md">
          {user
            ? "Your placed orders and delivery progress will appear here."
            : "Please sign in to see your orders."}
        </p>
        <Link
          to={user ? "/products" : "/login"}
          className="bg-gradient-btn px-8 py-4 rounded-xl font-bold uppercase tracking-wider text-sm"
        >
          {user ? "Start Shopping" : "Sign In"}
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight sm:text-3xl">
            My Orders
          </h1>
          <p className="text-gray-400 mt-2">
            Track each order from placement to delivery.
          </p>
        </div>
      </div>

      <div className="space-y-8">
        {orders.map((order) => {
          const activeStep = getStepIndex(order.status);
          const isCancelled = order.status === CANCELLED_STATUS;
          const canCancel = !isCancelled && order.status !== "delivered";

          return (
            <div key={order.id} className="glass-card overflow-hidden">
              <div className="flex flex-col justify-between gap-6 border-b border-white/10 bg-white/5 p-4 sm:p-6 lg:flex-row">
                <div className="grid flex-1 grid-cols-1 gap-4 text-sm sm:grid-cols-2 md:grid-cols-5 md:gap-6">
                  <div>
                    <span className="block text-gray-500 mb-1">Order Date</span>
                    <span className="font-medium">{order.date}</span>
                  </div>
                  <div>
                    <span className="block text-gray-500 mb-1">
                      Total Amount
                    </span>
                    <span className="font-medium">
                      ₹{Number(order.total).toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="block text-gray-500 mb-1">
                      Order Number
                    </span>
                    <span className="font-medium text-accent">{order.id}</span>
                  </div>
                  <div>
                    <span className="block text-gray-500 mb-1">Customer</span>
                    <span className="font-medium">
                      {order.user ||
                        order.shippingDetails?.fullName ||
                        user?.name}
                    </span>
                  </div>
                  <div>
                    <span className="block text-gray-500 mb-1">
                      Delivery Date
                    </span>
                    <div className="flex items-center gap-2">
                      <CalendarDays size={16} className="text-accent" />
                      <input
                        type="date"
                        value={order.estimatedDeliveryDate || ""}
                        readOnly
                        className="w-full max-w-40 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-white outline-none"
                        aria-label={`Estimated delivery date for order ${order.id}`}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end gap-3">
                  <div
                    className={`flex items-center gap-2 text-sm font-bold uppercase tracking-wider ${isCancelled ? "text-red-400" : ""}`}
                  >
                    {getStatusIcon(order.status)}
                    <span>{getStatusLabel(order.status)}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleTrackOrder(order.id)}
                    className="px-4 py-2 rounded-lg border border-accent/30 bg-accent/10 text-accent text-xs font-bold uppercase tracking-wider hover:bg-accent/20"
                  >
                    {activeTrackOrderId === order.id
                      ? "Hide Progress"
                      : "Track Order"}
                  </button>
                  {canCancel && (
                    <button
                      type="button"
                      onClick={() => handleCancelOrder(order.id)}
                      className="px-4 py-2 rounded-lg border border-red-400/30 bg-red-500/10 text-red-300 text-xs font-bold uppercase tracking-wider hover:bg-red-500/20"
                    >
                      Cancel Order
                    </button>
                  )}
                </div>
              </div>

              <div className="p-4 sm:p-6">
                {isCancelled ? (
                  <div className="mb-8 rounded-xl border border-red-400/20 bg-red-500/10 p-5 text-red-100">
                    <div className="flex items-center gap-3 font-bold uppercase tracking-wider text-sm">
                      <XCircle size={20} />
                      Customer cancelled this order
                    </div>
                    {order.cancelledAt && (
                      <p className="mt-2 text-sm text-red-100/70">
                        Cancelled on{" "}
                        {new Date(order.cancelledAt).toISOString().slice(0, 10)}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="mb-8 pb-2">
                    {activeTrackOrderId === order.id ? (
                      <div className="overflow-x-auto pb-2">
                        <div className="grid gap-4 sm:grid-cols-6 sm:min-w-180">
                          {ORDER_STEPS.map((step, index) => {
                            const isDone = index <= activeStep;
                            const isCurrent = index === activeStep;

                            return (
                              <div
                                key={step.key}
                                className="relative flex items-start gap-3 sm:flex-col sm:items-center"
                              >
                                {index < ORDER_STEPS.length - 1 && (
                                  <>
                                    <div
                                      className={`absolute top-5 left-1/2 hidden w-full h-1 sm:block ${index < activeStep ? "bg-accent" : "bg-white/10"}`}
                                    />
                                    <div
                                      className={`absolute left-4 top-10 bottom-0 w-px sm:hidden ${index < activeStep ? "bg-accent" : "bg-white/10"}`}
                                    />
                                  </>
                                )}
                                <div
                                  className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center border-2 ${isDone ? "bg-accent border-accent text-white" : "bg-black border-white/20 text-gray-500"}`}
                                >
                                  {isDone ? (
                                    <CheckCircle size={18} />
                                  ) : (
                                    <span className="text-xs font-bold">
                                      {index + 1}
                                    </span>
                                  )}
                                </div>
                                <div className="text-center px-2">
                                  <p
                                    className={`text-xs font-bold uppercase tracking-wider ${isCurrent ? "text-accent" : isDone ? "text-white" : "text-gray-500"}`}
                                  >
                                    {step.label}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="mb-8 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-gray-400">
                        Click the Track Order button to view this order's
                        delivery progress.
                      </div>
                    )}
                  </div>
                )}

                <div className="divide-y divide-white/10">
                  {order.items?.map((item, index) => (
                    <div
                      key={`${order.id}-${index}`}
                      className="flex items-center gap-4 py-4 first:pt-0 last:pb-0 sm:gap-6"
                    >
                      <div className="h-20 w-16 shrink-0 overflow-hidden rounded-lg bg-white/5 sm:h-24 sm:w-20">
                        <img
                          src={getOrderImageUrl(item.image)}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold">
                          <Link to="#" className="hover:text-accent">
                            {item.name}
                          </Link>
                        </h4>
                        <p className="text-sm text-gray-400 mt-1">
                          ₹{Number(item.price).toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-400 mt-1">
                          Qty: {item.qty}
                        </p>
                      </div>
                      <div className="hidden sm:block">
                        <button className="text-accent text-sm font-bold uppercase tracking-wider hover:text-accent-purple">
                          Buy Again
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Orders;
