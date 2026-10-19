import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { User, Lock, Mail, ArrowRight, ArrowLeft } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/axiosInstance';

const Login = () => {
    const { t } = useTranslation();
    const { currentLanguage } = useLanguage();
    const { login } = useAuth();
    const navigate = useNavigate();
    const isAr = currentLanguage === 'ar';

    const [formData, setFormData] = useState({ email: '', password: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const { data } = await api.post('/auth/login', formData);
            login(data);
            if (data.role === 'admin' || data.role === 'assistant') {
                navigate('/admin');
            } else if (data.role === 'delivery') {
                navigate('/delivery-portal');
            } else {
                navigate('/');
            }
        } catch (err) {
            setError(err.response?.data?.message || (isAr ? 'بيانات الدخول غير صحيحة' : 'Invalid credentials'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto px-4 py-20 w-full min-h-[70vh] flex flex-col justify-center">
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <User size={32} className="text-primary" />
                    </div>
                    <h1 className="text-3xl font-black text-primary">
                        {isAr ? 'مرحباً بعودتك' : 'Welcome Back'}
                    </h1>
                    <p className="text-gray-500 mt-2">
                        {isAr ? 'قم بتسجيل الدخول لمتابعة التسوق' : 'Sign in to continue shopping'}
                    </p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm text-center font-bold">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            {isAr ? 'البريد الإلكتروني' : 'Email Address'}
                        </label>
                        <div className="relative">
                            <input
                                type="email"
                                name="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 pl-12 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all"
                                dir="ltr"
                            />
                            <Mail className={`absolute top-1/2 -translate-y-1/2 text-gray-400 ${isAr ? 'right-4' : 'left-4'}`} size={20} />
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-sm font-semibold text-gray-700">
                                {isAr ? 'كلمة المرور' : 'Password'}
                            </label>
                            <a href="#" className="text-sm font-semibold text-accent hover:text-primary transition-colors">
                                {isAr ? 'نسيت كلمة المرور؟' : 'Forgot Password?'}
                            </a>
                        </div>
                        <div className="relative">
                            <input
                                type="password"
                                name="password"
                                required
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 pl-12 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all"
                                dir="ltr"
                            />
                            <Lock className={`absolute top-1/2 -translate-y-1/2 text-gray-400 ${isAr ? 'right-4' : 'left-4'}`} size={20} />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-primary hover:bg-yellow-600 text-white font-bold py-4 rounded-xl transition-all shadow-md hover:shadow-lg flex justify-center items-center gap-2 transform active:scale-95"
                    >
                        {isLoading ? (
                            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <>
                                {t('login')}
                                {isAr ? <ArrowLeft size={18} /> : <ArrowRight size={18} />}
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-8 text-center border-t border-gray-100 pt-6">
                    <p className="text-gray-600">
                        {isAr ? 'ليس لديك حساب؟ ' : 'Don\'t have an account? '}
                        <Link to="/register" className="font-bold text-primary hover:text-accent transition-colors">
                            {isAr ? 'سجل الآن' : 'Sign Up'}
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
