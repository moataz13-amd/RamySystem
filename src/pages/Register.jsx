import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { UserPlus, User, Lock, Mail, ArrowRight, ArrowLeft } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import api from '../services/axiosInstance';

const Register = () => {
    const { t } = useTranslation();
    const { currentLanguage } = useLanguage();
    const navigate = useNavigate();
    const isAr = currentLanguage === 'ar';

    const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError(isAr ? 'كلمات المرور غير متطابقة' : 'Passwords do not match');
            setIsLoading(false);
            return;
        }

        try {
            const { data } = await api.post('/auth/register', {
                name: formData.name,
                email: formData.email,
                password: formData.password
            });
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.message || (isAr ? 'حدث خطأ أثناء التسجيل' : 'Registration failed'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto px-4 py-20 w-full min-h-[70vh] flex flex-col justify-center">
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <UserPlus size={32} className="text-accent" />
                    </div>
                    <h1 className="text-3xl font-black text-primary">
                        {isAr ? 'إنشاء حساب جديد' : 'Create Account'}
                    </h1>
                    <p className="text-gray-500 mt-2">
                        {isAr ? 'انضم إلينا واستمتع بتسوق النظارات الفاخرة' : 'Join us and shop luxury eyewear'}
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
                            {isAr ? 'الاسم بالكامل' : 'Full Name'}
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                name="name"
                                required
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 pl-12 focus:outline-none focus:ring-2 focus:ring-accent focus:bg-white transition-all"
                            />
                            <User className={`absolute top-1/2 -translate-y-1/2 text-gray-400 ${isAr ? 'right-4' : 'left-4'}`} size={20} />
                        </div>
                    </div>

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
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 pl-12 focus:outline-none focus:ring-2 focus:ring-accent focus:bg-white transition-all"
                                dir="ltr"
                            />
                            <Mail className={`absolute top-1/2 -translate-y-1/2 text-gray-400 ${isAr ? 'right-4' : 'left-4'}`} size={20} />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            {isAr ? 'كلمة المرور' : 'Password'}
                        </label>
                        <div className="relative">
                            <input
                                type="password"
                                name="password"
                                required
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 pl-12 focus:outline-none focus:ring-2 focus:ring-accent focus:bg-white transition-all"
                                dir="ltr"
                            />
                            <Lock className={`absolute top-1/2 -translate-y-1/2 text-gray-400 ${isAr ? 'right-4' : 'left-4'}`} size={20} />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            {isAr ? 'تأكيد كلمة المرور' : 'Confirm Password'}
                        </label>
                        <div className="relative">
                            <input
                                type="password"
                                name="confirmPassword"
                                required
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 pl-12 focus:outline-none focus:ring-2 focus:ring-accent focus:bg-white transition-all"
                                dir="ltr"
                            />
                            <Lock className={`absolute top-1/2 -translate-y-1/2 text-gray-400 ${isAr ? 'right-4' : 'left-4'}`} size={20} />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-accent hover:bg-yellow-600 text-white font-bold py-4 rounded-xl transition-all shadow-md hover:shadow-lg flex justify-center items-center gap-2 transform active:scale-95"
                    >
                        {isLoading ? (
                            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <>
                                {isAr ? 'إنشاء حساب' : 'Start Shopping'}
                                {isAr ? <ArrowLeft size={18} /> : <ArrowRight size={18} />}
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-8 text-center border-t border-gray-100 pt-6">
                    <p className="text-gray-600">
                        {isAr ? 'لديك حساب بالفعل؟ ' : 'Already have an account? '}
                        <Link to="/login" className="font-bold text-accent hover:text-primary transition-colors">
                            {t('login')}
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
