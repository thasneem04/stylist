import { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Sparkles } from "lucide-react";
import { products as fallbackProducts } from "../data/products";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getCustomerOrders, getStatusLabel } from "../utils/orders";
import { apiUrl, assetUrl } from "../utils/api";

const getProductPrice = (product) =>
  product.sizePrices?.[0]?.price ?? product.price ?? 0;

const getSalePrice = (product) =>
  Number(
    (getProductPrice(product) * (1 - (product.discount || 0) / 100)).toFixed(2),
  );

const formatProduct = (product) =>
  `${product.name} - ₹${getSalePrice(product).toFixed(2)}`;

const PLACEHOLDER_IMAGE = "https://via.placeholder.com/420x560?text=No+Image";

const normalizeProduct = (product) => ({
  ...product,
  id: product._id || product.id,
  price: getSalePrice(product),
  image: assetUrl(product.image),
});

const getChatbotImageUrl = (image) => {
  if (!image || typeof image !== "string" || image.trim() === "") {
    return PLACEHOLDER_IMAGE;
  }
  return assetUrl(image);
};

const getSuggestionGroups = (suggestions) => {
  const product = [];
  const style = [];
  const action = [];
  const other = [];

  suggestions.forEach((suggestion) => {
    const lower = suggestion.toLowerCase();
    if (/^(show|recommend|find)/.test(suggestion)) {
      if (
        /(outfits|wedding|party|casual|office|modest|ethnic)/i.test(suggestion)
      ) {
        style.push(suggestion);
      } else {
        product.push(suggestion);
      }
    } else if (
      /(track|view|how|continue|checkout|wishlist|order)/.test(lower)
    ) {
      action.push(suggestion);
    } else {
      other.push(suggestion);
    }
  });

  const groups = [];
  if (product.length) groups.push({ title: "Shop", suggestions: product });
  if (style.length) groups.push({ title: "Style", suggestions: style });
  if (action.length) groups.push({ title: "Actions", suggestions: action });
  if (other.length) groups.push({ title: "More", suggestions: other });
  return groups;
};

const initialSuggestions = [
  "Show latest abayas",
  "Recommend wedding outfits",
  "Show modest party dresses",
  "Find kurtis under ₹2000",
  "Track my order",
  "What are your top sellers?",
];

const initialMessages = [
  {
    type: "bot",
    text: "Hi! I am Aria, your AI Fashion Stylist. What are you looking for today?",
    suggestions: initialSuggestions,
    suggestionGroups: getSuggestionGroups(initialSuggestions),
  },
];

const getBudget = (query) => {
  const match =
    query.match(/(?:under|below|less than|within|budget)\s*\$?(\d+)/i) ||
    query.match(/\$?(\d+)/);
  return match ? Number(match[1]) : null;
};

const getCatalogSuggestions = (catalog) => {
  const categoryLabels = {
    abaya: "abayas",
    dress: "long dresses",
    ethnic: "kurtis",
    saree: "sarees",
    jacket: "jackets",
    sports: "sportswear",
    shirt: "shirts",
    jeans: "bottom wear",
    accessories: "accessories",
  };

  const categories = [
    ...new Set(catalog.map((product) => product.category).filter(Boolean)),
  ];
  const occasions = [
    ...new Set(catalog.map((product) => product.occasion).filter(Boolean)),
  ];
  const colors = [
    ...new Set(
      catalog.flatMap((product) => {
        const list = [];
        if (product.color) list.push(product.color);
        if (Array.isArray(product.colors)) list.push(...product.colors);
        return list.filter(Boolean);
      }),
    ),
  ];
  const hasDiscount = catalog.some((product) => Number(product.discount) > 0);
  const suggestions = [];

  categories.slice(0, 3).forEach((category) => {
    suggestions.push(`Show ${categoryLabels[category] || category}`);
  });

  occasions.slice(0, 2).forEach((occasion) => {
    suggestions.push(`Recommend ${occasion} outfits`);
  });

  if (colors.length > 0) {
    suggestions.push(`Show ${colors[0]} outfits`);
  }

  if (hasDiscount) {
    suggestions.push("Show discounted styles");
  }

  suggestions.push("Find budget-friendly looks");
  suggestions.push("Track my order");
  suggestions.push("View my wishlist");

  return [...new Set(suggestions)].slice(0, 5);
};

