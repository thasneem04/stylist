import { createContext, useContext, useState, useEffect } from 'react';

const ShopContext = createContext();

export const useShop = () => useContext(ShopContext);

export const ShopProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [wishlist, setWishlist] = useState(() => {
    const saved = localStorage.getItem('wishlist');
    return saved ? JSON.parse(saved) : [];
  });
  const [buyNowItem, setBuyNowItem] = useState(() => {
    const saved = sessionStorage.getItem('buy_now_item');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    if (buyNowItem) {
      sessionStorage.setItem('buy_now_item', JSON.stringify(buyNowItem));
    } else {
      sessionStorage.removeItem('buy_now_item');
    }
  }, [buyNowItem]);

  const addToCart = (product) => {
    setCart(prev => {
      const exists = prev.find(item => item._id === product._id);
      if (exists) {
        return prev.map(item => item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(item => item._id !== id));
  };

  const clearCart = () => {
    setCart([]);
  };

  const startBuyNow = (product) => {
    setBuyNowItem({ ...product, quantity: 1 });
  };

  const clearBuyNow = () => {
    setBuyNowItem(null);
  };

  const toggleWishlist = (product) => {
    setWishlist(prev => {
      const exists = prev.find(item => item._id === product._id);
      if (exists) return prev.filter(item => item._id !== product._id);
      return [...prev, product];
    });
  };

  return (
    <ShopContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, buyNowItem, startBuyNow, clearBuyNow, wishlist, toggleWishlist }}>
      {children}
    </ShopContext.Provider>
  );
};
