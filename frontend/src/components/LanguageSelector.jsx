import React from 'react';
import { useTranslation } from 'react-i18next';

const LanguageSelector = ({ className = "" }) => {
    const { i18n } = useTranslation();
    
    const languages = [
        { code: 'en', name: 'English', flag: '🇺🇸' },
        { code: 'es', name: 'Español', flag: '🇪🇸' },
        { code: 'fr', name: 'Français', flag: '🇫🇷' },
        { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' }
    ];
    
    const changeLanguage = (languageCode) => {
        i18n.changeLanguage(languageCode);
    };
    
    return (
        <div className={`relative inline-block text-left ${className}`}>
            <select 
                value={i18n.language}
                onChange={(e) => changeLanguage(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-md px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
                {languages.map((language) => (
                    <option key={language.code} value={language.code}>
                        {language.flag} {language.name}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default LanguageSelector;