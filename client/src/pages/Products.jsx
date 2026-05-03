import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, Search, X } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { apiUrl } from '../utils/api';

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialOccasion = searchParams.get('occasion') || 'all';

  const [allProducts, setAllProducts] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [search, setSearch] = useState('');
  
  const [filters, setFilters] = useState({
    category: 'all',
    color: 'all',
    size: 'all',
    occasion: initialOccasion,
    priceRange: 500,
  });

  const [sortBy, setSortBy] = useState('recommended');

  const categories = ['all', 'shirt', 'dress', 'jeans', 'saree', 'jacket', 'shoes', 'accessories', 'ethnic', 'abaya'];
  const colors = ['all', 'black', 'white', 'red', 'pink', 'purple', 'silver', 'green', 'blue', 'gold'];
  const sizes = ['all', 'XS', 'S', 'M', 'L', 'XL'];
  const occasions = ['all', 'casual', 'party', 'wedding', 'office', 'sports', 'ethnic'];

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(apiUrl('/products'));
        const data = await res.json();
        setAllProducts(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error loading products:', error);
        setAllProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    let result = [...allProducts];

    // Search
    if (search) {
      result = result.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
    }

    // Safe Filters
    result = result.filter(item => {
      return (
        (filters.category === 'all' || item.category === filters.category) &&
        (filters.color === 'all' || item.color === filters.color || item.colors?.includes(filters.color)) &&
        (filters.size === 'all' || item.size?.includes(filters.size) || item.sizes?.includes(filters.size)) &&
        (filters.occasion === 'all' || item.occasion === filters.occasion) &&
        (item.price <= filters.priceRange)
      );
    });

    // Sorting
    if (sortBy === 'price-low') result.sort((a, b) => a.price - b.price);
    if (sortBy === 'price-high') result.sort((a, b) => b.price - a.price);
    if (sortBy === 'rating') result.sort((a, b) => b.rating - a.rating);

    setProducts(result);
  }, [filters, search, sortBy, allProducts]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    if (key === 'occasion' && searchParams.has('occasion')) {
      setSearchParams({});
    }
  };

  if (loading) return <div className="p-20 text-center"><p>Loading...</p></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6">
      
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <h1 className="text-2xl font-black uppercase tracking-tight sm:text-3xl">Collection</h1>
        
        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search products..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full glass rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>
          
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="glass rounded-full py-2 px-4 text-sm focus:outline-none appearance-none cursor-pointer"
          >
            <option value="recommended" className="bg-primary">Recommended</option>
            <option value="price-low" className="bg-primary">Price: Low to High</option>
            <option value="price-high" className="bg-primary">Price: High to Low</option>
            <option value="rating" className="bg-primary">Highest Rated</option>
          </select>

          <button 
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="md:hidden glass p-2 rounded-full text-accent"
          >
            <Filter size={20} />
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Filters */}
        <aside className={`w-full md:w-64 flex-shrink-0 ${isFilterOpen ? 'block' : 'hidden md:block'}`}>
            <div className="glass-card sticky top-32 space-y-8 p-5 sm:p-6 lg:top-24">
            <div className="flex justify-between items-center md:hidden mb-4">
              <h2 className="font-bold uppercase text-lg">Filters</h2>
              <button onClick={() => setIsFilterOpen(false)}><X size={20} /></button>
            </div>

            {/* Category */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Category</h3>
              <div className="flex flex-col gap-2">
                {categories.map(c => (
                  <label key={c} className="flex items-center gap-2 cursor-pointer group">
                    <input 
                      type="radio" 
                      name="category" 
                      checked={filters.category === c}
                      onChange={() => handleFilterChange('category', c)}
                      className="hidden" 
                    />
                    <div className={`w-4 h-4 rounded-full border border-white/30 flex items-center justify-center ${filters.category === c ? 'bg-accent border-accent' : 'group-hover:border-accent'}`}>
                      {filters.category === c && <div className="w-2 h-2 bg-white rounded-full" />}
                    </div>
                    <span className={`text-sm capitalize ${filters.category === c ? 'text-white font-bold' : 'text-gray-400'}`}>{c}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Color */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Color</h3>
              <div className="flex flex-wrap gap-2">
                {colors.map(c => (
                  <button 
                    key={c}
                    onClick={() => handleFilterChange('color', c)}
                    className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${filters.color === c ? 'border-accent scale-110' : 'border-transparent'}`}
                    style={{ backgroundColor: c === 'all' ? 'transparent' : c, backgroundImage: c === 'all' ? 'linear-gradient(45deg, #ff007f, #8a2be2)' : 'none' }}
                    title={c}
                  >
                    {c === 'all' && <span className="text-[10px] font-bold text-white uppercase">All</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* Size */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Size</h3>
              <div className="flex flex-wrap gap-2">
                {sizes.map(s => (
                  <button 
                    key={s}
                    onClick={() => handleFilterChange('size', s)}
                    className={`w-10 h-10 rounded glass flex items-center justify-center text-xs font-bold uppercase transition-colors ${filters.size === s ? 'bg-accent border-accent text-white' : 'hover:border-white/50'}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Occasion */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Occasion</h3>
              <select 
                value={filters.occasion}
                onChange={(e) => handleFilterChange('occasion', e.target.value)}
                className="w-full glass rounded py-2 px-3 text-sm focus:outline-none appearance-none capitalize"
              >
                {occasions.map(o => (
                  <option key={o} value={o} className="bg-primary">{o}</option>
                ))}
              </select>
            </div>

            {/* Price */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Max Price: ₹{filters.priceRange}</h3>
              <input 
                type="range" 
                min="0" 
                max="500" 
                value={filters.priceRange}
                onChange={(e) => handleFilterChange('priceRange', Number(e.target.value))}
                className="w-full accent-accent cursor-pointer"
              />
            </div>
            
          </div>
        </aside>

        {/* Product Grid */}
        <main className="flex-1">
          {products.length === 0 ? (
            <div className="text-center py-20 glass-card">
              <h3 className="text-xl font-bold mb-2">No products found</h3>
              <p className="text-gray-400">Try adjusting your filters to see more results.</p>
              <button 
                onClick={() => {
                  setFilters({ category: 'all', color: 'all', size: 'all', occasion: 'all', priceRange: 500 });
                  setSearch('');
                }}
                className="mt-6 bg-white/10 hover:bg-white/20 px-6 py-2 rounded-full text-sm font-bold transition-colors"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 lg:grid-cols-3 md:gap-6">
              {products.map(product => (
                <ProductCard key={product._id || product.id} product={product} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Products;
