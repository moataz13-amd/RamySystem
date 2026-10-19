import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Trash2, ShoppingBag, ArrowRight, ArrowLeft, Info } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import { settingsAPI } from '../utils/api';

const Cart = () => {
    const { t } = useTranslation();
    const { currentLanguage } = useLanguage();
    const { cart, removeFromCart, updateQuantity } = useCart();
    const navigate = useNavigate();
    const isAr = currentLanguage === 'ar';
    const [freeShippingThreshold, setFreeShippingThreshold] = React.useState(5000);

    React.useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await settingsAPI.get();
                const threshold = res?.data?.data?.freeShippingThreshold || res?.data?.freeShippingThreshold || 5000;
                setFreeShippingThreshold(threshold);
            } catch (err) {
                console.error('Failed to fetch settings', err);
            }
        };
        fetchSettings();
    }, []);

    const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const tax = 0;
    const total = subtotal;

    if (cart.length === 0) {
        return (
            <div className="mx-auto px-4 sm:px-6 lg:px-8 py-24 max-w-7xl text-center">
                <div className="flex justify-center items-center bg-gray-50 shadow-inner mx-auto mb-8 rounded-full w-32 h-32">
                    <ShoppingBag size={64} className="text-gray-300" />
                </div>
                <h2 className="mb-4 font-black text-primary text-4xl">
                    {isAr ? 'عربة التسوق فارغة' : 'Your cart is empty'}
                </h2>
                <p className="mx-auto mb-10 max-w-md font-medium text-gray-500 text-lg leading-relaxed">
                    {isAr ? 'يبدو أنك لم تضف أي منتجات بعد. استكشف مجموعتنا الآن وابدأ التسوق.' : 'Explore our collection now and find the perfect pair of glasses for your style.'}
                </p>
                <Link
                    to="/shop"
                    className="inline-flex items-center gap-3 bg-accent hover:bg-orange-600 shadow-accent/20 shadow-xl px-12 py-5 rounded-2xl font-black text-white text-xl hover:scale-105 transition-all duration-300 transform"
                >
                    {isAr ? 'ابدأ التسوق' : 'Start Shopping'}
                    {isAr ? <ArrowLeft size={22} /> : <ArrowRight size={22} />}
                </Link>
            </div>
        );
    }

    return (
        <div className="mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full max-w-7xl text-start">
            <h1 className="flex items-center gap-4 mb-10 font-black text-primary text-4xl">
                {t('cart')}
                <span className="bg-primary/10 px-4 py-1 rounded-full font-bold text-primary text-lg">
                    {cart.length} {isAr ? 'عناصر' : 'Items'}
                </span>
            </h1>

            <div className="gap-12 grid grid-cols-1 lg:grid-cols-3">
                {/* Cart Items */}
                <div className="space-y-6 lg:col-span-2">
                    {cart.map(item => (
                        <div key={`${item._id}-${item.selectedColor}`} className="group relative flex sm:flex-row flex-col gap-8 bg-white shadow-sm hover:shadow-xl p-8 border border-gray-100 rounded-[2rem] transition-all">
                            <Link to={`/product/${item._id}`} className="block flex-shrink-0 bg-gray-50 border border-gray-50 rounded-2xl sm:w-40 h-40 overflow-hidden">
                                <img src={item.image || item.images?.[0]?.url} alt={isAr ? item.nameAr : (item.nameEn || item.name)} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                            </Link>

                            <div className="flex flex-col flex-1 justify-between py-1">
                                <div className="flex justify-between items-start gap-4">
                                    <div className="space-y-2">
                                        <Link to={`/product/${item._id}`} className="font-black text-primary hover:text-accent text-2xl line-clamp-1 transition-colors">
                                            {isAr ? item.nameAr : (item.nameEn || item.name)}
                                        </Link>
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-gray-400 text-sm">{t('color')}:</span>
                                                <div
                                                    className="shadow-sm border rounded-lg ring-2 ring-white w-5 h-5"
                                                    style={{ backgroundColor: typeof item.selectedColor === 'string' ? item.selectedColor : item.selectedColor?.hexCode }}
                                                />
                                            </div>
                                            {item.brand && (
                                                <span className="ps-4 border-gray-200 border-s font-bold text-gray-400 text-sm">{item.brand}</span>
                                            )}
                                        </div>
                                    </div>
                                    <span className="font-black text-primary text-2xl whitespace-nowrap">
                                        {(item.price * item.quantity).toFixed(2)} {isAr ? 'ج.م' : 'EGP'}
                                    </span>
                                </div>

                                <div className="flex justify-between items-end mt-8">
                                    <div className="flex items-center bg-gray-50 shadow-inner p-1.5 border border-gray-100 rounded-xl">
                                        <button
                                            onClick={() => updateQuantity(item._id, Math.max(1, item.quantity - 1))}
                                            className="flex justify-center items-center hover:bg-white rounded-lg w-10 h-10 font-black text-gray-400 hover:text-primary text-xl transition-all"
                                        >
                                            -
                                        </button>
                                        <span className="w-12 font-black text-primary text-lg text-center">{item.quantity}</span>
                                        <button
                                            onClick={() => updateQuantity(item._id, Math.min(item.stock || Infinity, item.quantity + 1))}
                                            className="flex justify-center items-center hover:bg-white rounded-lg w-10 h-10 font-black text-gray-400 hover:text-primary text-xl transition-all"
                                        >
                                            +
                                        </button>
                                    </div>

                                    <button
                                        onClick={() => removeFromCart(item._id)}
                                        className="flex items-center gap-2 bg-gray-50 hover:bg-red-50 p-3 rounded-xl font-black text-gray-400 hover:text-red-500 text-sm transition-all"
                                    >
                                        <Trash2 size={18} />
                                        <span className="hidden sm:inline">{t('remove')}</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}

                    <Link to="/shop" className="inline-flex items-center gap-2 mt-4 font-black text-gray-500 hover:text-primary transition-colors">
                        {isAr ? <ArrowRight size={20} /> : <ArrowLeft size={20} />}
                        {isAr ? 'الاستمرار في التسوق' : 'Continue Shopping'}
                    </Link>
                </div>

                {/* Order Summary */}
                <div className="lg:col-span-1">
                    <div className="top-32 sticky bg-white shadow-xl p-8 md:p-10 border border-gray-100 rounded-[2.5rem]">
                        <h2 className="mb-8 pb-6 border-gray-50 border-b font-black text-primary text-2xl">
                            {isAr ? 'ملخص الطلب' : 'Order Summary'}
                        </h2>

                        <div className="space-y-5 mb-8 text-gray-600">
                            <div className="flex justify-between font-bold">
                                <span>{isAr ? 'المجموع الفرعي' : 'Subtotal'}</span>
                                <span className="text-primary">{subtotal.toFixed(2)} {isAr ? 'ج.م' : 'EGP'}</span>
                            </div>
                            <div className="flex justify-between font-black text-green-600">
                                <span>{isAr ? 'تكلفة الشحن' : 'Shipping'}</span>
                                <span>
                                    {cart.every(item => item.freeShipping) || subtotal >= freeShippingThreshold
                                        ? (isAr ? 'مجاني' : 'Free')
                                        : (isAr ? 'تحدد في الدفع' : 'Calculated at checkout')
                                    }
                                </span>
                            </div>

                            <div className="flex gap-3 bg-blue-50 mt-6 p-4 border border-blue-100 rounded-2xl font-bold text-blue-800 text-sm">
                                <Info size={20} className="text-blue-500 shrink-0" />
                                <p>{isAr ? 'تطبق الخصومات عند إتمام الطلب في الصفحة التالية.' : 'Any applicable discounts will be applied at checkout.'}</p>
                            </div>
                        </div>

                        <div className="flex justify-between items-center mb-10 pt-6 border-gray-100 border-t">
                            <span className="font-black text-primary text-xl">{t('total')}</span>
                            <span className="font-black text-primary text-4xl">{total.toFixed(2)} {isAr ? 'ج.م' : 'EGP'}</span>
                        </div>

                        <button
                            onClick={() => {
                                console.log('Navigating from Cart to Checkout');
                                navigate('/checkout');
                            }}
                            className="group flex justify-center items-center gap-3 bg-accent hover:bg-orange-600 shadow-accent/30 shadow-xl hover:shadow-accent/50 py-5 rounded-2xl w-full font-black text-white text-xl active:scale-95 transition-all transform"
                        >
                            {t('checkout')}
                            {isAr ? <ArrowLeft className="transition-transform group-hover:-translate-x-2" /> : <ArrowRight className="transition-transform group-hover:translate-x-2" />}
                        </button>

                        <p className="mt-6 font-bold text-gray-400 text-xs text-center uppercase tracking-widest">
                            Secure Checkout Guaranteed
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;
