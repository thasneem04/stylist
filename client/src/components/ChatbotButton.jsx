import { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Sparkles, Send, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const AI_API_ORIGIN = import.meta.env.VITE_AI_URL || "http://localhost:8000";

const ChatbotButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Hi! I'm Aura, your AI stylist. I can help you find products, check prices, or suggest outfits. What's on your mind?",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setLoading(true);

    try {
      const response = await fetch(`${AI_API_ORIGIN}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: userMsg }),
      });

      const data = await response.json();

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: data.response,
          products: data.products,
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "I'm having a bit of trouble connecting to my brain. Make sure the AI service is running!",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed inset-x-3 bottom-24 z-[60] flex h-[min(550px,calc(100vh-8rem))] flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-2xl sm:inset-x-auto sm:right-6 sm:w-[400px]"
          >
            {/* Header */}
            <div className="bg-primary text-white p-5 flex justify-between items-center shadow-lg">
              <div className="flex items-center space-x-3">
                <div className="bg-accent p-2 rounded-lg">
                  <Sparkles size={18} className="text-white" />
                </div>
                <div>
                  <h3 className="font-black text-sm uppercase tracking-wider">
                    Aura AI Stylist
                  </h3>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    <span className="text-[10px] text-gray-400 font-bold uppercase">
                      Online Now
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Chat Area */}
            <div
              ref={scrollRef}
              className="flex-1 p-5 bg-gray-50 overflow-y-auto space-y-4"
            >
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-4 shadow-sm text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-black text-white rounded-tr-none"
                        : "bg-white text-gray-800 border border-gray-100 rounded-tl-none"
                    }`}
                  >
                    {msg.text}

                    {msg.products && msg.products.length > 0 && (
                      <div className="mt-4 grid grid-cols-2 gap-3">
                        {msg.products.map((p, idx) => (
                          <div
                            key={idx}
                            className="bg-gray-50 rounded-xl overflow-hidden border border-gray-200 hover:border-accent transition-colors"
                          >
                            <img
                              src={p.image}
                              alt=""
                              className="w-full h-24 object-cover"
                            />
                            <div className="p-2">
                              <p className="text-[10px] font-bold truncate text-gray-900">
                                {p.name}
                              </p>
                              <p className="text-[10px] font-black text-accent mt-0.5">
                                ₹{p.price}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-none p-4 shadow-sm">
                    <Loader2 className="animate-spin text-accent" size={20} />
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <form
              onSubmit={handleSend}
              className="p-4 bg-white border-t border-gray-100"
            >
              <div className="flex items-center gap-2 bg-gray-100 rounded-xl px-4 py-1">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 bg-transparent border-none py-3 text-sm focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || loading}
                  className="text-primary hover:text-accent disabled:text-gray-300 transition-colors"
                >
                  <Send size={20} />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-5 right-5 z-[60] flex items-center justify-center rounded-2xl border-2 border-white/10 bg-black p-4 text-white shadow-2xl transition-all hover:shadow-black/20 sm:bottom-6 sm:right-6 sm:p-5"
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
        {!isOpen && (
          <span className="absolute -top-2 -right-2 bg-accent text-white text-[10px] font-black px-2 py-1 rounded-lg animate-bounce">
            AI
          </span>
        )}
      </motion.button>
    </>
  );
};

export default ChatbotButton;
