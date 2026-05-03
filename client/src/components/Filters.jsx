import { useState } from 'react';
import { ChevronDown, SlidersHorizontal } from 'lucide-react';

const Filters = () => {
  const categories = ["All", "Dresses", "Tops", "Outerwear", "Bottoms", "Accessories"];
  const priceRanges = ["Under ₹500", "₹500 - ₹1000", "₹1000 - ₹2000", "Over ₹2000"];
  const colors = ["#000000", "#FFFFFF", "#FF0000", "#0000FF", "#008000", "#FFFF00"];

  return (
    <div className="w-full lg:w-64 flex-shrink-0 lg:pr-8">
      <div className="flex items-center justify-between mb-6 lg:mb-8">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <SlidersHorizontal size={20} />
          Filters
        </h2>
        <button className="text-xs text-gray-500 hover:text-accent font-medium">Clear All</button>
      </div>

      <div className="space-y-8">
        {/* Category Filter */}
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider mb-4 flex justify-between items-center cursor-pointer">
            Category
            <ChevronDown size={16} />
          </h3>
          <div className="space-y-3">
            {categories.map((cat, i) => (
              <div key={i} className="flex items-center">
                <input 
                  type="checkbox" 
                  id={`cat-${i}`}
                  className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary accent-primary" 
                />
                <label htmlFor={`cat-${i}`} className="ml-3 text-sm text-gray-600 cursor-pointer hover:text-black">
                  {cat}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Price Filter */}
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider mb-4 flex justify-between items-center cursor-pointer">
            Price
            <ChevronDown size={16} />
          </h3>
          <div className="space-y-3">
            {priceRanges.map((price, i) => (
              <div key={i} className="flex items-center">
                <input 
                  type="checkbox" 
                  id={`price-${i}`}
                  className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary accent-primary" 
                />
                <label htmlFor={`price-${i}`} className="ml-3 text-sm text-gray-600 cursor-pointer hover:text-black">
                  {price}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Color Filter */}
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider mb-4 flex justify-between items-center cursor-pointer">
            Color
            <ChevronDown size={16} />
          </h3>
          <div className="flex flex-wrap gap-3">
            {colors.map((color, i) => (
              <button 
                key={i}
                className="w-6 h-6 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                style={{ backgroundColor: color }}
                aria-label={`Select color ${color}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Filters;
