import { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import ProductCard from './ProductCard';
import { apiUrl } from '../utils/api';

const API_BASE = apiUrl('/products');
const FEATURED_LIMIT = 6;
const FALLBACK_LIMIT = 8;

const fetchProducts = async (path) => {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) throw new Error(`Failed to load ${path}`);
  const data = await res.json();
  return Array.isArray(data) ? data : [];
};

const mergeUniqueProducts = (groups) => {
  const seen = new Set();
  return groups.flat().filter((product) => {
    const key = product._id || product.id;
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const FeaturedProductsSection = () => {
  const [products, setProducts] = useState([]);
  const [source, setSource] = useState('featured');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      try {
        const featuredProducts = await fetchProducts('/featured');

        if (featuredProducts.length > 0) {
          setSource('featured');
          setProducts(featuredProducts.slice(0, FEATURED_LIMIT));
          return;
        }

        const fallbackGroups = await Promise.all([
          fetchProducts('/new').catch(() => []),
          fetchProducts('/trending').catch(() => []),
          fetchProducts('/random').catch(() => []),
        ]);

        setSource('fallback');
        setProducts(mergeUniqueProducts(fallbackGroups).slice(0, FALLBACK_LIMIT));
      } catch {
        setSource('fallback');
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  const title = source === 'featured' ? 'Featured Collection' : 'Trending Styles';
  const subtitle = source === 'featured'
    ? 'Selected styles worth seeing first.'
    : 'Fresh arrivals and popular picks, refreshed automatically.';

  return (
    <section className="relative z-10 border-t border-white/10 bg-white/5 py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-10 flex flex-col gap-4 sm:mb-12 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="mb-4 text-2xl font-black uppercase tracking-tight sm:text-3xl md:text-5xl">
              {title.split(' ')[0]} <span className="text-gradient">{title.split(' ').slice(1).join(' ')}</span>
            </h2>
            <p className="text-gray-400">{subtitle}</p>
          </div>
          <Link to="/products" className="hidden md:flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-accent hover:text-accent-purple transition-colors">
            View All <ArrowRight size={16} />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="glass-card aspect-[3/5] animate-pulse bg-white/5" />
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            {products.map(product => (
              <ProductCard key={product._id || product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="glass-card p-10 text-center text-gray-400">
            New styles are arriving soon.
          </div>
        )}

        <div className="mt-10 text-center md:hidden">
          <Link to="/products" className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-accent hover:text-accent-purple transition-colors">
            View All <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProductsSection;
