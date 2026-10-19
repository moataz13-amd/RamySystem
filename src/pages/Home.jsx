import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowLeft, ShieldCheck, Truck, Clock, Star, Loader2, Sparkles } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import ProductCard from '../components/ProductCard';
import { productAPI } from '../utils/api';
import api from '../services/axiosInstance';

const Home = () => {
    const { t } = useTranslation();
    const { currentLanguage } = useLanguage();
    const isAr = currentLanguage === 'ar';

    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState([]);
    const [newestProducts, setNewestProducts] = useState([]);
    const [bestSellers, setBestSellers] = useState([]);
    const [featured, setFeatured] = useState([]);

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [catsRes, allRes] = await Promise.all([
                    api.get('/categories').catch(() => ({ data: { data: [] } })),
                    productAPI.getAll(),
                ]);
                const cats = catsRes.data?.data || [];
                const all = allRes.data?.data || allRes.data || [];

                setCategories(cats);

                // Newest 3 — sorted by createdAt desc
                const sorted = [...all].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                setNewestProducts(sorted.slice(0, 3));

                // Featured — manually marked
                setFeatured(all.filter(p => p.featured).slice(0, 4));

                // Best sellers — manual first, then by ratings count as proxy
                const manual = all.filter(p => p.bestSeller);
                if (manual.length >= 4) {
                    setBestSellers(manual.slice(0, 4));
                } else {
                    const byRatings = [...all].sort((a, b) => (b.ratings?.count || 0) - (a.ratings?.count || 0));
                    const manualIds = new Set(manual.map(p => p._id));
                    const combined = [...manual, ...byRatings.filter(p => !manualIds.has(p._id))].slice(0, 4);
                    setBestSellers(combined);
                }
            } catch (err) {
                console.error('Home fetch error:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center min-h-[60vh]">
                <Loader2 className="mb-4 w-12 h-12 text-accent animate-spin" />
                <p className="font-bold text-gray-500">{isAr ? 'جاري التحميل...' : 'Loading...'}</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-20 pb-20">
            {/* Hero Section */}
            <section className="relative flex items-center bg-secondary h-[85vh] overflow-hidden">
                <div className="z-0 absolute inset-0">
                    <img
                        src="https://images.unsplash.com/photo-1577803645773-f96470509666?auto=format&fit=crop&q=80&w=1920"
                        alt="Premium Eyewear"
                        className="opacity-60 w-full h-full object-cover scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-secondary/80 to-transparent" />
                </div>

                <div className="z-10 relative mx-auto px-4 sm:px-6 lg:px-8 w-full max-w-7xl">
                    <div className="max-w-2xl text-start">
                        <span className="inline-block bg-accent/20 mb-6 px-3 py-1 rounded-full font-bold text-accent text-sm uppercase tracking-wider">
                            {isAr ? 'تشكيلة 2024 الجديدة' : 'New 2024 Collection'}
                        </span>
                        <h1 className="mb-6 font-black text-white text-5xl md:text-7xl leading-[1.1]">
                            {t('hero_title')}
                        </h1>
                        <p className="mb-10 max-w-lg text-gray-200 text-xl leading-relaxed">
                            {t('hero_subtitle')}
                        </p>
                        <div className="flex flex-wrap gap-5">
                            <Link to="/shop" className="group flex items-center gap-3 bg-accent hover:bg-orange-600 shadow-accent/30 shadow-lg px-10 py-4 rounded-xl font-bold text-white text-lg transition-all duration-300">
                                {t('shop_now')}
                                {isAr ? <ArrowLeft size={22} className="transition-transform group-hover:-translate-x-1" /> : <ArrowRight size={22} className="transition-transform group-hover:translate-x-1" />}
                            </Link>
                            <Link to="/tracking" className="bg-white/10 hover:bg-white/20 backdrop-blur-md px-10 py-4 border border-white/30 rounded-xl font-bold text-white text-lg transition-all duration-300">
                                {t('trackOrder')}
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="gap-10 grid grid-cols-1 md:grid-cols-3 mx-auto px-4 sm:px-6 lg:px-8 w-full max-w-7xl">
                <div className="group flex items-start gap-5 bg-white shadow-sm hover:shadow-xl p-8 border border-gray-100 rounded-3xl transition-all">
                    <div className="flex justify-center items-center bg-accent/10 group-hover:bg-accent rounded-2xl w-14 h-14 text-accent group-hover:text-white transition-colors shrink-0">
                        <Truck size={28} />
                    </div>
                    <div>
                        <h3 className="mb-2 font-bold text-primary text-xl">{isAr ? 'توصيل سريع' : 'Fast Delivery'}</h3>
                        <p className="text-gray-500 leading-relaxed">{isAr ? 'توصيل خلال 48 ساعة لجميع أنحاء المملكة' : 'Delivery within 48 hours to all regions'}</p>
                    </div>
                </div>
                <div className="group flex items-start gap-5 bg-white shadow-sm hover:shadow-xl p-8 border border-gray-100 rounded-3xl transition-all">
                    <div className="flex justify-center items-center bg-accent/10 group-hover:bg-accent rounded-2xl w-14 h-14 text-accent group-hover:text-white transition-colors shrink-0">
                        <ShieldCheck size={28} />
                    </div>
                    <div>
                        <h3 className="mb-2 font-bold text-primary text-xl">{isAr ? 'ضمان الجودة' : 'Quality Guarantee'}</h3>
                        <p className="text-gray-500 leading-relaxed">{isAr ? 'جميع منتجاتنا أصلية 100% مع ضمان لمدة عام' : 'All products are 100% original with 1-year warranty'}</p>
                    </div>
                </div>
                <div className="group flex items-start gap-5 bg-white shadow-sm hover:shadow-xl p-8 border border-gray-100 rounded-3xl transition-all">
                    <div className="flex justify-center items-center bg-accent/10 group-hover:bg-accent rounded-2xl w-14 h-14 text-accent group-hover:text-white transition-colors shrink-0">
                        <Clock size={28} />
                    </div>
                    <div>
                        <h3 className="mb-2 font-bold text-primary text-xl">{isAr ? 'دعم 24/7' : '24/7 Support'}</h3>
                        <p className="text-gray-500 leading-relaxed">{isAr ? 'فريق خدمة العملاء جاهز لمساعدتك دائماً' : 'Customer service team is always ready to help'}</p>
                    </div>
                </div>
            </section>

            {/* Categories Grid */}
            {categories.length > 0 && (
                <section className="mx-auto px-4 sm:px-6 lg:px-8 w-full max-w-7xl text-start">
                    <div className="mb-12">
                        <h2 className="mb-4 font-black text-primary text-4xl">{t('categories')}</h2>
                        <div className="bg-accent rounded-full w-20 h-1.5" />
                    </div>
                    <div className="gap-4 sm:gap-8 grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4">
                        {categories.map((cat) => (
                            <Link to={`/shop?category=${cat._id}`} key={cat._id} className="group block relative shadow-lg rounded-2xl h-[200px] sm:h-[320px] lg:h-[420px] overflow-hidden">
                                {cat.image ? (
                                    <img src={cat.image} alt={cat.nameEn} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                                ) : (
                                    <div className="absolute inset-0 bg-gradient-to-br from-primary to-secondary" />
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-secondary via-secondary/20 to-transparent opacity-80" />
                                <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-8 text-white">
                                    <h3 className="mb-1 font-black group-hover:text-accent text-lg sm:text-3xl transition-colors">
                                        {isAr ? cat.nameAr : cat.nameEn}
                                    </h3>
                                    <p className="opacity-0 group-hover:opacity-100 font-medium text-gray-300 transition-all translate-y-4 group-hover:translate-y-0 duration-500 transform">
                                        {isAr ? 'اكتشف المزيد' : 'Explore Collection'}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {/* Newest Products — last 3 added */}
            {newestProducts.length > 0 && (
                <section className="mx-auto px-4 sm:px-6 lg:px-8 w-full max-w-7xl text-start">
                    <div className="flex md:flex-row flex-col justify-between items-start md:items-end gap-6 mb-12">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <Sparkles size={22} className="text-accent" />
                                <span className="font-bold text-accent text-sm uppercase tracking-widest">{isAr ? 'وصل حديثاً' : 'Just Arrived'}</span>
                            </div>
                            <h2 className="font-black text-primary text-4xl">{isAr ? 'أحدث الإضافات' : 'New Arrivals'}</h2>
                            <p className="mt-2 font-medium text-gray-500">{isAr ? 'آخر المنتجات التي تم إضافتها للمتجر' : 'The latest 3 products added to our store'}</p>
                        </div>
                        <Link to="/shop" className="flex items-center gap-2 bg-white hover:bg-primary px-8 py-3 border-2 border-primary rounded-xl font-bold text-primary hover:text-white transition-all">
                            {isAr ? 'عرض كل المنتجات' : 'View All'}
                            {isAr ? <ArrowLeft size={18} /> : <ArrowRight size={18} />}
                        </Link>
                    </div>
                    <div className="gap-4 sm:gap-10 grid grid-cols-2 sm:grid-cols-3">
                        {newestProducts.map(product => (
                            <ProductCard key={product._id} product={product} />
                        ))}
                    </div>
                </section>
            )}

            {/* Featured Products */}
            {featured.length > 0 && (
                <section className="mx-auto px-4 sm:px-6 lg:px-8 w-full max-w-7xl text-start">
                    <div className="flex md:flex-row flex-col justify-between items-start md:items-end gap-6 mb-12">
                        <div>
                            <h2 className="font-black text-primary text-4xl">{t('featured_products')}</h2>
                            <p className="mt-2 font-medium text-gray-500">{isAr ? 'اخترنا لك الأفضل من مجموعتنا' : 'Handpicked styles from our collection'}</p>
                        </div>
                        <Link to="/shop" className="flex items-center gap-2 bg-white hover:bg-primary px-8 py-3 border-2 border-primary rounded-xl font-bold text-primary hover:text-white transition-all">
                            {isAr ? 'عرض كل المنتجات' : 'View All Products'}
                            {isAr ? <ArrowLeft size={18} /> : <ArrowRight size={18} />}
                        </Link>
                    </div>
                    <div className="gap-4 sm:gap-10 grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4">
                        {featured.map(product => (
                            <ProductCard key={product._id} product={product} />
                        ))}
                    </div>
                </section>
            )}

            {/* Best Sellers */}
            {bestSellers.length > 0 && (
                <section className="mx-auto px-4 sm:px-6 lg:px-8 w-full max-w-7xl text-start">
                    <div className="mb-12">
                        <h2 className="mb-4 font-black text-primary text-4xl">{t('best_sellers')}</h2>
                        <p className="font-medium text-gray-500">{isAr ? 'المنتجات الأكثر طلباً وإعجاباً' : 'Our most popular and loved products'}</p>
                    </div>
                    <div className="gap-4 sm:gap-10 grid grid-cols-2 sm:grid-cols-3">
                        {bestSellers.map(product => (
                            <ProductCard key={product._id} product={product} />
                        ))}
                    </div>
                </section>
            )}

            {/* Premium Experience Section */}
            <section className="relative bg-secondary py-24 overflow-hidden text-start">
                <div className="top-0 right-0 absolute bg-accent/10 w-1/3 h-full -skew-x-12 translate-x-20 transform" />
                <div className="z-10 relative flex md:flex-row flex-col items-center gap-16 mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
                    <div className="space-y-8 md:w-1/2">
                        <h2 className="font-black text-white text-4xl md:text-6xl leading-tight">
                            {isAr ? 'تجربة تسوق فريدة لنظاراتك' : 'A Unique Shopping Experience for Your Eyes'}
                        </h2>
                        <div className="space-y-6">
                            {[
                                { t: isAr ? 'إطارات من أرقى الماركات العالمية' : 'Frames from the world\'s finest brands', i: <Star className="text-accent" /> },
                                { t: isAr ? 'عدسات طبية بدقة عالية' : 'High-precision prescription lenses', i: <Star className="text-accent" /> },
                                { t: isAr ? 'تجربة افتراضية متطورة' : 'Advanced virtual try-on', i: <Star className="text-accent" /> }
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-4 font-medium text-white text-xl">
                                    <div className="bg-white/10 p-2 rounded-lg">{item.i}</div>
                                    <span>{item.t}</span>
                                </div>
                            ))}
                        </div>
                        <Link to="/shop" className="inline-block bg-white hover:bg-accent shadow-xl px-12 py-5 rounded-2xl font-black text-secondary hover:text-white text-xl transition-all">
                            {isAr ? 'ابدأ التسوق الآن' : 'Start Shopping Now'}
                        </Link>
                    </div>
                    <div className="relative md:w-1/2">
                        <div className="absolute -inset-4 bg-accent/20 opacity-50 blur-2xl rounded-[3rem]" />
                        <img
                            src="https://images.unsplash.com/photo-1509695507497-903c140c43b0?auto=format&fit=crop&q=80&w=800"
                            alt="Premium Glasses"
                            className="relative shadow-2xl border-8 border-white/10 rounded-[3rem] w-full h-[500px] object-cover"
                        />
                    </div>
                </div>
            </section>

            {/* Newsletter */}
            <section className="mx-auto mb-10 px-4 sm:px-6 lg:px-8 w-full max-w-7xl">
                <div className="relative bg-primary shadow-2xl p-12 md:p-20 rounded-[3rem] overflow-hidden text-white text-center">
                    <div className="absolute inset-0 opacity-10 pointer-events-none">
                        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                            <path d="M0 100 C 20 0 50 0 100 100" stroke="white" fill="transparent" />
                        </svg>
                    </div>
                    <h2 className="z-10 relative mb-6 font-black text-4xl md:text-5xl">
                        {isAr ? 'انضم إلى عالمنا الحصري' : 'Join Our Exclusive World'}
                    </h2>
                    <p className="z-10 relative mx-auto mb-10 max-w-2xl text-gray-300 text-xl leading-relaxed">
                        {isAr ? 'اشترك في نشرتنا البريدية لتصلك أحدث المجموعات والعروض الحصرية قبل الجميع.' : 'Subscribe to our newsletter to receive the latest collections and exclusive offers before anyone else.'}
                    </p>
                    <form className="z-10 relative flex sm:flex-row flex-col gap-4 mx-auto max-w-lg">
                        <input
                            type="email"
                            placeholder={isAr ? 'بريدك الإلكتروني' : 'Your Email Address'}
                            className="flex-grow bg-white/10 backdrop-blur-md px-6 py-4 border border-white/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-accent text-white placeholder:text-gray-400"
                        />
                        <button className="bg-accent hover:bg-orange-600 shadow-accent/20 shadow-lg px-10 py-4 rounded-2xl font-black text-white transition-all">
                            {isAr ? 'اشترك' : 'Subscribe'}
                        </button>
                    </form>
                </div>
            </section>
        </div>
    );
};

export default Home;
