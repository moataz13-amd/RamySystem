import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../context/LanguageContext';
import { ShoppingCart, Star, Heart, ArrowRight, ArrowLeft, Truck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

const ProductCard = ({ product }) => {
    const { t } = useTranslation();
    const { currentLanguage } = useLanguage();
    const { addToCart } = useCart();
    const { toggleWishlist, isInWishlist } = useWishlist();
    const isAr = currentLanguage === 'ar';

    const inWishlist = isInWishlist(product._id);

    return (
        <div className="group relative flex flex-col bg-white shadow-sm hover:shadow-2xl border border-gray-100 rounded-2xl h-full overflow-hidden text-start transition-all duration-500">
            <div className="block relative flex-shrink-0 bg-gray-50 h-36 sm:h-56 lg:h-72 overflow-hidden">
                <Link to={`/product/${product._id}`} className="block w-full h-full">
                    <img
                        src={product.image || product.images?.[0]?.url}
                        alt={isAr ? product.nameAr : (product.nameEn || product.name)}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                </Link>

                {/* Badges */}
                <div className={`absolute top-4 ${isAr ? 'right-4' : 'left-4'} flex flex-col gap-2`}>
                    {product.bestSeller && (
                        <div className="bg-accent shadow-accent/30 shadow-lg px-3 py-1.5 rounded-full font-black text-[10px] text-white uppercase tracking-widest">
                            {isAr ? 'الأكثر مبيعاً' : 'Best Seller'}
                        </div>
                    )}
                    {product.featured && (
                        <div className="bg-primary shadow-lg shadow-primary/30 px-3 py-1.5 rounded-full font-black text-[10px] text-white uppercase tracking-widest">
                            {isAr ? 'مميز' : 'Featured'}
                        </div>
                    )}
                    {product.freeShipping && (
                        <div className="flex items-center gap-1 bg-green-500 shadow-lg shadow-green-500/30 px-3 py-1.5 rounded-full font-black text-[10px] text-white uppercase tracking-widest">
                            <Truck size={10} />
                            {isAr ? 'شحن مجاني' : 'Free Ship'}
                        </div>
                    )}
                </div>

                {/* Quick Actions */}
                <div className={`absolute top-4 ${isAr ? 'left-4' : 'right-4'} flex flex-col gap-2 translate-x-12 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-500`}>
                    <button
                        onClick={() => toggleWishlist(product)}
                        className={`p-3 rounded-2xl shadow-xl transition-all duration-300 border border-gray-100 ${inWishlist ? 'bg-red-500 text-white scale-110' : 'bg-white text-gray-400 hover:text-red-500 hover:bg-red-50'
                            }`}
                    >
                        <Heart size={20} className={inWishlist ? 'fill-white' : ''} />
                    </button>
                </div>

                <div className="bottom-0 left-0 absolute p-4 w-full transition-transform translate-y-full group-hover:translate-y-0 duration-500">
                    {product.stock > 0 ? (
                        <button
                            onClick={() => addToCart({ ...product, quantity: 1, selectedColor: product.colors?.[0] })}
                            className="flex justify-center items-center gap-2 bg-white/90 hover:bg-white shadow-xl backdrop-blur-md py-3 rounded-2xl w-full font-black text-primary active:scale-95 transition-all"
                        >
                            <ShoppingCart size={18} />
                            {t('addToCart')}
                        </button>
                    ) : (
                        <button
                            disabled
                            className="flex justify-center items-center gap-2 bg-red-100/90 shadow-xl backdrop-blur-md py-3 rounded-2xl w-full font-black text-red-500 cursor-not-allowed transition-all"
                        >
                            {isAr ? 'نفدت الكمية' : 'Out of Stock'}
                        </button>
                    )}
                </div>
            </div>

            <div className="flex flex-col flex-grow p-3 sm:p-6">
                <div className="flex justify-between items-start mb-3">
                    <div className="space-y-1">
                        <p className="font-black text-[10px] text-gray-400 uppercase tracking-widest">{product.brand || 'Luxury'}</p>
                        <Link to={`/product/${product._id}`}>
                            <h3 className="font-black text-primary hover:text-accent text-sm sm:text-xl line-clamp-1 leading-tight transition-colors">
                                {isAr ? product.nameAr : (product.nameEn || product.name)}
                            </h3>
                        </Link>
                    </div>
                </div>

                <div className="hidden sm:flex items-center gap-2 mb-4">
                    <div className="flex items-center text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                            <Star key={i} size={14} className={i < Math.round(product.ratings?.average || 0) ? 'fill-yellow-400' : 'text-gray-200'} />
                        ))}
                    </div>
                    <span className="font-bold text-gray-400 text-xs">({product.ratings?.count || 0})</span>
                </div>

                <div className="flex justify-between items-center mt-auto pt-4 border-gray-50 border-t">
                    <div className="flex flex-col">
                        <span className="mb-1 font-black text-[10px] text-gray-400 uppercase leading-none tracking-widest">{isAr ? 'السعر' : 'PRICE'}</span>
                        <div className="flex items-baseline gap-2">
                            <span className="font-black text-primary text-base sm:text-2xl">{product.price.toFixed(0)} {isAr ? 'ج.م' : 'EGP'}</span>
                            {product.discount > 0 && (
                                <span className="font-bold text-gray-400 text-sm line-through">
                                    {(product.price / (1 - product.discount / 100)).toFixed(2)}
                                </span>
                            )}
                        </div>
                    </div>
                    <Link
                        to={`/product/${product._id}`}
                        className="group/btn flex justify-center items-center bg-gray-50 hover:bg-primary shadow-sm rounded-lg sm:rounded-xl w-8 h-8 sm:w-12 sm:h-12 text-primary hover:text-white transition-all duration-300"
                    >
                        {isAr ? <ArrowLeft size={20} className="transition-transform group-hover/btn:-translate-x-1" /> : <ArrowRight size={20} className="transition-transform group-hover/btn:translate-x-1" />}
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
