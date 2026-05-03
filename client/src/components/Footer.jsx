const Footer = () => {
  return (
    <footer className="bg-primary text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div>
            <h2 className="text-2xl font-black tracking-tighter uppercase mb-6">
              Aura<span className="text-accent">.</span>
            </h2>
            <p className="text-gray-400 text-sm leading-relaxed">
              Your ultimate destination for AI-curated fashion. Discover trends personalized just for you.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider mb-4">Shop</h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">Men's Fashion</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Women's Fashion</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Kids & Baby</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Accessories</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider mb-4">Help</h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">Track Order</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Returns & Exchanges</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Customer Service</a></li>
              <li><a href="#" className="hover:text-white transition-colors">FAQs</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider mb-4">Newsletter</h3>
            <p className="text-gray-400 text-sm mb-4">Subscribe to get special offers, free giveaways, and updates.</p>
            <div className="flex">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="bg-white/10 text-white px-4 py-2 w-full focus:outline-none focus:ring-1 focus:ring-accent text-sm"
              />
              <button className="bg-accent px-4 py-2 text-sm font-bold uppercase hover:bg-red-600 transition-colors">
                Join
              </button>
            </div>
          </div>
        </div>
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-xs mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} Aura E-commerce. All rights reserved.
          </p>
          <div className="flex space-x-4">
            {/* Social Icons Placeholders */}
            <div className="w-8 h-8 rounded-full bg-white/10 hover:bg-accent transition-colors cursor-pointer"></div>
            <div className="w-8 h-8 rounded-full bg-white/10 hover:bg-accent transition-colors cursor-pointer"></div>
            <div className="w-8 h-8 rounded-full bg-white/10 hover:bg-accent transition-colors cursor-pointer"></div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
