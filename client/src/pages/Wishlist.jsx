import React from 'react';
import { useShop } from '../context/ShopContext';
import ProductCard from '../components/ProductCard';
import { Link } from 'react-router-dom';

const Wishlist = () => {
  const { wishlist } = useShop();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 sm:py-12">
      <h1 className="mb-8 text-2xl font-black uppercase tracking-tight sm:text-4xl">My Wishlist</h1>
      
      {wishlist.length === 0 ? (
        <div className="text-center py-20 glass-card">
          <h3 className="text-xl font-bold mb-4">Your wishlist is empty</h3>
          <p className="text-gray-400 mb-8">Save items you love to review them later.</p>
          <Link to="/products" className="bg-gradient-btn px-8 py-3 rounded-full font-bold uppercase tracking-wider text-sm transition-transform hover:scale-105">
            Explore Collection
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
          {wishlist.map(product => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
