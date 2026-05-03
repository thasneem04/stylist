import { Heart, LogIn, ShoppingBag, Star, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useShop } from "../context/ShopContext";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { assetUrl } from "../utils/api";

const PLACEHOLDER_IMAGE = "https://via.placeholder.com/420x560?text=No+Image";

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { wishlist, toggleWishlist, addToCart, startBuyNow } = useShop();
  const { user } = useAuth();
  const isWishlisted = wishlist.some((item) => item._id === product._id);
  const getImageUrl = (image) => {
    if (!image || typeof image !== "string" || image.trim() === "")
      return PLACEHOLDER_IMAGE;
    return assetUrl(image);
  };
  const sizePrice = product.sizePrices?.length ? product.sizePrices[0] : null;
  const displayPrice = sizePrice?.price ?? product.price;
  const displayOriginalPrice = sizePrice?.originalPrice ?? product.price;
  const createdAtTime = product.createdAt
    ? new Date(product.createdAt).getTime()
    : 0;
  const isNewProduct =
    product.isNewArrival ||
    (createdAtTime && Date.now() - createdAtTime < 1000 * 60 * 60 * 24 * 14);

  const handleWishlist = (e) => {
    e.preventDefault();
    toggleWishlist(product);
    if (!isWishlisted) {
      toast("Added to wishlist", { icon: "❤️" });
    }
  };

  const productForCheckout = {
    ...product,
    price: displayPrice,
    selectedSize:
      sizePrice?.size || product.size?.[0] || product.sizes?.[0] || "Free Size",
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    if (!user) {
      navigate("/login", { state: { from: location } });
      return;
    }
    addToCart(productForCheckout);
    toast.success("Added to Cart!");
  };

  const handleBuyNow = (e) => {
    e.preventDefault();
    if (!user) {
      navigate("/login", { state: { from: location } });
      return;
    }
    startBuyNow(productForCheckout);
    navigate("/checkout");
  };

  const handleLoginToBuy = (e) => {
    e.preventDefault();
    navigate("/login", { state: { from: location } });
  };

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="glass-card overflow-hidden group relative"
    >
      <Link to={`/product/${product._id}`} className="block">
        <div className="relative aspect-[3/4] overflow-hidden">
          <img
            src={getImageUrl(product.image)}
            alt={product.name}
            onError={(e) => {
              e.currentTarget.src = PLACEHOLDER_IMAGE;
            }}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          <button
            onClick={handleWishlist}
            className="absolute top-4 right-4 p-2 rounded-full glass hover:bg-accent/20 transition-colors z-10"
          >
            <Heart
              size={18}
              className={
                isWishlisted ? "fill-accent text-accent" : "text-white"
              }
            />
          </button>

          <div className="absolute top-4 left-4 flex flex-col items-start gap-2">
            {product.isFeatured && (
              <span className="bg-accent text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">
                Featured
              </span>
            )}
            {isNewProduct && (
              <span className="bg-white text-black text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">
                New
              </span>
            )}
            {product.discount > 0 && (
              <span className="bg-accent-purple text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">
                -{product.discount}%
              </span>
            )}
          </div>
        </div>

        <div className="p-4 sm:p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-gray-400 uppercase tracking-widest">
              {product.category}
            </span>
            <div className="flex items-center gap-1 text-yellow-400">
              <Star size={12} fill="currentColor" />
              <span className="text-xs font-bold text-white">
                {product.rating}
              </span>
            </div>
          </div>

          <h3 className="font-bold text-white truncate mb-2">{product.name}</h3>

          <div className="flex items-end gap-2">
            <span className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-accent to-accent-purple">
              ₹{Number(displayPrice).toFixed(2)}
            </span>
            {displayOriginalPrice > displayPrice && (
              <span className="text-sm text-gray-500 line-through mb-0.5">
                ₹{Number(displayOriginalPrice).toFixed(2)}
              </span>
            )}
          </div>

          {user ? (
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                onClick={handleAddToCart}
                className="flex h-10 items-center justify-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2 text-[10px] font-bold uppercase tracking-wider text-white transition-colors hover:border-accent/60 hover:bg-white/10 sm:text-[11px]"
              >
                <ShoppingBag size={14} /> Add to Cart
              </button>
              <button
                onClick={handleBuyNow}
                className="bg-gradient-btn flex h-10 items-center justify-center gap-1 rounded-lg px-2 text-[10px] font-bold uppercase tracking-wider sm:text-[11px]"
              >
                <Zap size={14} /> Buy Now
              </button>
            </div>
          ) : (
            <button
              onClick={handleLoginToBuy}
              className="mt-4 w-full h-10 rounded-lg bg-gradient-btn text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-1"
            >
              <LogIn size={14} /> Login to Buy
            </button>
          )}
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;
