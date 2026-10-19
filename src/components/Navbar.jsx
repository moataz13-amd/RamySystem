import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ShoppingCart, User, Search, Menu, X, Globe, Settings, LogOut } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/icon_1.svg';


const Navbar = () => {
    const { t } = useTranslation();
    const { currentLanguage, changeLanguage } = useLanguage();
    const { user, logout } = useAuth();
    const { cart } = useCart();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { name: t('home'), path: '/' },
        { name: t('shop'), path: '/shop' },
        { name: t('tracking'), path: '/tracking' },
    ];

    const handleLogout = () => {
        logout();
        setIsMenuOpen(false);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/shop?search=${encodeURIComponent(searchQuery)}`);
            setSearchQuery('');
        }
    };

    return (
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'py-3' : 'py-6'}`}>
            <div className="mx-auto px-2 sm:px-4 lg:px-6 max-w-screen-2xl">
                <div className={`relative flex items-center justify-between bg-white/80 backdrop-blur-xl border border-white/20 shadow-lg rounded-[2.5rem] px-4 py-2.5 transition-all duration-500 ${scrolled ? 'shadow-xl' : ''}`}>

                    {/* Logo */}
                    <Link to="/" className="group flex items-center gap-2">
                        <img src={logo} alt="Logo" className="w-12 h-12 object-contain" />
                        <span className="font-bold text-primary text-xl uppercase tracking-wider">رامي المغربي للبصريات</span>
                    </Link>

                    {/* Desktop Search */}
                    <div className="hidden md:flex flex-1 mx-4 max-w-sm">
                        <form onSubmit={handleSearch} className="relative w-full">
                            <input
                                type="text"
                                placeholder={t('search')}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="bg-gray-100 px-4 py-2 pr-10 pl-10 rounded-full focus:outline-none focus:ring-2 focus:ring-accent w-full transition-all"
                                dir={currentLanguage === 'ar' ? 'rtl' : 'ltr'}
                            />
                            <button
                                type="submit"
                                className={`absolute top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary ${currentLanguage === 'ar' ? 'left-3' : 'right-3'}`}
                            >
                                <Search size={18} />
                            </button>
                        </form>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-2">
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className="hover:bg-gray-50 px-4 py-2 rounded-2xl font-bold text-gray-600 hover:text-primary text-sm transition-all whitespace-nowrap"
                            >
                                {link.name}
                            </Link>
                        ))}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => changeLanguage(currentLanguage === 'en' ? 'ar' : 'en')}
                            className="flex items-center gap-1 px-2 py-2 text-gray-600 hover:text-primary transition-colors flex-shrink-0"
                        >
                            <Globe size={17} />
                            <span className="font-bold text-sm">{currentLanguage === 'en' ? 'عربى' : 'EN'}</span>
                        </button>

                        <Link to="/cart" className="group relative hover:bg-gray-50 p-2 rounded-2xl text-gray-600 hover:text-primary transition-all flex-shrink-0">
                            <ShoppingCart size={20} />
                            {cart.length > 0 && (
                                <span className="-top-1 -right-1 absolute flex justify-center items-center bg-accent rounded-full w-4 h-4 text-white text-[10px] font-bold">
                                    {cart.length}
                                </span>
                            )}
                        </Link>

                        {user ? (
                            <div className="hidden md:flex items-center gap-1">
                                <Link to="/profile" className="hover:bg-gray-50 p-2 rounded-2xl text-gray-600 hover:text-primary transition-all">
                                    <User size={20} />
                                </Link>
                                {['admin', 'assistant'].includes(user.role) && (
                                    <Link to="/admin" className="hover:bg-gray-50 p-2 rounded-2xl text-gray-600 hover:text-primary transition-all">
                                        <Settings size={20} />
                                    </Link>
                                )}
                            </div>
                        ) : (
                            <Link to="/login" className="hidden md:flex items-center gap-2 bg-primary hover:bg-secondary shadow-lg shadow-primary/20 px-4 py-2 rounded-2xl font-black text-white text-sm active:scale-95 transition-all whitespace-nowrap">
                                <User size={16} />
                                {currentLanguage === 'en' ? 'Login' : 'دخول'}
                            </Link>
                        )}

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="md:hidden hover:bg-gray-50 p-2 rounded-2xl text-gray-600 hover:text-primary transition-all flex-shrink-0"
                        >
                            {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <div className={`md:hidden fixed inset-0 z-40 bg-white/95 backdrop-blur-2xl transition-all duration-500 transform ${isMenuOpen ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}>
                <div className="flex flex-col px-8 pt-32 h-full">
                    <div className="flex flex-col gap-4">
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                onClick={() => setIsMenuOpen(false)}
                                className="font-black text-primary hover:text-accent text-3xl transition-colors"
                            >
                                {link.name}
                            </Link>
                        ))}
                        <div className="bg-gray-100 my-4 h-px" />
                        {user ? (
                            <>
                                <Link
                                    to="/profile"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="flex items-center gap-3 font-bold text-gray-600 text-2xl"
                                >
                                    <User size={24} /> {currentLanguage === 'ar' ? 'الملف الشخصي' : 'Profile'}
                                </Link>
                                {['admin', 'assistant'].includes(user.role) && (
                                    <Link
                                        to="/admin"
                                        onClick={() => setIsMenuOpen(false)}
                                        className="flex items-center gap-3 font-bold text-gray-600 text-2xl"
                                    >
                                        <Settings size={24} /> {currentLanguage === 'ar' ? 'لوحة التحكم' : 'Dashboard'}
                                    </Link>
                                )}
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-3 mt-4 font-bold text-red-600 text-2xl"
                                >
                                    <LogOut size={24} /> {currentLanguage === 'ar' ? 'تسجيل الخروج' : 'Logout'}
                                </button>
                            </>
                        ) : (
                            <Link
                                to="/login"
                                onClick={() => setIsMenuOpen(false)}
                                className="bg-primary shadow-xl p-6 rounded-[2rem] font-black text-white text-xl text-center"
                            >
                                {currentLanguage === 'ar' ? 'تسجيل الدخول' : 'Login'}
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