const getCategorySummary = (catalog) => {
  const categories = [
    ...new Set(catalog.map((product) => product.category).filter(Boolean)),
  ];
  if (categories.length === 0)
    return "Aura product data is loading. Please try again in a moment.";
  return `Aura currently has ${categories.join(", ")} products.`;
};

const getMatchingProducts = (query, catalog) => {
  const normalized = query.toLowerCase();
  const budget = getBudget(normalized);
  const categoryKeywords = {
    abaya: ["abaya"],
    dress: ["dress", "gown", "maxi", "kaftan"],
    ethnic: ["kurti", "ethnic", "anarkali", "sharara"],
    saree: ["saree"],
    accessories: ["hijab", "accessory", "accessories"],
    jacket: ["jacket", "coat", "cardigan", "trench"],
    sports: ["sports", "swimwear", "trackpants"],
    shirt: ["shirt", "tunic", "top", "turtleneck"],
    jeans: ["jeans", "trousers", "skirt", "palazzo"],
  };
  const occasion = ["wedding", "party", "casual", "office", "sports"].find(
    (item) => normalized.includes(item),
  );
  const color = [
    "black",
    "white",
    "blue",
    "green",
    "pink",
    "red",
    "purple",
    "gold",
    "silver",
  ].find((item) => normalized.includes(item));
  const category = Object.entries(categoryKeywords).find(([, words]) =>
    words.some((word) => normalized.includes(word)),
  )?.[0];

  return catalog
    .filter((product) => !category || product.category === category)
    .filter((product) => !occasion || product.occasion === occasion)
    .filter(
      (product) =>
        !color || product.color === color || product.colors?.includes(color),
    )
    .filter((product) => !budget || getSalePrice(product) <= budget)
    .sort((a, b) => b.rating - a.rating || getSalePrice(a) - getSalePrice(b))
    .slice(0, 4);
};

const buildSiteOnlyReply = (query, user, catalog) => {
  const normalized = query.toLowerCase();
  const siteProducts =
    catalog.length > 0 ? catalog : fallbackProducts.map(normalizeProduct);

  if (
    [
      "weather",
      "news",
      "movie",
      "song",
      "recipe",
      "coding",
      "homework",
      "meaning",
    ].some((word) => normalized.includes(word))
  ) {
    return {
      text: "I can help only with this Aura fashion website: products, prices, modest outfit suggestions, cart, checkout, wishlist, and your order progress.",
      products: [],
    };
  }

  if (
    normalized.includes("order") ||
    normalized.includes("track") ||
    normalized.includes("delivery") ||
    normalized.includes("status")
  ) {
    const orders = getCustomerOrders(user);
    if (!user) {
      return {
        text: "Please sign in first, then I can show your Aura order progress from My Orders.",
        products: [],
      };
    }
    if (orders.length === 0) {
      return {
        text: "I do not see any orders in your Aura account yet. After checkout, your order will appear in My Orders with progress tracking.",
        products: [],
      };
    }
    const latest = orders[0];
    return {
      text: `Your latest Aura order ${latest.id} is ${getStatusLabel(latest.status)}. You can open My Orders to see the full step-by-step progress.`,
      products:
        latest.items?.slice(0, 3).map((item) => ({
          _id: item.id,
          name: item.name,
          price: item.price,
          image: item.image,
        })) || [],
    };
  }

  if (
    (normalized.includes("what") &&
      (normalized.includes("have") || normalized.includes("sell"))) ||
    normalized.includes("categories")
  ) {
    return {
      text: getCategorySummary(siteProducts),
      products: siteProducts.slice(0, 4),
    };
  }

  if (
    normalized.includes("skin tone") ||
    normalized.includes("suit me") ||
    normalized.includes("style me")
  ) {
    const picks = siteProducts
      .filter((product) =>
        ["ethnic", "abaya", "dress", "saree"].includes(product.category),
      )
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 4);
    const displayPicks = picks.length > 0 ? picks : siteProducts.slice(0, 4);

    return {
      text: `I can suggest from the current Aura catalog. Try ${displayPicks.map(formatProduct).join(", ")}. Tell me your preferred color, occasion, and budget for narrower picks.`,
      products: displayPicks,
    };
  }

  const matches = getMatchingProducts(normalized, siteProducts);
  if (matches.length > 0) {
    return {
      text: `Here are Aura picks from this website: ${matches.map(formatProduct).join(", ")}.`,
      products: matches,
    };
  }

  const budget = getBudget(normalized);
  if (budget && normalized.includes("abaya")) {
    const closestAbayas = siteProducts
      .filter((product) => product.category === "abaya")
      .sort((a, b) => getSalePrice(a) - getSalePrice(b))
      .slice(0, 3);

    if (closestAbayas.length === 0) {
      return {
        text: `I do not see abayas in the current Aura catalog right now. Here are other available picks from the website: ${siteProducts.slice(0, 4).map(formatProduct).join(", ")}.`,
        products: siteProducts.slice(0, 4),
      };
    }

    return {
      text: `I do not see an abaya under ₹${budget} on Aura right now. The closest Aura abaya options are ${closestAbayas.map(formatProduct).join(", ")}.`,
      products: closestAbayas,
    };
  }

  return {
    text: `I can help with the current Aura website catalog. Try asking about ${[...new Set(siteProducts.map((product) => product.category).filter(Boolean))].slice(0, 4).join(", ") || "products"}, colors, occasions, budget, or order tracking.`,
    products: siteProducts.slice(0, 4),
  };
};

