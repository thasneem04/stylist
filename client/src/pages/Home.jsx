import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Smile, Clock, ShoppingBag } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import FeaturedProductsSection from "../components/FeaturedProductsSection";
import heroFallback from "../assets/hero.png";
import { apiUrl, assetUrl } from "../utils/api";

const fallbackOccasionImages = {
  wedding: "https://source.unsplash.com/900x900/?modest,wedding,hijab,fashion",
  party: "https://source.unsplash.com/900x900/?modest,evening,abaya,fashion",
  casual: "https://source.unsplash.com/900x900/?modest,casual,hijab,outfit",
  office:
    "https://source.unsplash.com/900x900/?modest,office,professional,outfit",
  sports: "https://source.unsplash.com/900x900/?modest,sportswear,activewear",
  ethnic: "https://source.unsplash.com/900x900/?modest,ethnic,kurti,fashion",
};

const Home = () => {
  const navigate = useNavigate();
  const [heroProduct, setHeroProduct] = useState(null);
  const [occasionImages, setOccasionImages] = useState({});

  const occasions = [
    { name: "Wedding" },
    { name: "Party" },
    { name: "Casual" },
    { name: "Office" },
    { name: "Sports" },
    { name: "Ethnic" },
  ];

  const handleOccasionClick = (occasion) => {
    navigate(`/products?occasion=${occasion.toLowerCase()}`);
  };

  useEffect(() => {
    const loadHeroProduct = async () => {
      try {
        const featuredRes = await fetch(apiUrl("/products/featured"));
        const featured = featuredRes.ok ? await featuredRes.json() : [];

        if (Array.isArray(featured) && featured.length > 0) {
          setHeroProduct(featured[0]);
          return;
        }

        const newRes = await fetch(apiUrl("/products/new"));
        const newProducts = newRes.ok ? await newRes.json() : [];
        setHeroProduct(
          Array.isArray(newProducts) && newProducts.length > 0
            ? newProducts[0]
            : null,
        );
      } catch {
        setHeroProduct(null);
      }
    };

    loadHeroProduct();
  }, []);

  const PLACEHOLDER_IMAGE = "https://via.placeholder.com/420x560?text=No+Image";
  const getImageUrl = (image) => {
    if (!image || typeof image !== "string" || image.trim() === "")
      return PLACEHOLDER_IMAGE;
    return assetUrl(image);
  };
  const heroImage = heroProduct?.image
    ? getImageUrl(heroProduct.image)
    : heroFallback;
  const heroProductPath = heroProduct?._id
    ? `/product/${heroProduct._id}`
    : "/products";

  useEffect(() => {
    const loadOccasionImages = async () => {
      try {
        const res = await fetch(apiUrl("/products"));
        const products = res.ok ? await res.json() : [];
        const imagesByOccasion = {};

        if (Array.isArray(products)) {
          products.forEach((product) => {
            const key = product.occasion?.toLowerCase();
            if (key && product.image && !imagesByOccasion[key]) {
              imagesByOccasion[key] = getImageUrl(product.image);
            }
          });
        }

        setOccasionImages(imagesByOccasion);
      } catch {
        setOccasionImages({});
      }
    };

    loadOccasionImages();
  }, []);

  const getOccasionImage = (occasion) => {
    const key = occasion.toLowerCase();
    return occasionImages[key] || fallbackOccasionImages[key];
  };

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative h-[85vh] flex items-center overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-primary z-0">
          <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_20%_20%,rgba(255,0,127,0.25),transparent_35%),radial-gradient(circle_at_80%_30%,rgba(138,43,226,0.28),transparent_38%)]" />
          <div className="absolute top-1/4 -left-1/4 w-1/2 h-1/2 bg-accent/30 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 -right-1/4 w-1/2 h-1/2 bg-accent-purple/30 rounded-full blur-[120px]" />
        </div>

        <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col items-center gap-10 px-4 text-center sm:px-6 lg:flex-row lg:gap-12 lg:text-left">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex-1"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-accent text-sm font-bold mb-6 border border-accent/30 shadow-[0_0_15px_rgba(255,0,127,0.3)]">
              <Sparkles size={16} />
              AI-Powered Styling
            </div>
            <h1 className="mb-6 text-4xl font-black leading-tight tracking-tight text-white sm:text-5xl md:text-7xl">
              Discover Your
              <br />
              <span className="text-gradient">True Aura</span>
            </h1>
            <p className="mx-auto mb-8 max-w-xl text-base text-gray-300 sm:text-lg lg:mx-0 lg:mb-10">
              Personalized fashion recommendations curated by advanced AI.
              Experience fashion that truly understands your unique style.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Link
                to="/products"
                className="w-full sm:w-auto bg-gradient-btn px-8 py-4 rounded-xl font-bold uppercase tracking-wider flex items-center justify-center gap-2 text-sm"
              >
                Shop Collection <ArrowRight size={18} />
              </Link>
              <button
                onClick={() =>
                  document.getElementById("chatbot-toggle")?.click()
                }
                className="w-full sm:w-auto glass px-8 py-4 rounded-xl font-bold uppercase tracking-wider hover:bg-white/10 transition-colors text-sm"
              >
                Chat with Aria
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            className="flex-1 hidden lg:flex justify-center"
          >
            <Link
              to={heroProductPath}
              className="block w-full max-w-[420px] aspect-[4/5] rounded-[1.5rem] border border-white/10 shadow-[0_0_40px_rgba(138,43,226,0.28)] overflow-hidden relative bg-black/30 group"
            >
              <img
                src={heroImage}
                alt={heroProduct?.name || "Featured fashion style"}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = heroFallback;
                }}
                className="w-full h-full object-contain bg-black/20"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
              <div className="absolute left-6 right-6 bottom-6">
                <span className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-black/50 border border-white/10 text-[10px] font-bold uppercase tracking-widest text-accent mb-4">
                  <Sparkles size={14} /> Style Pick
                </span>
                <h2 className="text-2xl font-black uppercase tracking-tight line-clamp-2">
                  {heroProduct?.name || "Curated Modest Fashion"}
                </h2>
                <p className="text-sm text-gray-300 mt-3 line-clamp-2">
                  {heroProduct?.description ||
                    "Discover polished styles for everyday confidence."}
                </p>
                <div className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gradient-btn px-5 py-3 text-xs font-bold uppercase tracking-wider">
                  View Product <ArrowRight size={16} />
                </div>
              </div>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y border-white/10 bg-white/5 backdrop-blur-sm relative z-20">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-white/10">
            <div className="flex flex-col items-center justify-center p-4">
              <ShoppingBag size={32} className="text-accent mb-4" />
              <h3 className="text-4xl font-black text-white mb-2">500+</h3>
              <p className="text-gray-400 uppercase tracking-widest text-xs font-bold">
                Premium Products
              </p>
            </div>
            <div className="flex flex-col items-center justify-center p-4">
              <Smile size={32} className="text-accent-purple mb-4" />
              <h3 className="text-4xl font-black text-white mb-2">98%</h3>
              <p className="text-gray-400 uppercase tracking-widest text-xs font-bold">
                Happy Customers
              </p>
            </div>
            <div className="flex flex-col items-center justify-center p-4">
              <Clock size={32} className="text-accent mb-4" />
              <h3 className="text-4xl font-black text-white mb-2">24/7</h3>
              <p className="text-gray-400 uppercase tracking-widest text-xs font-bold">
                AI Support
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Shop By Occasion */}
      <section className="relative z-10 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight mb-4">
              Shop by <span className="text-gradient">Occasion</span>
            </h2>
            <p className="text-gray-400">
              Find the perfect outfit for your next event
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 md:grid-cols-3 md:gap-6">
            {occasions.map((occ, idx) => (
              <motion.button
                key={occ.name}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleOccasionClick(occ.name)}
                className="group relative aspect-square overflow-hidden rounded-2xl glass-card cursor-pointer"
              >
                <img
                  src={getOccasionImage(occ.name)}
                  alt={`${occ.name} fashion`}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10" />
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                  <h3 className="text-xl md:text-2xl font-black uppercase tracking-wider text-white group-hover:text-accent transition-colors">
                    {occ.name}
                  </h3>
                  <span className="mt-3 text-[10px] font-bold uppercase tracking-[0.25em] text-gray-300">
                    Explore
                  </span>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      <FeaturedProductsSection />
    </div>
  );
};

export default Home;
