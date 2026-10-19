import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Star, Truck, ShieldCheck, Heart, ShoppingBag, ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { productAPI, settingsAPI } from '../utils/api';
import { showSuccess, showError } from '../utils/swal';

const ProductDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { currentLanguage } = useLanguage();
    const { addToCart } = useCart();
    const { user } = useAuth();
    const isAr = currentLanguage === 'ar';

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [mainImage, setMainImage] = useState('');
    const [selectedColor, setSelectedColor] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [isZoomed, setIsZoomed] = useState(false);

    const [freeShippingThreshold, setFreeShippingThreshold] = useState(null);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [reviewSubmitLoading, setReviewSubmitLoading] = useState(false);

    const fetchProduct = async () => {
        try {
            setLoading(true);
            const response = await productAPI.getOne(id);
            const productData = response.data?.data || response.data;
            setProduct(productData);
            setMainImage(productData?.images?.[0]?.url || productData?.image || '');
            setSelectedColor(productData?.colors?.[0] || '');
            setError(null);
        } catch (err) {
            console.error('Error fetching product:', err);
            setError(isAr ? 'فشل تحميل المنتج' : 'Failed to load product');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await settingsAPI.get();
                const threshold = res?.data?.data?.freeShippingThreshold ?? res?.data?.freeShippingThreshold ?? null;
                setFreeShippingThreshold(threshold);
            } catch (err) {
                console.error('Failed to fetch settings', err);
            }
        };
        fetchProduct();
        fetchSettings();
    }, [id, isAr]);

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        if (!rating || !comment) {
            showError(isAr ? 'برجاء إدخال التقييم والتعليق' : 'Please provide both rating and comment');
            return;
        }

        try {
            setReviewSubmitLoading(true);
            await productAPI.createReview(id, { rating, comment });
            showSuccess(isAr ? 'تم إضافة التقييم بنجاح' : 'Review added successfully!');
            setRating(0);
            setComment('');
            fetchProduct();
        } catch (err) {
            const msg = err.response?.data?.message || err.message;
            showError(isAr ? `فشل إضافة التقييم: ${msg}` : `Failed to add review: ${msg}`);
        } finally {
            setReviewSubmitLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center min-h-[60vh]">
                <Loader2 className="mb-4 w-12 h-12 text-accent animate-spin" />
                <p className="font-bold text-gray-500">{isAr ? 'جاري التحميل...' : 'Loading...'}</p>
            </div>
        );
    }

    if (!product || error) {
        return (
            <div className="mx-auto px-4 py-20 max-w-7xl text-center">
                <h2 className="mb-4 font-black text-primary text-3xl">{isAr ? 'المنتج غير موجود' : 'Product Not Found'}</h2>
                <button onClick={() => navigate('/shop')} className="font-bold text-accent hover:underline">
                    {isAr ? 'العودة للمتجر' : 'Back to Shop'}
                </button>
            </div>
        );
    }

    const handleBuyNow = () => {
        addToCart({ ...product, quantity, selectedColor });
        console.log('Redirecting to checkout...');
        navigate('/checkout');
    };

    return (
        <div className="mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full max-w-7xl text-start">
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 mb-8 font-bold text-gray-500 hover:text-primary transition-colors"
            >
                {isAr ? <ArrowRight size={20} /> : <ArrowLeft size={20} />}
                {isAr ? 'العودة' : 'Back'}
            </button>

            <div className="gap-16 grid grid-cols-1 lg:grid-cols-2">
                {/* Gallery / Image Zoom */}
                <div className="relative">
                    <div className="top-32 sticky">
                        <div className="group relative bg-white shadow-xl border border-gray-100 rounded-[2rem] overflow-hidden">
                            <div
                                className="relative flex justify-center items-center w-full h-[600px] overflow-hidden cursor-zoom-in"
                                onMouseEnter={() => setIsZoomed(true)}
                                onMouseLeave={() => setIsZoomed(false)}
                            >
                                <img
                                    src={mainImage}
                                    alt={isAr ? product.nameAr : (product.nameEn || product.name)}
                                    className={`object-cover w-full h-full transition-transform duration-700 origin-center ${isZoomed ? 'scale-150' : 'scale-100'}`}
                                />
                            </div>
                            <button className="top-6 right-6 absolute bg-white/90 hover:bg-white shadow-lg backdrop-blur-md p-4 border border-gray-100 rounded-2xl text-gray-400 hover:text-red-500 transition-all">
                                <Heart size={24} />
                            </button>
                        </div>

                        {/* Thumbnails */}
                        {product.images && product.images.length > 1 && (
                            <div className="flex gap-4 mt-6 pb-2 overflow-x-auto">
                                {product.images.map((img, i) => (
                                    <div
                                        key={i}
                                        onClick={() => setMainImage(img.url)}
                                        className={`bg-white shadow-sm p-2 border-2 rounded-2xl w-24 h-24 transition-all cursor-pointer shrink-0 overflow-hidden ${mainImage === img.url ? 'border-accent scale-105 shadow-md' : 'border-gray-100 hover:border-gray-300'}`}
                                    >
                                        <img src={img.url} className="rounded-xl w-full h-full object-cover" alt={`thumb-${i}`} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Product Info */}
                <div className="flex flex-col gap-8">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <span className="bg-accent/10 px-4 py-1.5 rounded-full font-black text-accent text-xs uppercase tracking-widest">
                                {product.brand || 'Premium Brand'}
                            </span>
                            {product.stock > 0 ? (
                                <span className="bg-green-50 px-4 py-1.5 rounded-full font-black text-green-600 text-xs uppercase tracking-widest">
                                    {isAr ? 'متوفر' : 'In Stock'}
                                </span>
                            ) : (
                                <span className="bg-red-50 px-4 py-1.5 rounded-full font-black text-red-600 text-xs uppercase tracking-widest">
                                    {isAr ? 'نفدت الكمية' : 'Out of Stock'}
                                </span>
                            )}
                        </div>

                        <h1 className="mb-4 font-black text-primary text-4xl md:text-5xl leading-tight">
                            {isAr ? product.nameAr : (product.nameEn || product.name)}
                        </h1>

                        <div className="flex items-center gap-6 mb-6">
                            <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1 rounded-lg text-yellow-500">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} size={16} className={i < Math.round(product.ratings?.average || 0) ? 'fill-yellow-500' : 'text-gray-300'} />
                                ))}
                                <span className="ms-2 font-black text-yellow-700 text-sm">{(product.ratings?.average || 0).toFixed(1)}</span>
                            </div>
                            <span className="font-bold text-gray-400 text-sm cursor-pointer">{product.ratings?.count || 0} {isAr ? 'تقييم' : 'Reviews'}</span>
                        </div>

                        <div className="flex items-baseline gap-4 mb-8">
                            <span className="font-black text-primary text-4xl">{product.price.toFixed(2)} {isAr ? 'ج.م' : 'EGP'}</span>
                            {product.discount > 0 && (
                                <span className="font-bold text-gray-400 text-xl line-through">
                                    {(product.price / (1 - product.discount / 100)).toFixed(2)} {isAr ? 'ج.م' : 'EGP'}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="bg-gray-50 p-6 border border-gray-100 rounded-3xl">
                        <h3 className="mb-3 font-black text-primary">{t('description')}</h3>
                        <p className="font-medium text-gray-600 text-lg leading-relaxed">
                            {isAr ? product.descriptionAr : (product.descriptionEn || product.description)}
                        </p>
                    </div>

                    {/* Color Options */}
                    <div>
                        <h3 className="mb-4 font-black text-primary text-sm uppercase tracking-widest">
                            {t('color')}
                        </h3>
                        <div className="flex flex-wrap gap-4">
                            {(product.colors || []).map((color, idx) => {
                                const colorVal = typeof color === 'string' ? color : color.hexCode;
                                const colorName = typeof color === 'string' ? color : color.name;
                                return (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedColor(color)}
                                        className={`group relative flex items-center justify-center w-12 h-12 rounded-2xl transition-all ${(typeof selectedColor === 'string' ? selectedColor : selectedColor?.hexCode) === colorVal
                                            ? 'ring-4 ring-accent/30 border-2 border-accent scale-110 shadow-lg'
                                            : 'border-2 border-transparent hover:border-gray-300'
                                            }`}
                                        style={{ backgroundColor: colorVal }}
                                        title={colorName}
                                    >
                                        {(typeof selectedColor === 'string' ? selectedColor : selectedColor?.hexCode) === colorVal && (
                                            <div className="bg-white shadow-sm rounded-full w-2 h-2" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Quantity and Actions */}
                    <div className="space-y-6 pt-4">
                        {product.stock > 0 ? (
                            <>
                                <div className="flex flex-wrap items-center gap-6">
                                    <div className="flex items-center bg-gray-100 p-1.5 border border-gray-200 rounded-2xl">
                                        <button
                                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                            className="flex justify-center items-center hover:bg-white shadow-sm hover:shadow-md rounded-xl w-12 h-12 font-black text-gray-500 hover:text-primary text-2xl transition-all"
                                        >
                                            -
                                        </button>
                                        <span className="w-14 font-black text-primary text-xl text-center select-none">{quantity}</span>
                                        <button
                                            onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                                            className="flex justify-center items-center hover:bg-white shadow-sm hover:shadow-md rounded-xl w-12 h-12 font-black text-gray-500 hover:text-primary text-2xl transition-all"
                                        >
                                            +
                                        </button>
                                    </div>

                                    <button
                                        onClick={() => addToCart({ ...product, quantity, selectedColor })}
                                        className="flex flex-1 justify-center items-center gap-3 bg-white hover:bg-primary shadow-sm hover:shadow-xl px-8 py-4 border-2 border-primary rounded-2xl min-w-[200px] h-16 font-black text-primary hover:text-white transition-all"
                                    >
                                        <ShoppingBag size={22} />
                                        {t('addToCart')}
                                    </button>
                                </div>

                                <button
                                    onClick={handleBuyNow}
                                    className="group flex justify-center items-center gap-3 bg-accent hover:bg-orange-600 shadow-accent/20 shadow-xl hover:shadow-accent/40 py-5 rounded-2xl w-full h-18 font-black text-white text-xl transition-all"
                                >
                                    {t('buyNow')}
                                    {isAr ? <ArrowLeft className="transition-transform group-hover:-translate-x-2" /> : <ArrowRight className="transition-transform group-hover:translate-x-2" />}
                                </button>
                            </>
                        ) : (
                            <button
                                disabled
                                className="flex justify-center items-center gap-3 bg-red-100 p-6 rounded-2xl w-full font-black text-red-500 text-xl cursor-not-allowed transition-all"
                            >
                                {isAr ? 'عذراً، هذا المنتج غير متوفر حالياً' : 'Sorry, this product is currently out of stock'}
                            </button>
                        )}
                    </div>

                    {/* Trust Badges */}
                    <div className="gap-4 grid grid-cols-1 sm:grid-cols-2 mt-4">
                        <div className="flex items-center gap-4 bg-white shadow-sm p-5 border border-gray-100 rounded-[1.5rem]">
                            <div className="flex justify-center items-center bg-blue-50 rounded-xl w-12 h-12 text-blue-500">
                                <Truck size={24} />
                            </div>
                            <div>
                                <h4 className="font-black text-primary text-sm">{isAr ? 'شحن مجاني' : 'Free Shipping'}</h4>
                                <p className="font-bold text-gray-500 text-xs">
                                    {freeShippingThreshold !== null
                                        ? (isAr ? `للطلبات فوق ${freeShippingThreshold} ج.م` : `On orders over ${freeShippingThreshold} EGP`)
                                        : (isAr ? 'للطلبات المؤهلة' : 'On eligible orders')}
                                </p>
                            </div>
                        </div>
                        {((isAr && product.warrantyAr) || (!isAr && typeof product.warrantyEn === 'string' && product.warrantyEn)) && (
                            <div className="flex items-center gap-4 bg-white shadow-sm p-5 border border-gray-100 rounded-[1.5rem]">
                                <div className="flex justify-center items-center bg-green-50 rounded-xl w-12 h-12 text-green-500">
                                    <ShieldCheck size={24} />
                                </div>
                                <div>
                                    <h4 className="font-black text-primary text-sm">{isAr ? product.warrantyAr : product.warrantyEn}</h4>
                                    <p className="font-bold text-gray-500 text-xs">{isAr ? 'ضمان الجودة الأصلي' : 'Authentic quality guarantee'}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Custom Reviews Section */}
            <div className="mt-16 w-full max-w-7xl">
                <h3 className="mb-8 font-black text-primary text-2xl">{isAr ? 'تقييمات العملاء' : 'Customer Reviews'}</h3>
                <div className="gap-12 grid grid-cols-1 md:grid-cols-2">

                    {/* Exisiting Reviews List */}
                    <div className="space-y-6">
                        {product.reviews && product.reviews.length > 0 ? (
                            product.reviews.map((rev, index) => (
                                <div key={index} className="bg-white shadow-sm p-6 border border-gray-100 rounded-3xl">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="flex justify-center items-center bg-gray-100 rounded-full w-12 h-12 font-black text-gray-500 text-xl">
                                            {rev.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-primary">{rev.name}</h4>
                                            <div className="flex items-center gap-1 mt-1">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star key={i} size={14} className={i < rev.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'} />
                                                ))}
                                            </div>
                                        </div>
                                        <span className="ms-auto font-bold text-gray-400 text-xs">
                                            {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString() : ''}
                                        </span>
                                    </div>
                                    <p className="font-medium text-gray-600 text-sm leading-relaxed">{rev.comment}</p>
                                </div>
                            ))
                        ) : (
                            <div className="bg-gray-50 p-8 rounded-3xl text-center">
                                <p className="font-bold text-gray-500">{isAr ? 'لا توجد تقييمات حتى الآن. كُن أول من يقيّم هذا المنتج!' : 'No reviews yet. Be the first to review this product!'}</p>
                            </div>
                        )}
                    </div>

                    {/* Review Form */}
                    <div className="bg-white shadow-xl p-8 border border-gray-100 rounded-[2.5rem] h-fit">
                        <h3 className="mb-6 font-black text-primary text-xl">{isAr ? 'أضف تقييمك' : 'Write a Review'}</h3>

                        {user ? (
                            product.reviews?.find(r => r.user === user._id) ? (
                                <div className="bg-green-50 p-6 rounded-2xl text-center">
                                    <p className="font-bold text-green-600">
                                        {isAr ? 'شكراً لتقييمك! لقد قمت بتقييم هذا المنتج بالفعل.' : 'Thank you! You have already reviewed this product.'}
                                    </p>
                                </div>
                            ) : (
                                <form onSubmit={handleReviewSubmit} className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="font-bold text-primary text-sm uppercase tracking-widest">{isAr ? 'التقييم' : 'Rating'}</label>
                                        <select
                                            value={rating}
                                            onChange={(e) => setRating(Number(e.target.value))}
                                            className="bg-gray-50 p-4 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-accent w-full font-bold text-gray-600 transition-all"
                                            required
                                        >
                                            <option value="" disabled>{isAr ? 'اختر التقييم...' : 'Select rating...'}</option>
                                            <option value="5">5 - {isAr ? 'ممتاز' : 'Excellent'}</option>
                                            <option value="4">4 - {isAr ? 'جيد جداً' : 'Very Good'}</option>
                                            <option value="3">3 - {isAr ? 'جيد' : 'Good'}</option>
                                            <option value="2">2 - {isAr ? 'مقبول' : 'Fair'}</option>
                                            <option value="1">1 - {isAr ? 'سيء' : 'Poor'}</option>
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="font-bold text-primary text-sm uppercase tracking-widest">{isAr ? 'تعليقك' : 'Your Review'}</label>
                                        <textarea
                                            value={comment}
                                            onChange={(e) => setComment(e.target.value)}
                                            rows="4"
                                            className="bg-gray-50 p-4 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-accent w-full transition-all resize-none"
                                            placeholder={isAr ? 'أخبرنا عن تجربتك...' : 'Tell us about your experience...'}
                                            required
                                        ></textarea>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={reviewSubmitLoading}
                                        className="flex justify-center items-center bg-accent shadow-accent/20 shadow-xl hover:shadow-accent/40 w-full h-14 font-black text-white text-lg rounded-2xl active:scale-95 transition-all disabled:opacity-50"
                                    >
                                        {reviewSubmitLoading ? <Loader2 className="animate-spin" /> : (isAr ? 'إرسال التقييم' : 'Submit Review')}
                                    </button>
                                </form>
                            )
                        ) : (
                            <div className="bg-gray-50 p-6 rounded-2xl text-center">
                                <p className="mb-4 font-bold text-gray-500">
                                    {isAr ? 'يجب تسجيل الدخول لإضافة تقييم.' : 'You must be logged in to post a review.'}
                                </p>
                                <button
                                    onClick={() => navigate('/login')}
                                    className="bg-primary px-8 py-3 rounded-xl font-bold text-white transition-transform active:scale-95"
                                >
                                    {isAr ? 'تسجيل الدخول' : 'Log In'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetails;
