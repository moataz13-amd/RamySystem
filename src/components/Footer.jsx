import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
    const { t } = useTranslation();

    return (
        <footer className="bg-primary text-white py-12 mt-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div>
                        <h3 className="text-xl font-bold mb-4">رامي المغربي للبصريات</h3>
                        <p className="text-gray-300 mb-4 text-sm leading-relaxed">
                            نظارات فاخرة تناسب نمط الحياة العصري. نظارات طبية وشمسية وعدسات لاصقة عالية الجودة.
                        </p>
                        <div className="flex gap-4">
                            <a href="#" className="p-2 bg-secondary rounded-full hover:bg-accent transition-colors">
                                <Facebook size={18} />
                            </a>
                            <a href="#" className="p-2 bg-secondary rounded-full hover:bg-accent transition-colors">
                                <Twitter size={18} />
                            </a>
                            <a href="#" className="p-2 bg-secondary rounded-full hover:bg-accent transition-colors">
                                <Instagram size={18} />
                            </a>
                        </div>
                    </div>

                    <div>
                        <h4 className="font-bold mb-4">{t('categories')}</h4>
                        <ul className="space-y-2 text-gray-300 text-sm">
                            <li><Link to="/shop?category=sunglasses" className="hover:text-accent transition-colors">نظارات شمسية</Link></li>
                            <li><Link to="/shop?category=eyeglasses" className="hover:text-accent transition-colors">نظارات طبية</Link></li>
                            <li><Link to="/shop?category=reading" className="hover:text-accent transition-colors">نظارات قراءة</Link></li>
                            <li><Link to="/shop?category=contact_lenses" className="hover:text-accent transition-colors">عدسات لاصقة</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold mb-4">خدمة العملاء</h4>
                        <ul className="space-y-2 text-gray-300 text-sm">
                            <li><Link to="/tracking" className="hover:text-accent transition-colors">{t('trackOrder')}</Link></li>
                            <li><Link to="/about" className="hover:text-accent transition-colors">من نحن</Link></li>
                            <li><Link to="/faq" className="hover:text-accent transition-colors">الأسئلة الشائعة</Link></li>
                            <li><Link to="/returns" className="hover:text-accent transition-colors">الاستبدال والاسترجاع</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold mb-4">تواصل معنا</h4>
                        <ul className="space-y-3 text-gray-300 text-sm">
                            <li className="flex items-center gap-3">
                                <MapPin size={18} className="text-accent flex-shrink-0" />
                                <span>العامرية - شارع الشرقاوي - اسفل معمل المختبر</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Phone size={18} className="text-accent flex-shrink-0" />
                                <span dir="ltr">+20 10 11481980</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Mail size={18} className="text-accent flex-shrink-0" />
                                <span>[EMAIL_ADDRESS]</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-secondary mt-12 pt-8 text-center text-sm text-gray-400">
                    <p>&copy; {new Date().getFullYear()} جميع الحقوق محفوظه | رامي المغربي للبصريات </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
