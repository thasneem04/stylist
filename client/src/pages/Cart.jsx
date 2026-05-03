import { Trash2, ArrowRight, ShoppingBag } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useShop } from "../context/ShopContext";
import { assetUrl } from "../utils/api";

const PLACEHOLDER_IMAGE = "https://via.placeholder.com/420x560?text=No+Image";
const getImageUrl = (image) => {
  if (!image || typeof image !== "string" || image.trim() === "")
    return PLACEHOLDER_IMAGE;
  return assetUrl(image);
};

const Cart = () => {
  const navigate = useNavigate();
  const { cart, removeFromCart, clearBuyNow } = useShop();
  const getImageUrl = (image) => assetUrl(image);

  const subtotal = cart.reduce(
    (acc, item) =>
      acc + item.price * (1 - (item.discount || 0) / 100) * item.quantity,
    0,
  );
  const shipping = subtotal > 100 ? 0 : 15;
  const total = subtotal + shipping;

  const handleCheckout = () => {
    clearBuyNow();
    navigate("/checkout");
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 flex flex-col items-center justify-center text-center">
        <div className="w-24 h-24 rounded-full glass flex items-center justify-center mb-6">
          <ShoppingBag size={40} className="text-gray-400" />
        </div>
        <h2 className="text-3xl font-black uppercase tracking-tight mb-4">
          Your cart is empty
        </h2>
        <p className="text-gray-400 mb-8 max-w-md">
          Looks like you haven't added any items to your cart yet. Discover your
          next favorite outfit.
        </p>
        <Link
          to="/products"
          className="bg-gradient-btn px-8 py-4 rounded-xl font-bold uppercase tracking-wider flex items-center justify-center gap-2 text-sm"
        >
          Start Shopping <ArrowRight size={18} />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 sm:py-12">
      <h1 className="mb-6 text-2xl font-black uppercase tracking-tight sm:mb-8 sm:text-3xl">
        Shopping <span className="text-gradient">Cart</span>
      </h1>

      <div className="flex flex-col gap-8 lg:flex-row lg:gap-12">
        {/* Cart Items */}
        <div className="w-full lg:w-2/3 space-y-6">
          {cart.map((item) => (
            <div
              key={item._id}
              className="glass-card relative flex flex-col items-center gap-4 p-4 sm:flex-row sm:gap-6 sm:p-6"
            >
              <img
                src={getImageUrl(item.image)}
                alt={item.name}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = PLACEHOLDER_IMAGE;
                }}
                className="h-36 w-28 rounded-lg object-cover sm:h-32 sm:w-24"
              />
              <div className="flex-1 text-center sm:text-left">
                <div className="text-[10px] uppercase tracking-widest text-accent border border-accent/30 px-2 py-1 rounded inline-block mb-2">
                  {item.category}
                </div>
                <h3 className="text-lg font-bold mb-1">{item.name}</h3>
                <p className="text-sm text-gray-400 mb-2">
                  Size: {item.selectedSize} | Color:{" "}
                  <span className="capitalize">{item.color}</span>
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3 sm:justify-start sm:gap-4">
                  <span className="font-bold text-lg text-white">
                    ₹
                    {(
                      item.price *
                      (1 - (item.discount || 0) / 100) *
                      item.quantity
                    ).toFixed(2)}
                  </span>
                  <span className="text-xs text-gray-500 bg-white/5 px-2 py-1 rounded">
                    Qty: {item.quantity}
                  </span>
                </div>
              </div>
              <button
                onClick={() => removeFromCart(item._id)}
                className="absolute sm:relative top-4 right-4 sm:top-0 sm:right-0 p-2 text-gray-500 hover:text-red-500 transition-colors"
              >
                <Trash2 size={20} />
              </button>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="w-full lg:w-1/3">
          <div className="glass-card sticky top-32 p-5 sm:p-6 lg:top-24">
            <h2 className="text-xl font-bold uppercase tracking-wider mb-6 pb-4 border-b border-white/10">
              Order Summary
            </h2>

            <div className="space-y-4 mb-6 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Subtotal</span>
                <span className="font-medium">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Estimated Shipping</span>
                <span className="font-medium">
                  {shipping === 0 ? "Free" : `₹${shipping.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Tax</span>
                <span className="font-medium">Calculated at checkout</span>
              </div>
            </div>

            <div className="flex justify-between items-center mb-8 pt-4 border-t border-white/10">
              <span className="font-bold uppercase tracking-wider">Total</span>
              <span className="text-2xl font-black text-gradient">
                ₹{total.toFixed(2)}
              </span>
            </div>

            <button
              onClick={handleCheckout}
              className="w-full bg-gradient-btn py-4 rounded-xl font-bold uppercase tracking-wider flex items-center justify-center gap-2"
            >
              Checkout <ArrowRight size={20} />
            </button>

            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500">
              <span>Secure checkout powered by</span>
              <span className="font-bold text-white">Aura Pay</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