const getFollowUpSuggestions = (
  query,
  botText,
  suggestedProducts = [],
  catalog = [],
) => {
  const normalized = `${query} ${botText}`.toLowerCase();

  if (
    normalized.includes("order") ||
    normalized.includes("track") ||
    normalized.includes("delivery")
  ) {
    return [
      "Track my order",
      ...getCatalogSuggestions(catalog).filter(
        (item) => item !== "Track my order",
      ),
    ].slice(0, 4);
  }

  if (suggestedProducts.length > 0) {
    const firstProduct = suggestedProducts[0];
    const firstCategory = firstProduct?.category;
    const firstOccasion = firstProduct?.occasion;
    const firstColor = firstProduct?.color || firstProduct?.colors?.[0];
    const firstPrice = Number(firstProduct?.price || 0);
    const followUps = [];

    if (firstCategory) {
      const categoryLabel =
        firstCategory === "ethnic" ? "kurtis" : firstCategory;
      followUps.push(`Show more ${categoryLabel}`);
      followUps.push(`Find ${categoryLabel} for me`);
    }
    if (firstOccasion) followUps.push(`Show ${firstOccasion} outfits`);
    if (firstColor) followUps.push(`Show ${firstColor} outfits`);
    if (firstPrice > 0)
      followUps.push(`Show options under ₹${Math.round(firstPrice + 500)}`);

    return [...new Set(followUps.concat(getCatalogSuggestions(catalog)))].slice(
      0,
      4,
    );
  }

  if (
    normalized.includes("wedding") ||
    normalized.includes("party") ||
    normalized.includes("casual") ||
    normalized.includes("office")
  ) {
    return getCatalogSuggestions(catalog)
      .concat(["Track my order"])
      .slice(0, 4);
  }

  return getCatalogSuggestions(catalog);
};

