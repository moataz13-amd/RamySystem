import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Translation files would ideally be separated but for simplicity putting basic mapping here
const resources = {
    en: {
        translation: {
            "home": "Home",
            "shop": "Shop",
            "cart": "Cart",
            "login": "Login",
            "search": "Search...",
            "categories": "Categories",
            "featured_products": "Featured Products",
            "best_sellers": "Best Sellers",
            "customer_reviews": "Customer Reviews",
            "addToCart": "Add to Cart",
            "buyNow": "Buy Now",
            "price": "Price",
            "description": "Description",
            "color": "Color",
            "checkout": "Checkout",
            "total": "Total",
            "remove": "Remove",
            "trackOrder": "Track Order",
            "hero_title": "Luxury Eyewear for Your Vision",
            "hero_subtitle": "Discover our premium collection of designer frames and sunglasses.",
            "shop_now": "Shop Now",
            "footer_about": "About Us",
            "footer_contact": "Contact",
            "footer_links": "Quick Links",
            "frame_type": "Frame Type",
            "price_range": "Price Range",
            "order_tracking_title": "Track Your Order",
            "order_number": "Order Number",
            "phone_number": "Phone Number",
            "track_button": "Track Now",
            "tracking": "Order Tracking"
        }
    },
    ar: {
        translation: {
            "home": "الرئيسية",
            "shop": "المتجر",
            "cart": "عربة التسوق",
            "login": "تسجيل الدخول",
            "search": "بحث...",
            "categories": "الفئات",
            "featured_products": "منتجات مميزة",
            "best_sellers": "الأكثر مبيعاً",
            "customer_reviews": "تقييمات العملاء",
            "addToCart": "أضف إلى السلة",
            "buyNow": "اشتري الآن",
            "price": "السعر",
            "description": "الوصف",
            "color": "اللون",
            "checkout": "إتمام الطلب",
            "total": "المجموع",
            "remove": "إزالة",
            "trackOrder": "تتبع الطلب",
            "hero_title": "نظارات فاخرة لرؤيتك",
            "hero_subtitle": "اكتشف مجموعتنا المتميزة من الإطارات والنظارات الشمسية المصممة.",
            "shop_now": "تسوق الآن",
            "footer_about": "عن المتجر",
            "footer_contact": "اتصل بنا",
            "footer_links": "روابط سريعة",
            "frame_type": "نوع الإطار",
            "price_range": "نطاق السعر",
            "order_tracking_title": "تتبع طلبك",
            "order_number": "رقم الطلب",
            "phone_number": "رقم الهاتف",
            "track_button": "تتبع الآن",
            "tracking": "تتبع طلب"
        }
    }
};

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false
        }
    });

export default i18n;