import { useCallback, useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  CalendarDays,
  Package,
  ShoppingBag,
  Plus,
  Pencil,
  Trash2,
  Users,
  DollarSign,
  X,
  ImagePlus,
  Star,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  CANCELLED_STATUS,
  getNewOrdersForAdmin,
  getOrders,
  getStatusLabel,
  markOrdersSeen,
  ORDER_STEPS,
  ORDER_UPDATED_EVENT,
  updateOrderDeliveryDate,
  updateOrderStatus,
} from "../utils/orders";
import { apiUrl, assetUrl } from "../utils/api";
import { useAuth } from "../context/AuthContext";

const PLACEHOLDER_IMAGE = "https://via.placeholder.com/80x105?text=No+Image";

const AdminDashboard = ({ tab = "dashboard" }) => {
  const navigate = useNavigate();
  const activeTab = tab;
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [newOrders, setNewOrders] = useState([]);
  const hasShownNewOrderToast = useRef(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "abaya",
    image: "",
    color: "black",
    occasion: "casual",
    isFeatured: false,
  });
  const [imageFile, setImageFile] = useState(null);
  const [sizePrices, setSizePrices] = useState([
    { size: "S", price: "", originalPrice: "", stock: 0 },
    { size: "M", price: "", originalPrice: "", stock: 0 },
    { size: "L", price: "", originalPrice: "", stock: 0 },
  ]);

  const { adminToken } = useAuth();
  const getImageUrl = (image) => {
    if (!image || typeof image !== "string" || image.trim() === "") {
      return PLACEHOLDER_IMAGE;
    }
    return assetUrl(image);
  };
  const isUnsplashImage = useCallback(
    (image = "") =>
      image.includes("images.unsplash.com") || image.includes("unsplash.com"),
    [],
  );
  const getCustomerName = (order) =>
    order.user || order.shippingDetails?.fullName || "Customer";
  const authHeaders = () =>
    adminToken ? { Authorization: `Bearer ${adminToken}` } : {};

  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch(apiUrl("/products"));
      const data = await res.json();
      setProducts(
        Array.isArray(data)
          ? data.filter((product) => !isUnsplashImage(product.image))
          : [],
      );
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  }, [isUnsplashImage]);

  useEffect(() => {
    const refreshOrders = () => {
      setOrders(getOrders());
      setNewOrders(getNewOrdersForAdmin());
    };
    const productsTimer = window.setTimeout(fetchProducts, 0);
    const ordersTimer = window.setTimeout(refreshOrders, 0);

    window.addEventListener(ORDER_UPDATED_EVENT, refreshOrders);
    window.addEventListener("focus", refreshOrders);
    window.addEventListener("storage", refreshOrders);
    document.addEventListener("visibilitychange", refreshOrders);

    return () => {
      window.removeEventListener(ORDER_UPDATED_EVENT, refreshOrders);
      window.removeEventListener("focus", refreshOrders);
      window.removeEventListener("storage", refreshOrders);
      document.removeEventListener("visibilitychange", refreshOrders);
      window.clearTimeout(productsTimer);
      window.clearTimeout(ordersTimer);
    };
  }, [fetchProducts]);

  const openNewOrders = useCallback(() => {
    if (newOrders.length > 0) {
      markOrdersSeen(newOrders.map((order) => order.id));
      setNewOrders([]);
    }
    navigate("/admin/orders");
  }, [navigate, newOrders]);

  useEffect(() => {
    if (activeTab === "orders" && newOrders.length > 0) {
      markOrdersSeen(newOrders.map((order) => order.id));
    }
  }, [activeTab, newOrders]);

  useEffect(() => {
    if (
      activeTab !== "dashboard" ||
      newOrders.length === 0 ||
      hasShownNewOrderToast.current
    )
      return;

    toast.custom(
      (toastInstance) => (
        <button
          type="button"
          onClick={() => {
            toast.dismiss(toastInstance.id);
            openNewOrders();
          }}
          className="flex items-center gap-3 rounded-xl border border-accent/30 bg-black/90 px-5 py-4 text-left text-white shadow-xl"
        >
          <Bell size={20} className="text-accent" />
          <span>
            <span className="block text-sm font-bold uppercase tracking-wider">
              New order
            </span>
            <span className="block text-xs text-gray-300">
              Click to open the orders section
            </span>
          </span>
        </button>
      ),
      { duration: 8000 },
    );
    hasShownNewOrderToast.current = true;
  }, [activeTab, hasShownNewOrderToast, newOrders, openNewOrders]);

  const handleStatusChange = (orderId, status) => {
    setOrders(updateOrderStatus(orderId, status));
    toast.success(`Order ${orderId} marked ${getStatusLabel(status)}`);
  };

  const handleDeliveryDateChange = (orderId, estimatedDeliveryDate) => {
    setOrders(updateOrderDeliveryDate(orderId, estimatedDeliveryDate));
    toast.success(`Delivery date updated for ${orderId}`);
  };

  const resetProductForm = () => {
    setEditingProduct(null);
    setImageFile(null);
    setFormData({
      name: "",
      description: "",
      category: "abaya",
      image: "",
      color: "black",
      occasion: "casual",
      isFeatured: false,
    });
    setSizePrices([
      { size: "S", price: "", originalPrice: "", stock: 0 },
      { size: "M", price: "", originalPrice: "", stock: 0 },
      { size: "L", price: "", originalPrice: "", stock: 0 },
    ]);
  };

  const openAddModal = () => {
    resetProductForm();
    setIsModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setImageFile(null);
    setFormData({
      name: product.name || "",
      description: product.description || "",
      category: product.category || "abaya",
      image: product.image || "",
      color: product.color || product.colors?.[0] || "black",
      occasion: product.occasion || "casual",
      isFeatured: Boolean(product.isFeatured),
    });
    setSizePrices(
      product.sizePrices?.length
        ? product.sizePrices.map((item) => ({
            size: item.size,
            price: item.price,
            originalPrice: item.originalPrice || item.price,
            stock: item.stock || 0,
          }))
        : (product.sizes || product.size || ["S", "M", "L"]).map((size) => ({
            size,
            price: product.price || "",
            originalPrice: product.originalPrice || product.price || "",
            stock: product.countInStock || 0,
          })),
    );
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    // Modest fashion check
    const nonModestKeywords = [
      "short",
      "mini",
      "sleeveless",
      "crop",
      "revealing",
    ];
    if (
      nonModestKeywords.some(
        (kw) =>
          formData.name.toLowerCase().includes(kw) ||
          formData.description.toLowerCase().includes(kw),
      )
    ) {
      return toast.error(
        "Product must follow MODEST FASHION rules (no short/sleeveless/crop tops).",
      );
    }

    const validSizePrices = sizePrices
      .filter((item) => item.size && item.price)
      .map((item) => ({
        size: item.size.toUpperCase(),
        price: Number(item.price),
        originalPrice: item.originalPrice
          ? Number(item.originalPrice)
          : Number(item.price),
        stock: Number(item.stock || 0),
      }));

    if (!imageFile && !editingProduct?.image)
      return toast.error("Please upload a product image from your PC.");
    if (validSizePrices.length === 0)
      return toast.error("Add at least one size with price.");

    try {
      let productImage = editingProduct?.image || "";
      if (imageFile) {
        const uploadData = new FormData();
        uploadData.append("image", imageFile);
        const uploadRes = await fetch(apiUrl("/products/upload"), {
          method: "POST",
          headers: authHeaders(),
          body: uploadData,
        });
        const uploadJson = await uploadRes.json();
        if (!uploadRes.ok)
          throw new Error(uploadJson.message || "Image upload failed");
        productImage = uploadJson.image;
      }

      const res = await fetch(
        apiUrl(`/products${editingProduct ? `/${editingProduct._id}` : ""}`),
        {
          method: editingProduct ? "PUT" : "POST",
          headers: { "Content-Type": "application/json", ...authHeaders() },
          body: JSON.stringify({
            ...formData,
            image: productImage,
            colors: [formData.color],
            sizePrices: validSizePrices,
          }),
        },
      );
      if (res.ok) {
        toast.success(
          editingProduct
            ? "Product updated successfully!"
            : "Product added successfully!",
        );
        setIsModalOpen(false);
        resetProductForm();
        fetchProducts();
      } else {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to save product");
      }
    } catch (error) {
      toast.error(error.message || "Failed to save product");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this product?")) {
      try {
        const res = await fetch(apiUrl(`/products/${id}`), {
          method: "DELETE",
          headers: authHeaders(),
        });
        if (res.ok) {
          toast.success("Product deleted");
          fetchProducts();
        } else {
          const errorData = await res.json();
          throw new Error(errorData.message || "Failed to delete");
        }
      } catch (error) {
        toast.error(error.message || "Failed to delete");
      }
    }
  };

  const handleToggleFeatured = async (product) => {
    try {
      const nextFeaturedValue = !product.isFeatured;
      const res = await fetch(apiUrl(`/products/${product._id}`), {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ isFeatured: nextFeaturedValue }),
      });

      const data = await res.json();
      if (!res.ok)
        throw new Error(data.message || "Failed to update featured status");

      setProducts((prev) =>
        prev.map((item) =>
          item._id === product._id
            ? { ...item, isFeatured: data.isFeatured }
            : item,
        ),
      );
      toast.success(
        nextFeaturedValue
          ? "Product marked as featured"
          : "Product removed from featured",
      );
    } catch (error) {
      toast.error(error.message || "Failed to update featured status");
    }
  };

  const stats = [
    {
      label: "Revenue",
      value: "₹8,420",
      icon: DollarSign,
      color: "text-accent",
    },
    {
      label: "Orders",
      value: orders.length,
      icon: ShoppingBag,
      color: "text-accent-purple",
    },
    {
      label: "Products",
      value: products.length,
      icon: Package,
      color: "text-accent",
    },
    { label: "Users", value: "850", icon: Users, color: "text-accent-purple" },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-black uppercase tracking-tight sm:text-3xl">
          {activeTab}
        </h1>
        {activeTab === "products" && (
          <button
            onClick={openAddModal}
            className="bg-gradient-btn flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3 text-xs font-bold uppercase tracking-widest sm:w-auto"
          >
            <Plus size={18} /> Add Modest Outfit
          </button>
        )}
      </div>

      {activeTab === "dashboard" && (
        <>
          {newOrders.length > 0 && (
            <button
              type="button"
              onClick={openNewOrders}
              className="mb-6 flex w-full flex-col gap-4 border border-accent/30 p-5 text-left hover:bg-white/10 sm:flex-row sm:items-center sm:justify-between glass-card"
            >
              <span className="flex items-center gap-4">
                <span className="p-3 rounded-xl bg-accent/20 text-accent">
                  <Bell size={22} />
                </span>
                <span>
                  <span className="block text-sm font-black uppercase tracking-widest">
                    New order notification
                  </span>
                  <span className="block text-xs text-gray-400 mt-1">
                    {newOrders.length} new order
                    {newOrders.length > 1 ? "s" : ""} waiting in the orders
                    section.
                  </span>
                </span>
              </span>
              <span className="bg-gradient-btn inline-flex justify-center rounded-xl px-5 py-3 text-xs font-bold uppercase tracking-wider">
                Open Orders
              </span>
            </button>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="glass-card p-6 flex items-center gap-6"
              >
                <div className={`p-4 rounded-xl bg-white/5 ${stat.color}`}>
                  <stat.icon size={24} />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-black">{stat.value}</p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {activeTab === "products" && (
        <div className="glass-card overflow-x-auto">
          <table className="min-w-[760px] w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 text-[10px] uppercase tracking-widest text-gray-400 border-b border-white/10">
                <th className="p-6">Product</th>
                <th className="p-6">Category</th>
                <th className="p-6">Price</th>
                <th className="p-6">Stock</th>
                <th className="p-6">Featured</th>
                <th className="p-6">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {products.map((p) => (
                <tr key={p._id} className="hover:bg-white/5 transition-colors">
                  <td className="p-6">
                    <div className="flex items-center gap-4">
                      <img
                        src={getImageUrl(p.image)}
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = PLACEHOLDER_IMAGE;
                        }}
                        className="w-12 h-16 object-cover rounded-lg"
                        alt={p.name || "Product image"}
                      />
                      <span className="font-bold text-sm truncate max-w-[200px]">
                        {p.name}
                      </span>
                    </div>
                  </td>
                  <td className="p-6 text-sm text-gray-400 capitalize">
                    {p.category}
                  </td>
                  <td className="p-6 font-bold text-accent">
                    ₹{Number(p.price).toFixed(2)}
                  </td>
                  <td className="p-6 text-sm">{p.countInStock}</td>
                  <td className="p-6 text-sm">
                    <button
                      type="button"
                      onClick={() => handleToggleFeatured(p)}
                      className={`inline-flex items-center gap-1 rounded-full px-3 py-2 text-[10px] font-bold uppercase tracking-wider transition-colors ${
                        p.isFeatured
                          ? "bg-accent/20 text-accent hover:bg-accent/30"
                          : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      <Star
                        size={13}
                        fill={p.isFeatured ? "currentColor" : "none"}
                      />
                      {p.isFeatured ? "Featured" : "Mark"}
                    </button>
                  </td>
                  <td className="p-6">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditModal(p)}
                        className="p-2 glass rounded-lg hover:bg-white/10 text-gray-400"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(p._id)}
                        className="p-2 glass rounded-lg hover:bg-red-500/20 text-red-500"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "orders" && (
        <div className="glass-card overflow-x-auto">
          <table className="min-w-[900px] w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 text-[10px] uppercase tracking-widest text-gray-400 border-b border-white/10">
                <th className="p-6">Order ID</th>
                <th className="p-6">Customer</th>
                <th className="p-6">Total</th>
                <th className="p-6">Status</th>
                <th className="p-6">Delivery Date</th>
                <th className="p-6">Date</th>
                <th className="p-6">Items</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-6 font-mono text-xs text-accent">{o.id}</td>
                  <td className="p-6 text-sm font-bold">
                    {getCustomerName(o)}
                  </td>
                  <td className="p-6 font-bold">
                    ₹{Number(o.total).toFixed(2)}
                  </td>
                  <td className="p-6">
                    <select
                      value={o.status}
                      onChange={(e) => handleStatusChange(o.id, e.target.value)}
                      className={`text-[10px] font-bold uppercase tracking-widest px-3 py-2 rounded-full border border-white/10 outline-none ${
                        o.status === CANCELLED_STATUS
                          ? "bg-red-500/20 text-red-300"
                          : o.status === "delivered"
                            ? "bg-green-500/20 text-green-400"
                            : "bg-accent/20 text-accent"
                      }`}
                    >
                      {ORDER_STEPS.map((step) => (
                        <option
                          key={step.key}
                          value={step.key}
                          className="bg-black text-white"
                        >
                          {step.label}
                        </option>
                      ))}
                      <option
                        value={CANCELLED_STATUS}
                        className="bg-black text-white"
                      >
                        Cancelled
                      </option>
                    </select>
                  </td>
                  <td className="p-6">
                    <label className="flex items-center gap-2 text-sm text-gray-400">
                      <CalendarDays size={15} className="text-accent" />
                      <input
                        type="date"
                        value={o.estimatedDeliveryDate || ""}
                        onChange={(e) =>
                          handleDeliveryDateChange(o.id, e.target.value)
                        }
                        className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-accent"
                        aria-label={`Delivery date for order ${o.id}`}
                      />
                    </label>
                  </td>
                  <td className="p-6 text-sm text-gray-400">{o.date}</td>
                  <td className="p-6 text-sm text-gray-400">
                    {o.items?.length || 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="glass-card w-full max-w-3xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between gap-4 border-b border-white/10 p-4 sm:p-6">
              <h2 className="text-base font-bold uppercase tracking-widest sm:text-xl">
                {editingProduct ? "Update Modest Outfit" : "Add Modest Outfit"}
              </h2>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  resetProductForm();
                }}
                className="text-gray-400 hover:text-white"
              >
                <X size={24} />
              </button>
            </div>
            <form
              onSubmit={handleSaveProduct}
              className="grid grid-cols-1 gap-5 p-4 sm:grid-cols-2 sm:gap-6 sm:p-8"
            >
              <div className="sm:col-span-2">
                <label className="text-[10px] font-bold uppercase text-gray-400 block mb-2">
                  Product Name
                </label>
                <input
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full glass rounded-xl p-3 text-sm focus:outline-none border-white/10"
                  placeholder="e.g. Midnight Elegance Abaya"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-[10px] font-bold uppercase text-gray-400 block mb-2">
                  Description
                </label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full glass rounded-xl p-3 text-sm focus:outline-none border-white/10 min-h-24"
                  placeholder="Describe fabric, fit, occasion, and coverage"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-gray-400 block mb-2">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="dark-select"
                >
                  <option value="abaya">Abaya</option>
                  <option value="dress">Long Dress</option>
                  <option value="ethnic">Kurti / Ethnic</option>
                  <option value="saree">Saree</option>
                  <option value="jacket">Jacket</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-gray-400 block mb-2">
                  Occasion
                </label>
                <select
                  value={formData.occasion}
                  onChange={(e) =>
                    setFormData({ ...formData, occasion: e.target.value })
                  }
                  className="dark-select"
                >
                  <option value="casual">Casual</option>
                  <option value="party">Party</option>
                  <option value="wedding">Wedding</option>
                  <option value="office">Office</option>
                  <option value="sports">Sports</option>
                  <option value="ethnic">Ethnic</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-gray-400 block mb-2">
                  Color
                </label>
                <select
                  value={formData.color}
                  onChange={(e) =>
                    setFormData({ ...formData, color: e.target.value })
                  }
                  className="dark-select capitalize"
                >
                  {[
                    "black",
                    "white",
                    "blue",
                    "green",
                    "pink",
                    "red",
                    "purple",
                    "gold",
                    "silver",
                  ].map((color) => (
                    <option key={color} value={color}>
                      {color}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="glass rounded-xl p-4 flex items-center justify-between gap-4 cursor-pointer hover:bg-white/10 transition-colors">
                  <span>
                    <span className="block text-sm font-bold">
                      Show this product in Featured Picks
                    </span>
                    <span className="block text-xs text-gray-500 mt-1">
                      Featured products appear on the home page first.
                    </span>
                  </span>
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) =>
                      setFormData({ ...formData, isFeatured: e.target.checked })
                    }
                    className="w-5 h-5 accent-accent"
                  />
                </label>
              </div>
              <div className="sm:col-span-2">
                <label className="text-[10px] font-bold uppercase text-gray-400 block mb-2">
                  Product Image From PC
                </label>
                <label className="glass rounded-xl p-5 border border-dashed border-white/20 flex items-center justify-center gap-3 cursor-pointer hover:border-accent/60 transition-colors">
                  <ImagePlus size={22} className="text-accent" />
                  <span className="text-sm font-bold">
                    {imageFile
                      ? imageFile.name
                      : editingProduct?.image
                        ? "Keep current image or choose a new file"
                        : "Choose image file"}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                </label>
              </div>
              <div className="sm:col-span-2">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-[10px] font-bold uppercase text-gray-400">
                    Size-wise Prices In Rupees
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setSizePrices([
                        ...sizePrices,
                        { size: "", price: "", originalPrice: "", stock: 0 },
                      ])
                    }
                    className="text-xs font-bold text-accent hover:text-white"
                  >
                    + Add Size
                  </button>
                </div>
                <div className="space-y-3">
                  {sizePrices.map((row, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-1 gap-3 sm:grid-cols-4"
                    >
                      <input
                        value={row.size}
                        onChange={(e) =>
                          setSizePrices(
                            sizePrices.map((item, i) =>
                              i === index
                                ? { ...item, size: e.target.value }
                                : item,
                            ),
                          )
                        }
                        className="glass rounded-xl p-3 text-sm focus:outline-none border-white/10 uppercase"
                        placeholder="Size"
                      />
                      <input
                        type="number"
                        value={row.price}
                        onChange={(e) =>
                          setSizePrices(
                            sizePrices.map((item, i) =>
                              i === index
                                ? { ...item, price: e.target.value }
                                : item,
                            ),
                          )
                        }
                        className="glass rounded-xl p-3 text-sm focus:outline-none border-white/10"
                        placeholder="Price ₹"
                      />
                      <input
                        type="number"
                        value={row.originalPrice}
                        onChange={(e) =>
                          setSizePrices(
                            sizePrices.map((item, i) =>
                              i === index
                                ? { ...item, originalPrice: e.target.value }
                                : item,
                            ),
                          )
                        }
                        className="glass rounded-xl p-3 text-sm focus:outline-none border-white/10"
                        placeholder="MRP ₹"
                      />
                      <input
                        type="number"
                        value={row.stock}
                        onChange={(e) =>
                          setSizePrices(
                            sizePrices.map((item, i) =>
                              i === index
                                ? { ...item, stock: e.target.value }
                                : item,
                            ),
                          )
                        }
                        className="glass rounded-xl p-3 text-sm focus:outline-none border-white/10"
                        placeholder="Stock"
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div className="pt-4 sm:col-span-2">
                <button
                  type="submit"
                  className="w-full bg-gradient-btn py-4 rounded-xl font-bold uppercase tracking-widest"
                >
                  {editingProduct ? "Update Product" : "Save Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
