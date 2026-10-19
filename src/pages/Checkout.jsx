import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    ShoppingBag, Truck, CreditCard, ChevronRight, ChevronLeft,
    MapPin, Phone, User, Loader2, CheckCircle, PackageCheck,
    ArrowLeft, ArrowRight, ShieldCheck, FileText
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/axiosInstance';
import { settingsAPI } from '../utils/api';
import { showError } from '../utils/swal';

const Checkout = () => {
    const { t } = useTranslation();
    const { currentLanguage } = useLanguage();
    const { cart, clearCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();
    const isAr = currentLanguage === 'ar';

    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [orderComplete, setOrderComplete] = useState(false);
    const [orderNumber, setOrderNumber] = useState('');
    const [governorates, setGovernorates] = useState([]);
    const [selectedGov, setSelectedGov] = useState(null);
    const [couponCode, setCouponCode] = useState('');
    const [couponData, setCouponData] = useState(null);
    const [couponError, setCouponError] = useState('');
    const [couponLoading, setCouponLoading] = useState(false);
    const [freeShippingThreshold, setFreeShippingThreshold] = useState(5000);

    const [formData, setFormData] = useState({
        name: user?.name || '',
        phone: '',
        address: '',
        city: '',
        notes: ''
    });

    useEffect(() => {
        const fetchGovs = async () => {
            try {
                const res = await api.get('/governorates');
                const govs = res.data?.data || [];
                setGovernorates(govs);
                if (govs.length > 0 && !selectedGov) {
                    setSelectedGov(govs[0]);
                    setFormData(prev => ({ ...prev, city: govs[0]._id }));
                }
            } catch (error) {
                console.error('Failed to fetch governorates', error);
            }
        };
        const fetchSettings = async () => {
            try {
                const res = await settingsAPI.get();
                const threshold = res?.data?.data?.freeShippingThreshold || res?.data?.freeShippingThreshold || 5000;
                setFreeShippingThreshold(threshold);
            } catch (err) {
                console.error('Failed to fetch settings', err);
            }
        };
        fetchGovs();
        fetchSettings();
    }, []);

    useEffect(() => {
        if (cart.length === 0 && !orderComplete) {
            navigate('/shop');
        }
    }, [cart.length, orderComplete, navigate]);

    const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const tax = 0;
    // If ALL items in cart have freeShipping, shipping is free.
    // Also, if subtotal >= freeShippingThreshold, shipping is free.
    const allFreeShipping = cart.length > 0 && cart.every(item => item.freeShipping);
    const thresholdMet = subtotal >= freeShippingThreshold;
    const isFreeShipping = allFreeShipping || thresholdMet;
    const shippingPrice = isFreeShipping ? 0 : (selectedGov?.shippingCost || 0);
    const discount = couponData?.discountAmount || 0;
    const total = Math.max(0, subtotal + tax + shippingPrice - discount);

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) return;
        setCouponLoading(true);
        setCouponError('');
        setCouponData(null);
        try {
            const res = await api.post('/coupons/validate', { code: couponCode, orderTotal: subtotal + shippingPrice });
            setCouponData(res.data.data);
        } catch (err) {
            setCouponError(err.response?.data?.message || (isAr ? 'كود غير صحيح' : 'Invalid coupon'));
        } finally {
            setCouponLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleCityChange = (e) => {
        const govId = e.target.value;
        const gov = governorates.find(g => g._id === govId);
        if (gov) {
            setSelectedGov(gov);
            setFormData({ ...formData, city: govId });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user) {
            showError(isAr ? 'يرجى تسجيل الدخول أولاً' : 'Please login first');
            navigate('/login');
            return;
        }

        setIsSubmitting(true);
        try {
            const orderData = {
                orderItems: cart.map(item => ({
                    nameEn: item.nameEn || item.name || 'Unknown',
                    nameAr: item.nameAr || item.name || 'غير معروف',
                    quantity: item.quantity,
                    image: item.images?.[0]?.url || item.image,
                    price: item.price,
                    product: item._id,
                    selectedColor: typeof item.selectedColor === 'string' ? item.selectedColor : item.selectedColor?.hexCode || ''
                })),
                shippingAddress: {
                    address: formData.address,
                    city: selectedGov ? (isAr ? selectedGov.nameAr : selectedGov.nameEn) : formData.city,
                    phone: formData.phone
                },
                paymentMethod: 'Cash on Delivery',
                itemsPrice: subtotal,
                taxPrice: tax,
                shippingPrice: shippingPrice,
                totalPrice: total,
                couponCode: couponData?.code || null,
                discountAmount: discount,
            };

            const { data } = await api.post('/orders', orderData);
            const createdOrder = data.data || data;

            setOrderNumber(createdOrder._id);
            setOrderComplete(true);
            clearCart();
        } catch (error) {
            console.error('Checkout failed:', error);
            showError(isAr ? 'فشل إتمام الطلب، يرجى المحاولة لاحقاً' : 'Checkout failed, please try again');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (orderComplete) {
        return (
            <div className="flex flex-col justify-center items-center mx-auto px-4 sm:px-6 lg:px-8 py-20 max-w-3xl min-h-[70vh] text-center">
                <div className="flex justify-center items-center bg-green-50 shadow-inner mb-8 rounded-full w-32 h-32 animate-bounce-slow">
                    <CheckCircle size={64} className="text-green-500" />
                </div>
                <h1 className="mb-6 font-black text-primary text-5xl">
                    {isAr ? 'تم تأكيد طلبك بنجاح!' : 'Order Confirmed!'}
                </h1>
                <p className="mb-10 max-w-md font-medium text-gray-500 text-xl leading-relaxed">
                    {isAr ? 'شكراً لشرائك من متجرنا. لقد تلقينا طلبك وسنقوم بتجهيزه وشحنه إليك في أسرع وقت ممكن.' : 'Thank you for choosing OpticStore. Your order has been received and is being prepared for shipment.'}
                </p>
                <div className="relative bg-white shadow-xl mb-10 p-8 border border-gray-100 rounded-[2.5rem] w-full overflow-hidden">
                    <div className="top-0 left-0 absolute bg-accent w-2 h-full" />
                    <p className="mb-3 font-black text-gray-400 text-sm uppercase tracking-widest">
                        {isAr ? 'رقم الطلب الخاص بك' : 'Your Order Number'}
                    </p>
                    <p className="font-mono font-black text-primary text-4xl tracking-tighter">
                        {orderNumber}
                    </p>
                </div>
                <div className="flex flex-wrap justify-center gap-4">
                    <Link
                        to="/tracking"
                        state={{ orderNumber }}
                        className="inline-flex items-center gap-3 bg-primary hover:bg-secondary shadow-primary/20 shadow-xl px-10 py-4 rounded-2xl font-black text-white text-lg hover:scale-105 transition-all transform"
                    >
                        {t('trackOrder')}
                        {isAr ? <ArrowLeft size={22} /> : <ArrowRight size={22} />}
                    </Link>
                    <Link
                        to="/"
                        className="inline-flex items-center gap-3 bg-white shadow-sm px-10 py-4 border-2 border-gray-100 hover:border-primary rounded-2xl font-black text-gray-600 hover:text-primary text-lg transition-all"
                    >
                        {isAr ? 'العودة للرئيسية' : 'Back to Home'}
                    </Link>
                </div>
            </div>
        );
    }

    if (cart.length === 0) {
        return (
            <div className="mx-auto px-4 py-24 max-w-7xl text-center">
                <h2 className="mb-6 font-black text-primary text-3xl">
                    {isAr ? 'عربة التسوق فارغة' : 'Your cart is empty'}
                </h2>
                <button
                    onClick={() => navigate('/shop')}
                    className="bg-accent hover:bg-orange-600 shadow-lg px-10 py-4 rounded-2xl font-black text-white text-lg transition-all"
                >
                    {isAr ? 'الذهاب للمتجر' : 'Go to Shop'}
                </button>
            </div>
        );
    }

    return (
        <div className="mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full max-w-7xl text-start">
            <h1 className="flex items-center gap-4 mb-6 font-black text-primary text-4xl">
                <PackageCheck size={40} className="text-accent" />
                {isAr ? 'إتمام الطلب' : 'Checkout'}
            </h1>

            {allFreeShipping && (
                <div className="flex items-center gap-4 bg-green-500 text-white px-6 py-4 rounded-2xl mb-8 shadow-lg shadow-green-500/20">
                    <Truck size={24} className="shrink-0" />
                    <div>
                        <p className="font-black text-lg">{isAr ? '🎉 يسعدنا مكافأتك! الشحن مجاني' : '🎉 Great news! Free Shipping Applied'}</p>
                        <p className="text-green-100 text-sm font-medium">{isAr ? 'جميع منتجات طلبك الحالي تشحن مجاناً بدون أي تكلفة إضافية.' : 'All items in your order qualify for free shipping at no extra cost.'}</p>
                    </div>
                </div>
            )}

            <div className="gap-16 grid grid-cols-1 lg:grid-cols-2">
                {/* Form Section */}
                <div className="space-y-8">
                    <div className="bg-white shadow-sm p-8 md:p-10 border border-gray-100 rounded-[2.5rem]">
                        <h2 className="flex items-center gap-3 mb-8 pb-6 border-gray-50 border-b font-black text-primary text-2xl">
                            <User className="text-accent" size={24} />
                            {isAr ? 'تفاصيل الشحن' : 'Shipping Details'}
                        </h2>

                        <form id="checkout-form" onSubmit={handleSubmit} className="space-y-6">
                            <div className="gap-6 grid grid-cols-1 sm:grid-cols-2">
                                <div>
                                    <label className="block mb-3 font-black text-primary text-sm uppercase tracking-widest">
                                        {isAr ? 'الاسم بالكامل' : 'Full Name'}
                                    </label>
                                    <div className="group relative">
                                        <input
                                            type="text"
                                            name="name"
                                            required
                                            placeholder={isAr ? 'أدخل اسمك بالكامل' : 'Enter your full name'}
                                            value={formData.name}
                                            onChange={handleChange}
                                            className="bg-gray-50 focus:bg-white py-4 pr-4 pl-12 border border-gray-100 focus:border-accent rounded-2xl focus:outline-none focus:ring-4 focus:ring-accent/10 w-full font-bold text-primary transition-all"
                                        />
                                        <User size={20} className={`absolute top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-accent transition-colors ${isAr ? 'right-4' : 'left-4'}`} />
                                    </div>
                                </div>

                                <div>
                                    <label className="block mb-3 font-black text-primary text-sm uppercase tracking-widest">
                                        {isAr ? 'رقم الهاتف' : 'Phone Number'}
                                    </label>
                                    <div className="group relative">
                                        <input
                                            type="tel"
                                            name="phone"
                                            required
                                            placeholder="05xxxxxxx"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            className="bg-gray-50 focus:bg-white py-4 pr-4 pl-12 border border-gray-100 focus:border-accent rounded-2xl focus:outline-none focus:ring-4 focus:ring-accent/10 w-full font-bold text-primary transition-all"
                                            dir="ltr"
                                        />
                                        <Phone size={20} className={`absolute top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-accent transition-colors ${isAr ? 'right-4' : 'left-4'}`} />
                                    </div>
                                </div>
                            </div>

                            <div className="gap-6 grid grid-cols-1 sm:grid-cols-2">
                                <div>
                                    <label className="block mb-3 font-black text-primary text-sm uppercase tracking-widest">
                                        {isAr ? 'المحافظة' : 'Governorate'}
                                    </label>
                                    <div className="group relative">
                                        <select
                                            name="city"
                                            required
                                            value={formData.city}
                                            onChange={handleCityChange}
                                            className="bg-gray-50 focus:bg-white py-4 pr-4 pl-12 border border-gray-100 focus:border-accent rounded-2xl focus:outline-none focus:ring-4 focus:ring-accent/10 w-full font-bold text-primary transition-all appearance-none"
                                        >
                                            <option value="" disabled>{isAr ? 'اختر المحافظة' : 'Select Governorate'}</option>
                                            {governorates.map(gov => (
                                                <option key={gov._id} value={gov._id}>
                                                    {isAr ? gov.nameAr : gov.nameEn}
                                                </option>
                                            ))}
                                        </select>
                                        <MapPin size={20} className={`absolute top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-accent transition-colors ${isAr ? 'right-4' : 'left-4'}`} />
                                    </div>
                                </div>

                                <div>
                                    <label className="block mb-3 font-black text-primary text-sm uppercase tracking-widest">
                                        {isAr ? 'العنوان' : 'Address'}
                                    </label>
                                    <div className="group relative">
                                        <input
                                            type="text"
                                            name="address"
                                            required
                                            placeholder={isAr ? 'الحي، اسم الشارع، رقم المبنى' : 'District, Street, Building'}
                                            value={formData.address}
                                            onChange={handleChange}
                                            className="bg-gray-50 focus:bg-white py-4 pr-4 pl-12 border border-gray-100 focus:border-accent rounded-2xl focus:outline-none focus:ring-4 focus:ring-accent/10 w-full font-bold text-primary transition-all"
                                        />
                                        <Truck size={20} className={`absolute top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-accent transition-colors ${isAr ? 'right-4' : 'left-4'}`} />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block mb-3 font-black text-primary text-sm uppercase tracking-widest">
                                    {isAr ? 'ملاحظات إضافية' : 'Additional Notes'}
                                </label>
                                <div className="group relative">
                                    <textarea
                                        name="notes"
                                        value={formData.notes}
                                        onChange={handleChange}
                                        rows="3"
                                        placeholder={isAr ? 'أي تعليمات خاصة للتوصيل...' : 'Any special delivery instructions...'}
                                        className="bg-gray-50 focus:bg-white py-4 pr-4 pl-12 border border-gray-100 focus:border-accent rounded-2xl focus:outline-none focus:ring-4 focus:ring-accent/10 w-full font-bold text-primary transition-all resize-none"
                                    />
                                    <FileText size={20} className={`absolute top-5 text-gray-400 group-focus-within:text-accent transition-colors ${isAr ? 'right-4' : 'left-4'}`} />
                                </div>
                            </div>
                        </form>
                    </div>

                    <div className="bg-blue-50 p-8 border border-blue-100 rounded-[2rem]">
                        <div className="flex gap-4">
                            <div className="flex justify-center items-center bg-blue-500 shadow-blue-500/20 shadow-lg rounded-xl w-12 h-12 text-white shrink-0">
                                <CreditCard size={24} />
                            </div>
                            <div>
                                <h3 className="mb-1 font-black text-blue-900 text-lg">{isAr ? 'الدفع عند الاستلام' : 'Cash on Delivery'}</h3>
                                <p className="font-medium text-blue-700 leading-relaxed">
                                    {isAr ? 'حالياً ندعم الدفع عند الاستلام فقط لضمان أفضل تجربة تسوق لك.' : 'We currently support Cash on Delivery only to ensure the best shopping experience for you.'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Summary Section */}
                <div className="lg:col-span-1">
                    <div className="top-32 sticky bg-white shadow-xl p-8 md:p-10 border border-gray-100 rounded-[2.5rem]">
                        <h2 className="mb-8 pb-6 border-gray-50 border-b font-black text-primary text-2xl">
                            {isAr ? 'ملخص الطلب' : 'Order Summary'}
                        </h2>

                        <div className="space-y-4 mb-8 pr-2 max-h-[35vh] overflow-y-auto custom-scrollbar">
                            {cart.map(item => (
                                <div key={`${item._id}-${item.selectedColor}`} className="group flex justify-between items-center bg-gray-50 hover:bg-white hover:shadow-md p-4 border border-gray-100 rounded-2xl transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-white p-1 border border-gray-100 rounded-xl w-16 h-16 overflow-hidden">
                                            <img src={item.images?.[0]?.url || item.image} alt={isAr ? item.nameAr : (item.nameEn || item.name)} className="rounded-lg w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                        </div>
                                        <div>
                                            <p className="font-black text-primary text-sm line-clamp-1">{isAr ? item.nameAr : (item.nameEn || item.name)}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="font-bold text-gray-400 text-xs">Qty: {item.quantity}</span>
                                                <div className="rounded-full w-2.5 h-2.5" style={{ backgroundColor: typeof item.selectedColor === 'string' ? item.selectedColor : item.selectedColor?.hexCode }} />
                                            </div>
                                        </div>
                                    </div>
                                    <span className="bg-white shadow-sm px-3 py-1 border border-gray-50 rounded-lg font-black text-primary text-sm whitespace-nowrap">{(item.price * item.quantity).toFixed(2)} {isAr ? 'ج.م' : 'EGP'}</span>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-4 mb-10 pt-8 border-gray-100 border-t text-gray-600">
                            <div className="flex justify-between font-bold">
                                <span>{isAr ? 'المجموع الفرعي' : 'Subtotal'}</span>
                                <span className="font-black text-primary">{subtotal.toFixed(2)} {isAr ? 'ج.م' : 'EGP'}</span>
                            </div>

                            {allFreeShipping ? (
                                <div className="flex items-center gap-3 bg-green-50 border border-green-100 rounded-2xl px-4 py-3">
                                    <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full shrink-0">
                                        <Truck size={16} className="text-green-600" />
                                    </div>
                                    <div>
                                        <p className="font-black text-green-700 text-sm">{isAr ? '🎉 شحن مجاني!' : '🎉 Free Shipping!'}</p>
                                        <p className="text-green-600 text-xs font-medium">{isAr ? 'كل منتجات طلبك تشحن مجاناً' : 'All products in your order ship for free'}</p>
                                    </div>
                                    <span className="ms-auto font-black text-green-600 text-sm">{isAr ? 'مجاني' : 'Free'}</span>
                                </div>
                            ) : (
                                <div className="flex justify-between font-bold text-accent">
                                    <span>{isAr ? 'تكلفة الشحن' : 'Shipping'}</span>
                                    <span>{shippingPrice > 0 ? `${shippingPrice.toFixed(2)} ${isAr ? 'ج.م' : 'EGP'}` : (isAr ? 'مجاني' : 'Free')}</span>
                                </div>
                            )}

                            {/* ─── Coupon Input ─── */}
                            <div className="pt-3 border-t border-dashed border-gray-100">
                                <label className="block mb-2 text-xs font-bold text-gray-500 uppercase tracking-widest">{isAr ? 'كود الخصم' : 'Discount Code'}</label>
                                <div className="flex gap-2">
                                    <input
                                        value={couponCode}
                                        onChange={e => { setCouponCode(e.target.value.toUpperCase()); setCouponData(null); setCouponError(''); }}
                                        placeholder={isAr ? 'أدخل الكود...' : 'Enter code...'}
                                        className="flex-grow p-3 border border-gray-200 rounded-xl font-mono font-bold text-primary uppercase bg-gray-50 focus:outline-none focus:ring-2 focus:ring-accent text-sm"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleApplyCoupon}
                                        disabled={couponLoading || !couponCode.trim()}
                                        className="px-4 py-3 bg-primary text-white rounded-xl font-bold text-sm hover:bg-secondary transition disabled:opacity-50 shrink-0"
                                    >
                                        {couponLoading ? <Loader2 size={16} className="animate-spin" /> : (isAr ? 'تطبيق' : 'Apply')}
                                    </button>
                                </div>
                                {couponError && <p className="mt-1 text-red-500 text-xs font-bold">{couponError}</p>}
                                {couponData && (
                                    <div className="flex justify-between items-center mt-2 bg-green-50 border border-green-100 rounded-xl px-3 py-2">
                                        <span className="text-green-700 font-bold text-sm">✓ {couponData.code}</span>
                                        <span className="text-green-700 font-black text-sm">- {couponData.discountAmount.toFixed(2)} {isAr ? 'ج.م' : 'EGP'}</span>
                                    </div>
                                )}
                            </div>

                            {discount > 0 && (
                                <div className="flex justify-between font-bold text-green-600">
                                    <span>{isAr ? 'خصم' : 'Discount'}</span>
                                    <span>- {discount.toFixed(2)} {isAr ? 'ج.م' : 'EGP'}</span>
                                </div>
                            )}

                            <div className="flex justify-between items-center mt-6 pt-6 border-gray-100 border-t text-xl">
                                <span className="font-black text-primary">{t('total')}</span>
                                <span className="font-black text-primary text-4xl">{total.toFixed(2)} {isAr ? 'ج.م' : 'EGP'}</span>
                            </div>
                        </div>

                        <button
                            type="submit"
                            form="checkout-form"
                            disabled={isSubmitting}
                            className={`w-full font-black py-5 rounded-2xl flex justify-center items-center gap-3 transition-all shadow-xl text-xl group transform active:scale-95 ${isSubmitting
                                ? 'bg-gray-200 cursor-not-allowed text-gray-400'
                                : 'bg-accent text-white hover:bg-orange-600 shadow-accent/30 hover:shadow-accent/50'
                                }`}
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="border-4 border-gray-300 border-t-accent rounded-full w-6 h-6 animate-spin" />
                                    {isAr ? 'جاري تأكيد طلبك...' : 'Confirming...'}
                                </>
                            ) : (
                                <>
                                    {isAr ? 'تأكيد وشراء الآن' : 'Confirm & Purchase'}
                                    {isAr ? <ArrowLeft className="transition-transform group-hover:-translate-x-2" /> : <ArrowRight className="transition-transform group-hover:translate-x-2" />}
                                </>
                            )}
                        </button>

                        <div className="flex justify-center items-center gap-2 mt-8 text-gray-400">
                            <ShieldCheck size={18} />
                            <span className="font-black text-xs uppercase tracking-widest">Guaranteed Secure Transaction</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
