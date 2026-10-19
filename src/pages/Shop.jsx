import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { Search, ChevronDown, SlidersHorizontal, Loader2, X } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import ProductCard from '../components/ProductCard';
import { productAPI } from '../utils/api';
import api from '../services/axiosInstance';

const Shop = () => {
    const { t } = useTranslation();
    const { currentLanguage } = useLanguage();
    const isAr = currentLanguage === 'ar';
    const [searchParams, setSearchParams] = useSearchParams();

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
    const [priceRange, setPriceRange] = useState(10000);
    const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
    const [sortBy, setSortBy] = useState('newest');
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const [productsRes, catRes] = await Promise.all([
                    productAPI.getAll(),
                    api.get('/categories').catch(() => ({ data: { data: [] } }))
                ]);
                const productsData = productsRes.data?.data || productsRes.data || [];
                const catsData = catRes.data?.data || [];
                setProducts(productsData);
                setCategories(catsData);
                setError(null);
            } catch (err) {
                console.error('Error fetching products:', err);
                setError(isAr ? 'فشل تحميل المنتجات.' : 'Failed to load products.');
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, [isAr]);

    useEffect(() => {
        const cat = searchParams.get('category');
        if (cat) setSelectedCategory(cat);
        const search = searchParams.get('search');
        if (search) setSearchQuery(search);
    }, [searchParams]);

    const filteredProducts = products.filter(product => {
        // category comes back from the server as a populated object { _id, nameEn, nameAr }
        const catId = product.category?._id?.toString() || product.category?.toString() || '';
        const matchesCategory = selectedCategory === 'all' || catId === selectedCategory;
        const matchesPrice = product.price <= priceRange;
        const nameEn = product.nameEn || product.name || '';
        const nameAr = product.nameAr || '';
        const matchesSearch =
            nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
            nameAr.includes(searchQuery);
        return matchesCategory && matchesPrice && matchesSearch;
    });

    if (sortBy === 'price-low') filteredProducts.sort((a, b) => a.price - b.price);
    else if (sortBy === 'price-high') filteredProducts.sort((a, b) => b.price - a.price);

    const handleCategoryChange = (catId) => {
        setSelectedCategory(catId);
        const newParams = new URLSearchParams(searchParams);
        if (catId === 'all') newParams.delete('category');
        else newParams.set('category', catId);
        setSearchParams(newParams);
    };

    const allCats = [{ _id: 'all', nameEn: 'All', nameAr: 'الكل' }, ...categories];

    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center min-h-[60vh]">
                <Loader2 className="mb-4 w-12 h-12 text-accent animate-spin" />
                <p className="font-bold text-gray-500">{isAr ? 'جاري تحميل المنتجات...' : 'Loading products...'}</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="mx-auto px-4 py-20 max-w-7xl text-center">
                <p className="text-red-600 font-bold mb-4">{error}</p>
                <button onClick={() => window.location.reload()} className="bg-red-600 hover:bg-red-700 px-8 py-3 rounded-xl font-bold text-white">
                    {isAr ? 'إعادة المحاولة' : 'Try Again'}
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">

            {/* ─── Filter Bar (scrolls with page) ─── */}
            <div className="px-4 sm:px-6 lg:px-8 pt-4 pb-2">
                <div className="max-w-7xl mx-auto py-3">

                    {/* Category pills + sort + price filter */}
                    <div
                        className="flex items-center gap-2 overflow-x-auto pb-1"
                        style={{ scrollbarWidth: 'none' }}
                    >
                        {allCats.map(cat => (
                            <button
                                key={cat._id || cat.id}
                                onClick={() => handleCategoryChange(cat._id || cat.id)}
                                className={`shrink-0 px-5 py-2 rounded-full font-bold text-sm whitespace-nowrap transition-all ${selectedCategory === (cat._id || cat.id)
                                    ? 'bg-primary text-white shadow-sm'
                                    : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                            >
                                {isAr ? cat.nameAr : (cat.nameEn || cat.name)}
                            </button>
                        ))}

                        {/* Controls pushed to the end */}
                        <div className="ms-auto flex items-center gap-3 shrink-0">
                            <div className="relative">
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="bg-gray-100 rounded-full px-4 pr-8 py-2 text-sm font-bold text-primary border-0 focus:outline-none appearance-none cursor-pointer"
                                >
                                    <option value="newest">{isAr ? 'الأحدث' : 'Newest'}</option>
                                    <option value="price-low">{isAr ? 'السعر: الأقل' : 'Price ↑'}</option>
                                    <option value="price-high">{isAr ? 'السعر: الأعلى' : 'Price ↓'}</option>
                                </select>
                                <ChevronDown
                                    size={13}
                                    className={`absolute top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none ${isAr ? 'left-3' : 'right-3'}`}
                                />
                            </div>

                            <button
                                onClick={() => setShowFilters(p => !p)}
                                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold transition-all ${showFilters ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                <SlidersHorizontal size={13} />
                                {isAr ? 'السعر' : 'Price'}
                            </button>

                            <span className="hidden sm:block text-xs font-medium text-gray-400 shrink-0">
                                {filteredProducts.length} {isAr ? 'منتج' : 'items'}
                            </span>
                        </div>
                    </div>

                    {/* Expandable price slider */}
                    {showFilters && (
                        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100">
                            <label className="text-sm font-bold text-gray-600 shrink-0">
                                {isAr ? 'السعر:' : 'Max price:'}
                            </label>
                            <input
                                type="range"
                                min="0"
                                max="10000"
                                step="100"
                                value={priceRange}
                                onChange={(e) => setPriceRange(parseInt(e.target.value))}
                                className="flex-grow h-1.5 rounded-lg bg-gray-200 appearance-none cursor-pointer accent-accent"
                            />
                            <span className="text-sm font-black text-accent shrink-0 min-w-[90px] text-center">
                                {priceRange.toLocaleString()} {isAr ? 'ج.م' : 'EGP'}
                            </span>
                            <button
                                onClick={() => setPriceRange(10000)}
                                className="text-xs font-bold text-gray-400 hover:text-primary shrink-0"
                            >
                                {isAr ? 'إعادة ضبط' : 'Reset'}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* ─── Product Grid ─── */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {filteredProducts.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                        {filteredProducts.map((product) => (
                            <ProductCard key={product._id} product={product} />
                        ))}
                    </div>
                ) : (
                    <div className="mt-10 bg-white border border-dashed border-gray-300 rounded-[3rem] p-20 text-center">
                        <div className="flex justify-center items-center bg-gray-50 rounded-full w-20 h-20 mx-auto mb-6 text-gray-300">
                            <Search size={40} />
                        </div>
                        <h3 className="font-black text-primary text-2xl mb-2">
                            {isAr ? 'لا توجد نتائج' : 'No products found'}
                        </h3>
                        <p className="text-gray-500 max-w-xs mx-auto mb-8">
                            {isAr ? 'حاول تغيير معايير البحث أو التصفية.' : 'Try adjusting your search or filters.'}
                        </p>
                        <button
                            onClick={() => { handleCategoryChange('all'); setPriceRange(10000); setSearchQuery(''); }}
                            className="font-bold text-accent hover:underline"
                        >
                            {isAr ? 'إعادة ضبط التصفية' : 'Reset all filters'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Shop;
