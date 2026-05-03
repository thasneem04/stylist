import { useState, useEffect } from "react";
import { useParams, Link, useLocation, useNavigate } from "react-router-dom";
import { ShoppingBag, Heart, Star, ArrowLeft, Zap, LogIn } from "lucide-react";
import { useShop } from "../context/ShopContext";
import { useAuth } from "../context/AuthContext";
import ProductCard from "../components/ProductCard";
import toast from "react-hot-toast";
import { apiUrl, assetUrl } from "../utils/api";

const getImageUrl = (image) => assetUrl(image);

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { addToCart, toggleWishlist, wishlist, startBuyNow } = useShop();
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [selectedSize, setSelectedSize] = useState("");

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const res = await fetch(apiUrl(`/products/${id}`));
        if (!res.ok) throw new Error("Product not found");
        const data = await res.json();
        if (data.image?.includes("unsplash"))
          throw new Error("Product removed");
        setProduct({ ...data, id: data._id });
        setSelectedSize(
          data.sizePrices?.[0]?.size || data.sizes?.[0] || "Free Size",
        );

        const relatedRes = await fetch(apiUrl("/products"));
        const allProducts = relatedRes.ok ? await relatedRes.json() : [];
        if (Array.isArray(allProducts)) {
          const dataCategory = String(data.category || "").toLowerCase();
          const dataOccasion = String(data.occasion || "").toLowerCase();
          const dataName = String(data.name || "").toLowerCase();

          const matchingProducts = allProducts.filter((item) => {
            if (item._id === data._id) return false;
            const itemCategory = String(item.category || "").toLowerCase();
            const itemOccasion = String(item.occasion || "").toLowerCase();
            const itemName = String(item.name || "").toLowerCase();
            const itemDescription = String(
              item.description || "",
            ).toLowerCase();

            const categoryMatch =
              itemCategory && dataCategory && itemCategory === dataCategory;
            const occasionMatch =
              itemOccasion && dataOccasion && itemOccasion === dataOccasion;
            const keywordMatch =
              dataCategory &&
              (itemName.includes(dataCategory) ||
                itemDescription.includes(dataCategory));
            const nameKeywordMatch =
              dataName &&
              dataName
                .split(" ")
                .some(
                  (word) =>
                    word.length > 3 &&
                    (itemName.includes(word) || itemDescription.includes(word)),
                );

            return (
              categoryMatch || occasionMatch || keywordMatch || nameKeywordMatch
            );
          });

          const fallbackProducts = allProducts.filter(
            (item) => item._id !== data._id,
          );
          setRelatedProducts(
            (matchingProducts.length
              ? matchingProducts
              : fallbackProducts
            ).slice(0, 8),
          );
        }
      } catch {
        setProduct(false);
        setRelatedProducts([]);
      }
    };

    loadProduct();
  }, [id]);

  if (product === null)
    return <div className="p-20 text-center">Loading...</div>;
  if (product === false)
    return (
      <div className="p-20 text-center">
        Product not found. Explore the collection for more styles.
      </div>
    );

  const isWishlisted = wishlist.some((item) => item.id === product.id);
  const productSizes = product.sizePrices?.length
    ? product.sizePrices.map((item) => item.size)
    : product.size || product.sizes || [];
  const selectedSizePrice = product.sizePrices?.find(
    (item) => item.size === selectedSize,
  );
  const currentPrice = selectedSizePrice?.price ?? product.price;
  const currentOriginalPrice =
    selectedSizePrice?.originalPrice ?? product.price;
  const productColor = product.color || product.colors?.[0] || "black";
  const pricedProduct = { ...product, price: currentPrice, selectedSize };

  const handleAddToCart = () => {
    if (!user) {
      navigate("/login", { state: { from: location } });
      return;
    }
    addToCart(pricedProduct);
    toast.success("Added to Cart!", { icon: "🛍️" });
  };

  const handleBuyNow = () => {
    if (!user) {
      navigate("/login", { state: { from: location } });
      return;
    }
    startBuyNow(pricedProduct);
    navigate("/checkout");
  };

  const handleLoginToBuy = () => {
    navigate("/login", { state: { from: location } });
  };

  const handleWishlist = () => {
    toggleWishlist(product);
    toast(isWishlisted ? "Removed from Wishlist" : "Added to Wishlist", {
      icon: "❤️",
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 sm:py-12">
      <Link
        to="/products"
        className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white mb-8 transition-colors"
      >
        <ArrowLeft size={16} /> Back to Products
      </Link>

      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(280px,420px)_1fr] lg:gap-14">
        {/* Image */}
        <div className="w-full max-w-[420px] mx-auto lg:mx-0">
          <div className="glass-card overflow-hidden aspect-[4/5] relative bg-black/30">
            <img
              src={getImageUrl(product.image)}
              alt={product.name}
              className="w-full h-full object-contain"
            />
            {product.discount > 0 && (
              <div className="absolute top-6 left-6 bg-accent text-white text-xs font-bold px-3 py-1 rounded uppercase tracking-wider">
                -{product.discount}% OFF
              </div>
            )}
          </div>
        </div>

        {/* Details */}
        <div className="w-full flex flex-col pt-4">
          <div className="mb-2">
            <span className="text-[10px] uppercase tracking-widest text-accent border border-accent/30 px-2 py-1 rounded">
              {product.category}
            </span>
          </div>

          <h1 className="mb-4 text-3xl font-black tracking-tight md:text-5xl">
            {product.name}
          </h1>

          <div className="flex items-center gap-4 mb-8">
            <div className="flex items-center gap-1 text-yellow-400">
              <Star size={18} fill="currentColor" />
              <span className="font-bold text-white ml-1">
                {product.rating}
              </span>
            </div>
            <span className="text-gray-500 text-sm">124 Reviews</span>
          </div>

          <div className="flex items-end gap-3 mb-8">
            <span className="text-3xl font-black text-gradient sm:text-4xl">
              ₹{Number(currentPrice).toFixed(2)}
            </span>
            {currentOriginalPrice > currentPrice && (
              <span className="text-xl text-gray-500 line-through mb-1">
                ₹{Number(currentOriginalPrice).toFixed(2)}
              </span>
            )}
          </div>

          <p className="text-gray-300 leading-relaxed mb-10 max-w-lg">
            Experience premium quality with this stunning{" "}
            {product.name.toLowerCase()}. Designed specifically for{" "}
            {product.occasion} occasions, featuring advanced fabric technology.
          </p>

          {/* Color Selection */}
          <div className="mb-8">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-3">
              Color
            </h3>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full border-2 border-accent p-1">
                <div
                  className="w-full h-full rounded-full"
                  style={{ backgroundColor: productColor }}
                />
              </div>
              <span className="text-sm capitalize font-medium">
                {productColor}
              </span>
            </div>
          </div>

          {/* Size Selection */}
          <div className="mb-10">
            <div className="flex justify-between items-center mb-3 max-w-md">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400">
                Size
              </h3>
              <button className="text-xs text-accent underline">
                Size Guide
              </button>
            </div>
            <div className="flex flex-wrap gap-3">
              {productSizes.map((s) => (
                <button
                  key={s}
                  onClick={() => setSelectedSize(s)}
                  className={`w-14 h-14 rounded-lg glass flex items-center justify-center font-bold transition-all ${selectedSize === s ? "bg-accent border-accent text-white shadow-[0_0_15px_rgba(255,0,127,0.4)]" : "hover:border-white/50 text-gray-300"}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex max-w-xl flex-col gap-3 sm:flex-row sm:gap-4">
            {user ? (
              <>
                <button
                  onClick={handleAddToCart}
                  className="flex-1 glass py-4 rounded-xl font-bold uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-white/10 transition-colors"
                >
                  <ShoppingBag size={20} /> Add to Cart
                </button>
                <button
                  onClick={handleBuyNow}
                  className="flex-1 bg-gradient-btn py-4 rounded-xl font-bold uppercase tracking-wider flex items-center justify-center gap-2"
                >
                  <Zap size={20} /> Buy Now
                </button>
              </>
            ) : (
              <button
                onClick={handleLoginToBuy}
                className="flex-1 bg-gradient-btn py-4 rounded-xl font-bold uppercase tracking-wider flex items-center justify-center gap-2"
              >
                <LogIn size={20} /> Login to Buy
              </button>
            )}
            <button
              onClick={handleWishlist}
              className={`sm:w-14 h-14 rounded-xl glass flex items-center justify-center transition-colors ${isWishlisted ? "bg-accent/20 border-accent/50" : "hover:bg-white/10"}`}
            >
              <Heart
                size={24}
                className={
                  isWishlisted ? "fill-accent text-accent" : "text-white"
                }
              />
            </button>
          </div>
        </div>
      </div>

      {relatedProducts.length > 0 && (
        <section className="mt-20">
          <div className="flex items-end justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight">
                Related <span className="text-gradient">Products</span>
              </h2>
              <p className="text-gray-400 mt-2">
                More styles from the same collection and occasion.
              </p>
            </div>
            <Link
              to="/products"
              className="hidden sm:inline-flex text-sm font-bold uppercase tracking-wider text-accent hover:text-white"
            >
              View All
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 md:gap-6">
            {relatedProducts.map((item) => (
              <ProductCard key={item._id || item.id} product={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ProductDetails;
