import Order from "../models/Order.js";

export const addOrderItems = async (req, res) => {
  const {
    orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    estimatedDeliveryDate,
  } = req.body;
  if (orderItems && orderItems.length === 0) {
    res.status(400).json({ message: "No order items" });
  } else {
    const fallbackDeliveryDate = new Date();
    fallbackDeliveryDate.setDate(fallbackDeliveryDate.getDate() + 5);

    const order = new Order({
      orderItems,
      user: req.user._id,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      estimatedDeliveryDate: estimatedDeliveryDate || fallbackDeliveryDate,
    });
    const createdOrder = await order.save();
    res.status(201).json(createdOrder);
  }
};

export const getOrderById = async (req, res) => {
  const order = await Order.findById(req.params.id).populate(
    "user",
    "name email",
  );
  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  if (
    req.user.role === "admin" ||
    order.user._id.toString() === req.user._id.toString()
  ) {
    return res.json(order);
  }

  return res.status(403).json({ message: "Not authorized to view this order" });
};

export const getMyOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user._id });
  res.json(orders);
};

export const getAllOrders = async (req, res) => {
  const orders = await Order.find({}).populate("user", "name email");
  res.json(orders);
};

export const updateOrderStatus = async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (order) {
    order.status = req.body.status || order.status;
    order.estimatedDeliveryDate =
      req.body.estimatedDeliveryDate || order.estimatedDeliveryDate;

    if (req.body.status === "cancelled" && !order.cancelledAt) {
      order.cancelledAt = new Date();
    }

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } else {
    res.status(404).json({ message: "Order not found" });
  }
};

export const cancelOrder = async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404).json({ message: "Order not found" });
    return;
  }

  if (order.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
    res.status(403).json({ message: "Not authorized to cancel this order" });
    return;
  }

  if (
    order.isDelivered ||
    order.status === "Delivered" ||
    order.status === "delivered"
  ) {
    res.status(400).json({ message: "Delivered orders cannot be cancelled" });
    return;
  }

  order.status = "cancelled";
  order.cancelledAt = new Date();
  const updatedOrder = await order.save();
  res.json(updatedOrder);
};