const Chatbot = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState(initialMessages);
  const [catalog, setCatalog] = useState([]);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages, isOpen]);

  useEffect(() => {
    const loadCatalog = async () => {
      try {
        const res = await fetch(apiUrl("/products"));
        const data = await res.json();
        const liveProducts = Array.isArray(data)
          ? data.map(normalizeProduct)
          : [];
        setCatalog(liveProducts);

        if (liveProducts.length > 0) {
          setMessages((prev) => {
            if (prev.length !== 1 || prev[0].type !== "bot") return prev;
            const nextSuggestions = getCatalogSuggestions(liveProducts);
            return [
              {
                ...prev[0],
                suggestions: nextSuggestions,
                suggestionGroups: getSuggestionGroups(nextSuggestions),
              },
            ];
          });
        }
      } catch {
        setCatalog(fallbackProducts.map(normalizeProduct));
      }
    };

    loadCatalog();
  }, []);

  const handleEndChat = () => {
    const nextSuggestions = getCatalogSuggestions(
      catalog.length > 0 ? catalog : fallbackProducts.map(normalizeProduct),
    );

    setMessages([
      {
        ...initialMessages[0],
        suggestions: nextSuggestions,
        suggestionGroups: getSuggestionGroups(nextSuggestions),
      },
    ]);
    setInput("");
    setIsOpen(false);
  };

  const handleSend = async (text) => {
    if (!text.trim()) return;

    setMessages((prev) => [...prev, { type: "user", text }]);
    setInput("");

    const reply = buildSiteOnlyReply(text, user, catalog);
    const nextSuggestions = getFollowUpSuggestions(
      text,
      reply.text,
      reply.products,
      catalog,
    );

    setMessages((prev) => [
      ...prev,
      {
        type: "bot",
        ...reply,
        suggestions: nextSuggestions,
        suggestionGroups: getSuggestionGroups(nextSuggestions),
      },
    ]);
  };

  return (
    <>
      {/* Floating Button */}
      <button
        id="chatbot-toggle"
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-btn shadow-2xl transition-transform hover:scale-110 sm:bottom-6 sm:right-6"
      >
        {isOpen ? (
          <X size={24} className="text-white" />
        ) : (
          <MessageSquare size={24} className="text-white" />
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed inset-x-3 bottom-24 z-50 flex h-[min(500px,calc(100vh-8rem))] flex-col overflow-hidden border border-white/20 shadow-2xl animate-in slide-in-from-bottom-10 duration-300 glass-card sm:inset-x-auto sm:right-6 sm:w-96">
          {/* Header */}
          <div className="flex items-center justify-between gap-3 bg-linear-to-r from-accent to-accent-purple p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
                <Sparkles size={20} className="text-accent" />
              </div>
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider text-white">
                  Aura AI Stylist
                </h3>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-green-400"></div>
                  <span className="text-xs text-white/80 font-medium">
                    Online
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={handleEndChat}
              className="rounded-full border border-white/30 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white hover:bg-white/15 transition-colors"
            >
              End
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${msg.type === "user" ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[88%] rounded-2xl px-4 py-2 sm:max-w-[80%] ${msg.type === "user" ? "bg-white/20 text-white" : "bg-accent/20 border border-accent/30 text-white"}`}
                >
                  <p className="text-sm">{msg.text}</p>
                </div>

                {msg.products && msg.products.length > 0 && (
                  <div className="mt-2 flex gap-2 overflow-x-auto w-full pb-2">
                    {msg.products.map((p) => (
                      <Link
                        key={p._id || p.id}
                        to={`/product/${p._id || p.id}`}
                        onClick={() => setIsOpen(false)}
                        className="min-w-30 bg-white/5 rounded-lg border border-white/10 overflow-hidden shrink-0 group hover:border-accent/50 transition-colors"
                      >
                        <img
                          src={getChatbotImageUrl(p.image)}
                          alt={p.name}
                          onError={(e) => {
                            e.currentTarget.src = PLACEHOLDER_IMAGE;
                          }}
                          className="w-full h-24 object-cover"
                        />
                        <div className="p-2">
                          <h4 className="text-xs font-bold truncate">
                            {p.name}
                          </h4>
                          <span className="text-xs text-accent">
                            ₹{Number(p.price).toFixed(2)}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}

                {msg.type === "bot" && (
                  <div className="mt-2 flex flex-col gap-3 max-w-[90%]">
                    {msg.suggestionGroups?.map((group, groupIndex) => (
                      <div key={`${idx}-${groupIndex}`} className="space-y-2">
                        <div className="text-[10px] uppercase tracking-[0.2em] text-gray-400">
                          {group.title}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {group.suggestions.map((suggestion) => (
                            <button
                              key={`${idx}-${groupIndex}-${suggestion}`}
                              onClick={() => handleSend(suggestion)}
                              className="bg-white/5 border border-white/10 hover:border-accent/50 rounded-full px-3 py-1 text-xs text-gray-300 transition-colors"
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}

                    {!msg.suggestionGroups &&
                      msg.suggestions &&
                      msg.suggestions.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {msg.suggestions.map((suggestion) => (
                            <button
                              key={`${idx}-${suggestion}`}
                              onClick={() => handleSend(suggestion)}
                              className="bg-white/5 border border-white/10 hover:border-accent/50 rounded-full px-3 py-1 text-xs text-gray-300 transition-colors"
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      )}
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-white/10 bg-black/20">
            <div className="relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend(input)}
                placeholder="Ask Aria anything..."
                className="w-full bg-white/5 border border-white/20 rounded-full py-3 pl-4 pr-12 text-sm focus:outline-none focus:border-accent"
              />
              <button
                onClick={() => handleSend(input)}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-accent flex items-center justify-center text-white"
              >
                <Send size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;
