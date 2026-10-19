import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { User, Mail, Package, Calendar, Clock, ArrowRight, ArrowLeft, Loader2, ShoppingBag, LogOut, Key } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/axiosInstance';

const Profile = () => {
    const { t } = useTranslation();
    const { currentLanguage } = useLanguage();
    const { user, logout } = useAuth();
    const isAr = currentLanguage === 'ar';

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [passwordForm, setPasswordForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [passwordMessage, setPasswordMessage] = useState('');

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setPasswordMessage('');

        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setPasswordMessage(isAr ? 'كلمتا المرور غير متطابقتين' : 'Passwords do not match');
            return;
        }

        try {
            setPasswordLoading(true);
            await api.put('/auth/profile/password', {
                oldPassword: passwordForm.oldPassword,
                password: passwordForm.newPassword
            });
            setPasswordMessage(isAr ? 'تم تغيير الرقم السري بنجاح' : 'Password changed successfully');
            setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            setPasswordMessage(err.response?.data?.message || (isAr ? 'فشل تغيير الرقم السري' : 'Failed to change password'));
        } finally {
            setPasswordLoading(false);
        }
    };

    useEffect(() => {
        const fetchMyOrders = async () => {
            try {
                setLoading(true);
                const { data } = await api.get('/orders/myorders');
                setOrders(data.data || data);
                setError(null);
            } catch (err) {
                console.error('Error fetching orders:', err);
                setError(isAr ? 'فشل تحميل الطلبات' : 'Failed to load orders');
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchMyOrders();
        }
    }, [user, isAr]);

    if (!user) {
        return (
            <div className="mx-auto px-4 py-20 max-w-7xl text-center">
                <h2 className="mb-4 font-black text-primary text-3xl">{isAr ? 'يرجى تسجيل الدخول' : 'Please Login'}</h2>
            </div>
        );
    }

    return (
        <div className="mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full max-w-7xl text-start">
            <h1 className="mb-10 font-black text-primary text-4xl">
                {isAr ? 'الملف الشخصي' : 'My Profile'}
            </h1>

            <div className="gap-8 grid grid-cols-1 lg:grid-cols-3">
                {/* User Info Card */}
                <div className="lg:col-span-1">
                    <div className="bg-white shadow-sm p-8 border border-gray-100 rounded-[2.5rem]">
                        <div className="flex flex-col items-center text-center">
                            <div className="flex justify-center items-center bg-primary/10 mb-6 rounded-full w-24 h-24 text-primary">
                                <User size={48} />
                            </div>
                            <h2 className="mb-2 font-black text-primary text-2xl">{user.name}</h2>
                            <p className="flex items-center gap-2 mb-6 font-medium text-gray-500">
                                <Mail size={16} />
                                {user.email}
                            </p>
                            <div className="bg-gray-50 px-4 py-2 rounded-full font-bold text-primary text-xs uppercase tracking-widest mb-6">
                                {user.role === 'admin' ? (isAr ? 'مدير النظام' : 'Administrator') : (isAr ? 'عميل' : 'Customer')}
                            </div>
                            <button
                                onClick={logout}
                                className="w-full flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 px-6 py-3 rounded-2xl font-bold text-red-600 transition-all active:scale-95"
                            >
                                <LogOut size={20} />
                                {isAr ? 'تسجيل الخروج' : 'Logout'}
                            </button>
                        </div>
                    </div>

                    {/* Change Password Card */}
                    <div className="bg-white shadow-sm mt-8 p-8 border border-gray-100 rounded-[2.5rem]">
                        <h3 className="flex items-center gap-3 mb-6 pb-4 border-gray-50 border-b font-black text-primary text-xl">
                            <Key className="text-accent" size={20} />
                            {isAr ? 'تغيير الرقم السري' : 'Change Password'}
                        </h3>
                        {passwordMessage && (
                            <div className={`mb-4 p-3 rounded-xl text-sm font-bold text-center ${passwordMessage.includes('نجاح') || passwordMessage.includes('successfully') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                {passwordMessage}
                            </div>
                        )}
                        <form onSubmit={handlePasswordChange} className="space-y-4">
                            <div>
                                <label className="block mb-1 text-xs font-bold text-gray-500 uppercase tracking-widest">{isAr ? 'الرقم السري الحالي' : 'Current Password'}</label>
                                <input required type="password" value={passwordForm.oldPassword} onChange={e => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })} className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-accent" />
                            </div>
                            <div>
                                <label className="block mb-1 text-xs font-bold text-gray-500 uppercase tracking-widest">{isAr ? 'الرقم السري الجديد' : 'New Password'}</label>
                                <input required type="password" minLength="6" value={passwordForm.newPassword} onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-accent" />
                            </div>
                            <div>
                                <label className="block mb-1 text-xs font-bold text-gray-500 uppercase tracking-widest">{isAr ? 'تأكيد الرقم السري' : 'Confirm Password'}</label>
                                <input required type="password" minLength="6" value={passwordForm.confirmPassword} onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-accent" />
                            </div>
                            <button disabled={passwordLoading} type="submit" className="w-full flex items-center justify-center gap-2 bg-accent hover:bg-orange-600 px-6 py-3 rounded-xl font-bold text-white shadow shadow-accent/20 transition-all active:scale-95 disabled:opacity-50">
                                {passwordLoading ? <Loader2 className="animate-spin" size={20} /> : (isAr ? 'تحديث' : 'Update Password')}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Orders History */}
                <div className="lg:col-span-2">
                    <div className="bg-white shadow-sm p-8 border border-gray-100 rounded-[2.5rem]">
                        <h3 className="flex items-center gap-3 mb-8 pb-6 border-gray-50 border-b font-black text-primary text-2xl">
                            <Package className="text-accent" size={24} />
                            {isAr ? 'طلباتي الأخيرة' : 'Order History'}
                        </h3>

                        {loading ? (
                            <div className="flex flex-col justify-center items-center py-12">
                                <Loader2 className="mb-4 w-10 h-10 text-accent animate-spin" />
                                <p className="font-bold text-gray-400">{isAr ? 'جاري تحميل الطلبات...' : 'Loading orders...'}</p>
                            </div>
                        ) : error ? (
                            <div className="bg-red-50 p-6 rounded-2xl text-center text-red-600">
                                {error}
                            </div>
                        ) : orders.length === 0 ? (
                            <div className="py-12 text-center">
                                <div className="flex justify-center items-center bg-gray-50 mx-auto mb-6 rounded-full w-20 h-20 text-gray-300">
                                    <ShoppingBag size={40} />
                                </div>
                                <p className="font-bold text-gray-500">{isAr ? 'ليس لديك أي طلبات بعد' : 'You have no orders yet'}</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {orders.map((order) => (
                                    <Link
                                        key={order._id}
                                        to="/tracking"
                                        state={{ orderNumber: order._id }}
                                        className="block group p-6 border border-gray-100 hover:border-accent rounded-3xl transition-all hover:shadow-lg bg-white"
                                    >
                                        <div className="flex sm:flex-row flex-col justify-between gap-4 mb-4">
                                            <div>
                                                <p className="mb-1 font-black text-gray-400 text-xs uppercase tracking-widest">{isAr ? 'رقم الطلب' : 'ORDER ID'}</p>
                                                <p className="font-mono font-bold text-primary text-sm">#{order._id.substring(0, 8)}...</p>
                                            </div>
                                            <div className="text-sm sm:text-right">
                                                <p className="mb-1 font-black text-gray-400 text-xs uppercase tracking-widest">{isAr ? 'الحالة' : 'STATUS'}</p>
                                                <span className={`inline-block px-3 py-1 rounded-full font-bold text-xs uppercase ${order.status === 'Delivered' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                                                    }`}>
                                                    {order.status}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex sm:flex-row flex-col justify-between items-end gap-4 pt-4 border-gray-50 border-t">
                                            <div className="flex items-center gap-4">
                                                <div className="flex items-center gap-2 font-bold text-gray-500 text-sm">
                                                    <Calendar size={16} />
                                                    {new Date(order.createdAt).toLocaleDateString(isAr ? 'ar-EG' : 'en-US')}
                                                </div>
                                                <div className="flex items-center gap-2 font-bold text-gray-500 text-sm">
                                                    <Clock size={16} />
                                                    {new Date(order.createdAt).toLocaleTimeString(isAr ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                            <p className="font-black text-primary text-2xl">
                                                {order.totalPrice.toFixed(2)} {isAr ? 'ج.م' : 'EGP'}
                                            </p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
