// Header.js
import { MaterialIcons } from '@expo/vector-icons';
import React, { createContext, useContext, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { styles } from '../styles/styles';

// Create a context for language preference
export const LanguageContext = createContext({
    language: 'en',
    setLanguage: () => {},
    getLocalizedText: () => {}
});

// Custom hook for using language context
export const useLanguage = () => useContext(LanguageContext);

// Language Provider component
export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState('en');

    const getLocalizedText = (textObject) => {
        if (!textObject) return '';
        
        switch (language) {
            case 'tc':
                return textObject.tc || textObject.name_tc || '';
            case 'sc':
                return textObject.sc || textObject.name_sc || '';
            default:
                return textObject.en || textObject.name_en || '';
        }
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, getLocalizedText }}>
            {children}
        </LanguageContext.Provider>
    );
};

// Header component
export default function Header() {
    const { language, setLanguage } = useLanguage();

    const toggleLanguage = () => {
        // Cycle through languages: en -> tc -> sc -> en
        const nextLanguage = {
            'en': 'tc',
            'tc': 'sc',
            'sc': 'en'
        }[language];
        setLanguage(nextLanguage);
    };

    const getLanguageDisplay = () => {
        const displays = {
            'en': 'EN',
            'tc': '繁',
            'sc': '简'
        };
        return displays[language];
    };

    return (
        <View style={styles.header}>
            <Text style={styles.title}>KMB Bus Arrival Times</Text>
            <TouchableOpacity
                style={styles.languageButton}
                onPress={toggleLanguage}
            >
                <MaterialIcons name="language" size={20} color="#0066cc" />
                <Text style={styles.languageButtonText}>
                    {getLanguageDisplay()}
                </Text>
            </TouchableOpacity>
        </View>
    );
}