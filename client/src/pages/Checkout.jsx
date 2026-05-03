import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, CreditCard, Banknote, Smartphone, CheckCircle2, XCircle, ArrowLeft, Loader2, WalletCards } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useShop } from '../context/ShopContext';
import { useAuth } from '../context/AuthContext';
import { addOrder, createEstimatedDeliveryDate, createOrderId } from '../utils/orders';
import { assetUrl } from '../utils/api';

const getImageUrl = (image) => assetUrl(image);
const checkoutInputClass = 'w-full bg-white border border-gray-300 rounded-lg p-3 text-gray-950 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent';
const paymentInputClass = 'w-full bg-white border border-gray-300 rounded-lg p-3 text-gray-950 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent';
const merchantUpiId = 'almasathifa23@okaxis';

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, clearCart, buyNowItem, clearBuyNow } = useShop();
  const { user } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [upiProvider, setUpiProvider] = useState('gpay');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('idle'); // idle, processing, success, error
  const [placedOrderId, setPlacedOrderId] = useState('');
  const [shippingDetails, setShippingDetails] = useState({
    fullName: user?.name || '',
    address: '',
    city: '',
    zip: '',
    phone: '',
  });

  const checkoutItems = useMemo(() => (buyNowItem ? [buyNowItem] : cart), [buyNowItem, cart]);
  const subtotal = useMemo(() => (
    checkoutItems.reduce((acc, item) => acc + (item.price * (1 - (item.discount || 0) / 100)) * item.quantity, 0)
  ), [checkoutItems]);
  const shipping = subtotal > 100 ? 0 : 15;
  const tax = subtotal > 0 ? 10 : 0;
  const total = subtotal + shipping + tax;

  const updateShippingDetails = (field, value) => {
    setShippingDetails(prev => ({ ...prev, [field]: value }));
  };

  const upiProviders = [
    { id: 'gpay', label: 'Google Pay', shortLabel: 'GPay', scheme: 'gpay://upi/pay' },
    { id: 'paytm', label: 'Paytm', shortLabel: 'Paytm', scheme: 'paytmmp://pay' },
    { id: 'phonepe', label: 'PhonePe', shortLabel: 'PhonePe', scheme: 'phonepe://pay' },
  ];

  const createUpiPaymentUrl = (scheme = 'upi://pay') => {
    const params = new URLSearchParams({
      pa: merchantUpiId,
      pn: 'Aura Fashion',
      am: total.toFixed(2),
      cu: 'INR',
      tn: 'AI Fashion Assistant Order',
    });

    return `${scheme}?${params.toString()}`;
  };

  const openUpiApp = (provider) => {
    setUpiProvider(provider.id);

    window.location.href = createUpiPaymentUrl(provider.scheme);

    window.setTimeout(() => {
      window.location.href = createUpiPaymentUrl();
    }, 900);
  };

  const handlePayment = (e) => {
    e.preventDefault();
    if (checkoutItems.length === 0) {
      navigate('/cart');
      return;
    }
    setIsProcessing(true);
    setPaymentStatus('processing');

    // Simulate payment delay
    setTimeout(() => {
      // 90% success rate for simulation
      const isSuccess = Math.random() > 0.1;
      setIsProcessing(false);
      if (isSuccess) {
        const orderId = createOrderId();
        addOrder({
          id: orderId,
          user: shippingDetails.fullName || user?.name || 'Guest Customer',
          email: user?.email || '',
          total,
          status: 'placed',
          date: new Date().toISOString().slice(0, 10),
          estimatedDeliveryDate: createEstimatedDeliveryDate(),
          paymentMethod,
          shippingDetails,
          items: checkoutItems.map(item => ({
            id: item._id,
            name: item.name,
            qty: item.quantity,
            price: Number((item.price * (1 - (item.discount || 0) / 100)).toFixed(2)),
            image: item.image,
            size: item.selectedSize,
            color: item.color,
          })),
        });
        setPlacedOrderId(orderId);
        if (buyNowItem) {
          clearBuyNow();
        } else {
          clearCart();
        }
        setPaymentStatus('success');
      } else {
        setPaymentStatus('error');
      }
    }, 2500);
  };

  if (paymentStatus === 'success') {
    return (
      <div className="min-h-[70vh] bg-white text-gray-900 flex items-center justify-center px-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white p-10 rounded-2xl shadow-2xl border border-green-100 text-center"
        >
          <div className="flex justify-center mb-6">
            <div className="bg-green-100 p-4 rounded-full">
              <CheckCircle2 className="text-green-600" size={64} />
            </div>
          </div>
          <h1 className="text-3xl font-black uppercase mb-2">Order Placed!</h1>
          <p className="text-gray-500 mb-8">Thank you for your purchase. Your order {placedOrderId} has been successfully placed.</p>
          <div className="space-y-3">
            <Link to="/orders" className="block w-full bg-black text-white py-4 rounded-md font-bold uppercase tracking-wider hover:bg-gray-800 transition-all">
              Track My Order
            </Link>
            <Link to="/" className="block w-full text-sm font-bold text-gray-500 hover:text-black transition-colors py-2">
              Continue Shopping
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  if (paymentStatus === 'error') {
    return (
      <div className="min-h-[70vh] bg-white text-gray-900 flex items-center justify-center px-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white p-10 rounded-2xl shadow-2xl border border-red-100 text-center"
        >
          <div className="flex justify-center mb-6">
            <div className="bg-red-100 p-4 rounded-full">
              <XCircle className="text-red-600" size={64} />
            </div>
          </div>
          <h1 className="text-3xl font-black uppercase mb-2">Payment Failed</h1>
          <p className="text-gray-500 mb-8">We couldn't process your payment. Please check your card details or try another method.</p>
          <div className="space-y-3">
            <button 
              onClick={() => setPaymentStatus('idle')}
              className="block w-full bg-black text-white py-4 rounded-md font-bold uppercase tracking-wider hover:bg-gray-800 transition-all"
            >
              Try Again
            </button>
            <Link to="/cart" className="block w-full text-sm font-bold text-gray-500 hover:text-black transition-colors py-2">
              Back to Cart
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-950">
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        <div className="mb-6 flex flex-wrap items-center gap-2 text-xs font-bold uppercase text-gray-500 sm:mb-8 sm:text-sm">
          <Link to="/cart" className="hover:text-black flex items-center gap-1"><ArrowLeft size={16}/> Back to Cart</Link>
          <span>/</span>
          <span className="text-black">Secure Checkout</span>
        </div>

      <div className="flex flex-col gap-8 lg:flex-row lg:gap-12">
        {/* Checkout Form */}
        <div className="flex-1">
          <form onSubmit={handlePayment} className="space-y-6 sm:space-y-10">
            {/* Shipping Info */}
            <section className="bg-white p-4 sm:p-8 rounded-xl border border-gray-100 shadow-sm text-gray-950">
              <h2 className="mb-5 flex items-center gap-2 text-lg font-black uppercase tracking-tight text-gray-950 sm:mb-6 sm:text-xl">
                <span className="bg-black text-white w-7 h-7 rounded-full flex items-center justify-center text-xs">1</span>
                Shipping Details
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <input required type="text" value={shippingDetails.fullName} onChange={e => updateShippingDetails('fullName', e.target.value)} placeholder="Full Name" className={`sm:col-span-2 ${checkoutInputClass}`} />
                <input required type="text" value={shippingDetails.address} onChange={e => updateShippingDetails('address', e.target.value)} placeholder="Address" className={`sm:col-span-2 ${checkoutInputClass}`} />
                <input required type="text" value={shippingDetails.city} onChange={e => updateShippingDetails('city', e.target.value)} placeholder="City" className={checkoutInputClass} />
                <input required type="text" value={shippingDetails.zip} onChange={e => updateShippingDetails('zip', e.target.value)} placeholder="ZIP Code" className={checkoutInputClass} />
                <input required type="tel" value={shippingDetails.phone} onChange={e => updateShippingDetails('phone', e.target.value)} placeholder="Phone Number" className={`sm:col-span-2 ${checkoutInputClass}`} />
              </div>
            </section>

            {/* Payment Method */}
            <section className="bg-white p-4 sm:p-8 rounded-xl border border-gray-100 shadow-sm text-gray-950">
              <h2 className="mb-5 flex items-center gap-2 text-lg font-black uppercase tracking-tight text-gray-950 sm:mb-6 sm:text-xl">
                <span className="bg-black text-white w-7 h-7 rounded-full flex items-center justify-center text-xs">2</span>
                Payment Method
              </h2>
              
              <div className="mb-6 grid grid-cols-1 gap-3 sm:mb-8 sm:grid-cols-3 sm:gap-4">
                <button 
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-4 border rounded-xl flex flex-col items-center gap-2 transition-all ${paymentMethod === 'card' ? 'border-black bg-black text-white shadow-lg' : 'border-gray-300 bg-white text-gray-950 hover:border-black'}`}
                >
                  <CreditCard size={24} />
                  <span className="text-xs font-bold uppercase tracking-wider">Credit Card</span>
                </button>
                <button 
                  type="button"
                  onClick={() => setPaymentMethod('upi')}
                  className={`p-4 border rounded-xl flex flex-col items-center gap-2 transition-all ${paymentMethod === 'upi' ? 'border-black bg-black text-white shadow-lg' : 'border-gray-300 bg-white text-gray-950 hover:border-black'}`}
                >
                  <Smartphone size={24} />
                  <span className="text-xs font-bold uppercase tracking-wider">UPI / GPay</span>
                </button>
                <button 
                  type="button"
                  onClick={() => setPaymentMethod('cod')}
                  className={`p-4 border rounded-xl flex flex-col items-center gap-2 transition-all ${paymentMethod === 'cod' ? 'border-black bg-black text-white shadow-lg' : 'border-gray-300 bg-white text-gray-950 hover:border-black'}`}
                >
                  <Banknote size={24} />
                  <span className="text-xs font-bold uppercase tracking-wider">Cash on Delivery</span>
                </button>
              </div>

              <AnimatePresence mode="wait">
                {paymentMethod === 'card' && (
                  <motion.div 
                    key="card"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4"
                  >
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <CreditCard size={18} />
                      </div>
                      <input type="text" placeholder="Card Number" className={`${paymentInputClass} pl-10`} />
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <input type="text" placeholder="MM / YY" className={paymentInputClass} />
                      <input type="text" placeholder="CVV" className={paymentInputClass} />
                    </div>
                  </motion.div>
                )}

                {paymentMethod === 'upi' && (
                  <motion.div 
                    key="upi"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4"
                  >
                    <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4 text-center sm:p-6">
                      <Smartphone className="mx-auto mb-4 text-gray-500" size={32} />
                      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
                        {upiProviders.map(provider => (
                          <button
                            key={provider.id}
                            type="button"
                            onClick={() => openUpiApp(provider)}
                            className={`rounded-xl border px-4 py-4 flex flex-col items-center gap-2 transition-all ${
                              upiProvider === provider.id
                                ? 'border-black bg-black text-white shadow-lg'
                                : 'border-gray-300 bg-white text-gray-950 hover:border-black'
                            }`}
                          >
                            <WalletCards size={22} />
                            <span className="text-xs font-bold uppercase tracking-wider">{provider.shortLabel}</span>
                          </button>
                        ))}
                      </div>
                      <p className="text-sm text-gray-700 mb-4 font-medium">
                        {upiProviders.find(provider => provider.id === upiProvider)?.label} selected. Tap the payment app above to open it, or enter your UPI ID to receive a payment request.
                      </p>
                      <input type="text" placeholder="yourname@okaxis" className={`${paymentInputClass} max-w-xs text-center`} />
                    </div>
                  </motion.div>
                )}

                {paymentMethod === 'cod' && (
                  <motion.div 
                    key="cod"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-gray-50 p-6 rounded-lg flex items-start gap-4 border border-blue-100"
                  >
                    <div className="bg-blue-100 p-2 rounded-full text-blue-600">
                      <Banknote size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-blue-900">Cash on Delivery Selected</h4>
                      <p className="text-xs text-blue-800/70 mt-1 leading-relaxed">Please keep the exact amount ready at the time of delivery. A verification call will be made before dispatch.</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </section>

            <button 
              disabled={isProcessing}
              className="flex w-full items-center justify-center gap-3 rounded-xl bg-black px-4 py-4 text-sm font-bold uppercase tracking-wider text-white shadow-xl shadow-black/10 transition-all hover:bg-gray-800 disabled:bg-gray-400 sm:py-5 sm:text-base sm:tracking-widest"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="animate-spin" size={24} />
                  Processing...
                </>
              ) : (
                <>
                  <Lock size={20} />
                  <span className="truncate">Complete Purchase • ₹{total.toFixed(2)}</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Order Summary (Sidebar) */}
        <div className="w-full lg:w-96 flex-shrink-0">
          <div className="sticky top-32 rounded-xl border border-gray-100 bg-white p-4 text-gray-950 shadow-sm sm:p-8 lg:top-24">
            <h3 className="font-black uppercase tracking-wider mb-6 pb-4 border-b border-gray-100 flex justify-between items-center text-gray-950">
              Your Summary
              <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded">{checkoutItems.length} Items</span>
            </h3>
            
            <div className="mb-8 max-h-60 space-y-6 overflow-y-auto pr-2">
              {checkoutItems.map(item => (
                <div key={item._id} className="flex items-center gap-4 group">
                  <div className="w-16 h-20 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100">
                    <img src={getImageUrl(item.image)} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-gray-900 line-clamp-1">{item.name}</h4>
                    <p className="text-xs text-gray-500 font-medium mt-1">{item.selectedSize || 'Free Size'} / {item.color} • Qty {item.quantity}</p>
                    <p className="text-sm font-black mt-1 text-gray-950">₹{((item.price * (1 - (item.discount || 0) / 100)) * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3 text-sm border-t border-gray-100 pt-6 mb-6">
              <div className="flex justify-between text-gray-500 font-medium">
                <span>Subtotal</span>
                <span className="text-gray-900">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-500 font-medium">
                <span>Shipping</span>
                <span className="text-green-600 font-bold">{shipping === 0 ? 'FREE' : `₹${shipping.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between text-gray-500 font-medium">
                <span>Estimated Tax</span>
                <span className="text-gray-900">₹{tax.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex justify-between items-end text-xl font-black text-gray-900">
              <span className="uppercase text-xs tracking-[0.2em] mb-1">Total Pay</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default Checkout;
