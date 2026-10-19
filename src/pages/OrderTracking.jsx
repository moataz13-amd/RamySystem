import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MapPin, Search, Package, Clock, CheckCircle2, Truck, Home, ArrowRight, ArrowLeft, Calendar, Info } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import api from '../services/axiosInstance';
import { showError } from '../utils/swal';

const timelineSteps = [
    { id: 1, label: 'Order Placed', labelAr: 'تم تقديم الطلب', icon: Package },
    { id: 2, label: 'Confirmed', labelAr: 'تم التأكيد', icon: CheckCircle2 },
    { id: 3, label: 'Preparing', labelAr: 'جاري التجهيز', icon: Clock },
    { id: 4, label: 'Shipped', labelAr: 'تم الشحن', icon: Truck },
    { id: 5, label: 'Out for Delivery', labelAr: 'في الطريق', icon: MapPin },
    { id: 6, label: 'Delivered', labelAr: 'تم التسليم', icon: Home },
];

const OrderTracking = () => {
    const { t } = useTranslation();
    const { currentLanguage } = useLanguage();
    const isAr = currentLanguage === 'ar';
    const location = useLocation();

    const [searchMethod, setSearchMethod] = useState('orderNumber');
    const [searchValue, setSearchValue] = useState(location.state?.orderNumber || '');
    const [trackingData, setTrackingData] = useState(null);
    const [isSearching, setIsSearching] = useState(false);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchValue.trim()) return;

        setIsSearching(true);
        try {
            const endpoint = searchMethod === 'orderNumber'
                ? `/orders/${searchValue}`
                : `/orders/phone/${searchValue}`;

            const { data } = await api.get(endpoint);
            const order = data.data || data;

            // Map backend status to timeline index (1-6)
            const statusMap = {
                'Pending': 1,
                'Processing': 3,
                'Shipped': 4,
                'Out for Delivery': 5,
                'Delivered': 6,
                'Cancelled': 0
            };

            setTrackingData({
                orderNumber: order._id,
                status: statusMap[order.status] || 1,
                date: new Date(order.createdAt).toLocaleDateString(isAr ? 'ar-EG' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
                estimatedDelivery: order.estimatedDelivery
                    ? new Date(order.estimatedDelivery).toLocaleDateString(isAr ? 'ar-EG' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                    : (isAr ? 'سيتم التحديد قريباً' : 'To be determined'),
                customer: order.user?.name || (isAr ? 'عميل' : 'Customer'),
                items: order.orderItems?.length || 0,
                fullStatus: order.status
            });
        } catch (err) {
            console.error('Tracking error:', err);
            showError(isAr ? 'لم يتم العثور على الطلب. يرجى التأكد من البيانات.' : 'Order not found. Please check your details.');
            setTrackingData(null);
        } finally {
            setIsSearching(false);
        }
    };

    return (
        <div className="mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full max-w-5xl text-start">
            <div className="mb-16 text-center">
                <div className="inline-flex justify-center items-center bg-accent/10 mb-6 p-4 rounded-3xl">
                    <MapPin className="text-accent" size={48} />
                </div>
                <h1 className="mb-4 font-black text-primary text-5xl tracking-tight">
                    {t('order_tracking_title')}
                </h1>
                <p className="mx-auto max-w-lg font-medium text-gray-500 text-xl leading-relaxed">
                    {isAr ? 'تابع مسار طلبك واعرف موعد التوصيل المتوقع بكل سهولة.' : 'Stay updated on your order status and estimated delivery time with ease.'}
                </p>
            </div>

            <div className="bg-white shadow-xl mb-16 p-8 md:p-12 border border-gray-100 rounded-[2.5rem]">
                <div className="flex flex-wrap justify-center gap-4 bg-gray-50 mb-10 p-2 border border-gray-100 rounded-2xl">
                    <button
                        onClick={() => { setSearchMethod('orderNumber'); setTrackingData(null); }}
                        className={`flex-1 min-w-[150px] font-black py-4 px-6 rounded-xl transition-all ${searchMethod === 'orderNumber'
                            ? 'bg-primary text-white shadow-lg'
                            : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'
                            }`}
                    >
                        {isAr ? 'برقم الطلب' : 'Order Number'}
                    </button>
                    <button
                        onClick={() => { setSearchMethod('phone'); setTrackingData(null); }}
                        className={`flex-1 min-w-[150px] font-black py-4 px-6 rounded-xl transition-all ${searchMethod === 'phone'
                            ? 'bg-primary text-white shadow-lg'
                            : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'
                            }`}
                    >
                        {isAr ? 'برقم الهاتف' : 'Phone Number'}
                    </button>
                </div>

                <form onSubmit={handleSearch} className="relative mx-auto max-w-2xl">
                    <div className="group relative">
                        <input
                            type={searchMethod === 'phone' ? 'tel' : 'text'}
                            placeholder={
                                searchMethod === 'phone'
                                    ? (isAr ? 'أدخل رقم الهاتف المسجل...' : 'Enter your phone number...')
                                    : (isAr ? 'أدخل رقم الطلب (مثال: 64a5b67c8d9e0f1a...)' : 'Enter order number (e.g., 64a5b67c8d9e0f1a...)')
                            }
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                            className="bg-gray-50 focus:bg-white shadow-inner px-8 py-5 pr-16 pl-16 border border-gray-200 focus:border-accent rounded-[1.5rem] focus:outline-none focus:ring-4 focus:ring-accent/10 w-full font-bold text-xl transition-all"
                            dir={searchMethod === 'phone' && isAr ? 'ltr' : (isAr ? 'rtl' : 'ltr')}
                        />
                        <Search className={`absolute top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-accent transition-colors ${isAr ? 'right-6' : 'left-6'}`} size={24} />
                        <button
                            type="submit"
                            disabled={isSearching}
                            className={`absolute top-1/2 -translate-y-1/2 bg-accent hover:bg-orange-600 text-white rounded-xl px-8 py-3 font-black transition-all shadow-lg shadow-accent/20 transform active:scale-95 flex items-center gap-2 ${isAr ? 'left-3' : 'right-3'
                                }`}
                        >
                            {isSearching ? (
                                <div className="border-4 border-white/30 border-t-white rounded-full w-6 h-6 animate-spin" />
                            ) : (
                                < >
                                    {isAr ? 'تتبع' : 'Track'}
                                    {isAr ? <ArrowLeft size={20} /> : <ArrowRight size={20} />}
                                </ >
                            )}
                        </button>
                    </div>
                </form>
            </div>

            {trackingData && (
                <div className="slide-in-from-bottom-10 animate-in duration-700 fade-in">
                    <div className="bg-white shadow-2xl border border-gray-100 rounded-[3rem] overflow-hidden">
                        <div className="bg-primary p-10 text-white">
                            <div className="flex md:flex-row flex-col justify-between items-start md:items-center gap-8">
                                <div>
                                    <div className="flex items-center gap-3 opacity-70 mb-2">
                                        <Package size={20} />
                                        <span className="font-black text-sm uppercase tracking-widest">{isAr ? 'معلومات الطلب' : 'ORDER INFO'}</span>
                                    </div>
                                    <h2 className="font-mono font-black text-4xl tracking-tighter">
                                        {trackingData.orderNumber}
                                    </h2>
                                </div>
                                <div className="flex gap-8">
                                    <div className="text-center md:text-start">
                                        <div className="flex items-center gap-3 opacity-70 mb-2">
                                            <Calendar size={20} />
                                            <span className="font-black text-sm uppercase tracking-widest">{isAr ? 'تاريخ الطلب' : 'ORDER DATE'}</span>
                                        </div>
                                        <p className="font-bold text-xl">{trackingData.date}</p>
                                    </div>
                                    <div className="text-center md:text-start">
                                        <div className="flex items-center gap-3 opacity-70 mb-2">
                                            <Truck size={20} />
                                            <span className="font-black text-sm uppercase tracking-widest">{isAr ? 'التوصيل المتوقع' : 'ESTIMATED'}</span>
                                        </div>
                                        <p className="font-bold text-accent text-xl">{trackingData.estimatedDelivery}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 md:p-16">
                            {/* Summary Cards */}
                            <div className="gap-6 grid grid-cols-1 md:grid-cols-3 mb-16">
                                <div className="bg-gray-50 p-6 border border-gray-100 rounded-3xl">
                                    <p className="mb-2 font-black text-gray-400 text-xs uppercase tracking-widest">{isAr ? 'العميل' : 'CUSTOMER'}</p>
                                    <p className="font-black text-primary text-lg">{trackingData.customer}</p>
                                </div>
                                <div className="bg-gray-50 p-6 border border-gray-100 rounded-3xl">
                                    <p className="mb-2 font-black text-gray-400 text-xs uppercase tracking-widest">{isAr ? 'عدد المنتجات' : 'ITEMS'}</p>
                                    <p className="font-black text-primary text-lg">{trackingData.items} {isAr ? 'منتجات' : 'Items'}</p>
                                </div>
                                <div className="bg-gray-50 p-6 border border-gray-100 rounded-3xl">
                                    <p className="mb-2 font-black text-gray-400 text-xs uppercase tracking-widest">{isAr ? 'حالة الدفع' : 'PAYMENT'}</p>
                                    <p className="font-black text-green-600 text-lg">{isAr ? 'عند الاستلام' : 'Cash on Delivery'}</p>
                                </div>
                            </div>

                            {/* Timeline Visualization */}
                            <div className="relative py-10">
                                {/* Horizontal Desktop Timeline */}
                                <div className="hidden lg:block">
                                    <div className="top-[50px] left-0 absolute bg-gray-100 rounded-full w-full h-2">
                                        <div
                                            className="top-0 absolute bg-accent shadow-[0_0_15px_rgba(230,126,34,0.5)] rounded-full h-full transition-all duration-1000 ease-out"
                                            style={{
                                                width: `${((trackingData.status - 1) / (timelineSteps.length - 1)) * 100}%`,
                                                [isAr ? 'right' : 'left']: 0
                                            }}
                                        />
                                    </div>

                                    <div className="relative flex justify-between">
                                        {timelineSteps.map((step, index) => {
                                            const Icon = step.icon;
                                            const isCompleted = index + 1 <= trackingData.status;
                                            const isCurrent = index + 1 === trackingData.status;

                                            return (
                                                <div key={step.id} className="group flex flex-col items-center">
                                                    <div
                                                        className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-6 transition-all duration-700 z-10 border-4 border-white shadow-xl
                                    ${isCompleted ? 'bg-accent text-white scale-110' : 'bg-white text-gray-300'}`}
                                                    >
                                                        <Icon size={32} className={isCurrent ? 'animate-pulse' : ''} />
                                                    </div>
                                                    <div className="max-w-[120px] text-center">
                                                        <span
                                                            className={`block text-sm font-black transition-colors ${isCurrent ? 'text-accent' : (isCompleted ? 'text-primary' : 'text-gray-400')}`}
                                                        >
                                                            {isAr ? step.labelAr : step.label}
                                                        </span>
                                                        {isCurrent && (
                                                            <span className="inline-block bg-accent/5 mt-2 px-2 py-0.5 rounded-full font-black text-[10px] text-accent/60 uppercase tracking-tighter">
                                                                {isAr ? 'الحالة الحالية' : 'Current Status'}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Vertical Mobile/Tablet Timeline */}
                                <div className="lg:hidden relative space-y-12 pr-10 pl-10">
                                    <div className={`absolute top-0 bottom-0 w-1.5 bg-gray-100 transition-all rounded-full ${isAr ? 'right-14' : 'left-14'}`} />
                                    <div
                                        className={`absolute top-0 w-1.5 bg-accent transition-all duration-1000 rounded-full shadow-[0_0_10px_rgba(230,126,34,0.3)] ${isAr ? 'right-14' : 'left-14'}`}
                                        style={{ height: `${((trackingData.status - 1) / (timelineSteps.length - 1)) * 100}%` }}
                                    />

                                    {timelineSteps.map((step, index) => {
                                        const Icon = step.icon;
                                        const isCompleted = index + 1 <= trackingData.status;
                                        const isCurrent = index + 1 === trackingData.status;

                                        return (
                                            <div key={step.id} className="relative flex items-center gap-8">
                                                <div
                                                    className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-700 z-10 border-4 border-white shadow-lg shrink-0
                                    ${isCompleted ? 'bg-accent text-white scale-110' : 'bg-white text-gray-300'}`}
                                                >
                                                    <Icon size={24} />
                                                </div>
                                                <div className="flex-grow">
                                                    <h4 className={`text-xl font-black ${isCurrent ? 'text-accent' : (isCompleted ? 'text-primary' : 'text-gray-400')}`}>
                                                        {isAr ? step.labelAr : step.label}
                                                    </h4>
                                                    {isCurrent && (
                                                        <div className="bg-accent/5 mt-2 p-4 border border-accent/10 rounded-2xl">
                                                            <p className="flex items-center gap-2 font-bold text-gray-600 text-sm">
                                                                <Info size={16} className="text-accent" />
                                                                {isAr ? `تحديث في ${trackingData.date}` : `Last updated on ${trackingData.date}`}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderTracking;
