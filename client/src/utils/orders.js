import { assetUrl } from './api';

export const ORDER_STORAGE_KEY = 'aura_orders';
export const ORDER_UPDATED_EVENT = 'aura-orders-updated';
export const SEEN_ORDER_STORAGE_KEY = 'aura_seen_order_ids';

export const ORDER_STEPS = [
  { key: 'placed', label: 'Order Placed' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'packed', label: 'Packed' },
  { key: 'shipped', label: 'Shipped' },
  { key: 'out_for_delivery', label: 'Out for Delivery' },
  { key: 'delivered', label: 'Delivered' },
];

export const CANCELLED_STATUS = 'cancelled';

export const DEMO_ORDERS = [];

export const getStatusLabel = (status) => (
  status === CANCELLED_STATUS
    ? 'Cancelled'
    : ORDER_STEPS.find((step) => step.key === status)?.label || 'Order Placed'
);

export const getOrderImageUrl = (image) => (
  assetUrl(image)
);

export const getOrders = () => {
  const saved = localStorage.getItem(ORDER_STORAGE_KEY);
  if (!saved) return DEMO_ORDERS;

  try {
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : DEMO_ORDERS;
  } catch {
    return DEMO_ORDERS;
  }
};

export const getCustomerOrders = (user) => {
  if (!user) return [];

  const orders = getOrders();
  const userEmail = user.email?.toLowerCase();
  const userName = user.name?.toLowerCase();

  return orders.filter((order) => {
    if (userEmail && order.email?.toLowerCase() === userEmail) return true;
    if (userName && order.user?.toLowerCase() === userName) return true;
    return userName && order.shippingDetails?.fullName?.toLowerCase() === userName;
  });
};

export const saveOrders = (orders) => {
  localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(orders));
  window.dispatchEvent(new CustomEvent(ORDER_UPDATED_EVENT));
};

export const addOrder = (order) => {
  const orders = [order, ...getOrders()];
  saveOrders(orders);
  return orders;
};

export const updateOrder = (orderId, updates) => {
  const orders = getOrders().map((order) => (
    order.id === orderId ? { ...order, ...updates } : order
  ));
  saveOrders(orders);
  return orders;
};

export const updateOrderStatus = (orderId, status) => updateOrder(orderId, { status });

export const cancelOrder = (orderId) => updateOrder(orderId, {
  status: CANCELLED_STATUS,
  cancelledAt: new Date().toISOString(),
});

export const updateOrderDeliveryDate = (orderId, estimatedDeliveryDate) => (
  updateOrder(orderId, { estimatedDeliveryDate })
);

export const getSeenOrderIds = () => {
  const saved = localStorage.getItem(SEEN_ORDER_STORAGE_KEY);
  if (!saved) return [];

  try {
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const getNewOrdersForAdmin = () => {
  const seenOrderIds = new Set(getSeenOrderIds());
  return getOrders().filter((order) => !seenOrderIds.has(order.id));
};

export const markOrdersSeen = (orderIds) => {
  const seenOrderIds = new Set(getSeenOrderIds());
  orderIds.forEach((orderId) => seenOrderIds.add(orderId));
  localStorage.setItem(SEEN_ORDER_STORAGE_KEY, JSON.stringify([...seenOrderIds]));
  window.dispatchEvent(new CustomEvent(ORDER_UPDATED_EVENT));
};

export const createEstimatedDeliveryDate = (daysFromNow = 5) => {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString().slice(0, 10);
};

export const createOrderId = () => `#ORD-${Math.floor(10000 + Math.random() * 90000)}`;
