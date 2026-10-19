import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Truck, MapPin, CheckCircle, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/axiosInstance';
import { showError } from '../utils/swal';

const DeliveryPortal = () => {
    const { t } = useTranslation();
    const { currentLanguage } = useLanguage();
    const { user } = useAuth();
    const isAr = currentLanguage === 'ar';
    const navigate = useNavigate();

    const [orders, setOrders] = useState([]);

    useEffect(() => {
        if (!user || user.role !== 'delivery') {
            navigate('/login');
            return;
        }
        fetchOrders();
    }, [user, navigate]);

    const fetchOrders = async () => {
        try {
            const { data } = await api.get('/orders/delivery');
            setOrders(data.data || []);
        } catch (error) {
            console.error(error);
        }
    };

    const updateStatus = async (orderId, newStatus) => {
        try {
            await api.put(`/orders/${orderId}/status`, { status: newStatus });
            fetchOrders();
        } catch (error) {
            console.error('Failed to update status', error);
            showError(isAr ? 'فشل تحديث الحالة' : 'Failed to update status');
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full min-h-screen">
            <div className="flex justify-between items-center mb-10 pb-6 border-b border-gray-100">
                <div>
                    <h1 className="text-3xl font-bold text-accent mb-2 flex items-center gap-3">
                        <Truck size={32} />
                        {isAr ? 'بوابة الشحن' : 'Delivery Portal'}
                    </h1>
                    <p className="text-gray-500 font-bold">
                        {isAr ? `مرحباً بك يا ${user?.name}` : `Welcome back, ${user?.name}`}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {orders.length === 0 ? (
                    <div className="col-span-full text-center py-20 text-gray-400">
                        <Package size={48} className="mx-auto mb-4 text-gray-300" />
                        <p className="text-xl font-bold">{isAr ? 'لا توجد طلبات معينة لك حالياً' : 'No orders assigned to you right now'}</p>
                    </div>
                ) : (
                    orders.map(order => (
                        <div key={order._id} className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-start mb-4">
                                    <span className="bg-blue-100 text-blue-700 font-bold px-3 py-1 rounded-full text-sm">#{order._id.substring(0, 8)}</span>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${order.status === 'Delivered' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                        {order.status}
                                    </span>
                                </div>

                                <h3 className="font-black text-xl mb-2">{order.shippingAddress?.city}</h3>
                                <p className="text-gray-500 text-sm mb-4 flex items-start gap-2">
                                    <MapPin size={16} className="mt-0.5 text-accent" />
                                    {order.shippingAddress?.address}
                                </p>
                                <div className="bg-gray-50 p-4 rounded-xl mb-4 text-sm font-medium">
                                    <p><span className="text-gray-400">{isAr ? 'رقم الهاتف:' : 'Phone:'}</span> {order.shippingAddress?.phone}</p>
                                    <p className="mt-1"><span className="text-gray-400">{isAr ? 'طريقة الدفع:' : 'Payment:'}</span> {order.paymentMethod}</p>
                                    <p className="mt-1 font-bold text-primary text-lg mt-2">${order.totalPrice.toFixed(2)}</p>
                                </div>
                            </div>

                            {order.status !== 'Delivered' && (
                                <div className="grid grid-cols-2 gap-2 mt-4">
                                    {order.status !== 'Out for Delivery' && (
                                        <button
                                            onClick={() => updateStatus(order._id, 'Out for Delivery')}
                                            className="bg-accent hover:bg-yellow-600 text-white font-bold py-3 rounded-xl transition-all w-full text-sm"
                                        >
                                            {isAr ? 'في طريق التوصيل' : 'Out for Delivery'}
                                        </button>
                                    )}

                                    <button
                                        onClick={() => updateStatus(order._id, 'Delivered')}
                                        className="col-span-2 bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-xl transition-all w-full text-sm flex items-center justify-center gap-2"
                                    >
                                        <CheckCircle size={18} />
                                        {isAr ? 'تأكيد التسليم' : 'Confirm Delivery'}
                                    </button>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default DeliveryPortal;
