import React, { createContext, useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import '../utils/i18n';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
    const { i18n } = useTranslation();
    const [currentLanguage, setCurrentLanguage] = useState(i18n.language || 'en');

    useEffect(() => {
        // Determine language direction
        const root = document.documentElement;
        if (currentLanguage === 'ar' || currentLanguage.startsWith('ar')) {
            root.setAttribute('dir', 'rtl');
            root.setAttribute('lang', 'ar');
        } else {
            root.setAttribute('dir', 'ltr');
            root.setAttribute('lang', 'en');
        }
    }, [currentLanguage]);

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
        setCurrentLanguage(lng);
    };

    return (
        <LanguageContext.Provider value={{ currentLanguage, changeLanguage }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => useContext(LanguageContext);
