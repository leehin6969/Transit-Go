// Header.js
import { MaterialIcons } from '@expo/vector-icons';
import React, { createContext, useContext, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { styles } from '../styles/styles';

export const LanguageContext = createContext({
    language: 'en',
    setLanguage: () => {},
    getLocalizedText: () => {}
});

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState('en');

    const getLocalizedText = (textObject) => {
        if (!textObject) return '';
        switch (language) {
            case 'tc': return textObject.tc || textObject.name_tc || '';
            case 'sc': return textObject.sc || textObject.name_sc || '';
            default: return textObject.en || textObject.name_en || '';
        }
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, getLocalizedText }}>
            {children}
        </LanguageContext.Provider>
    );
};

export default function Header({ searchMode, onSearchModeChange }) {
    const { language, setLanguage } = useLanguage();

    const toggleLanguage = () => {
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
            <View style={styles.headerContent}>
                <Text style={styles.title}>KMB</Text>
                <View style={styles.headerButtons}>
                    <View style={styles.searchTypeButtons}>
                        <TouchableOpacity
                            style={[
                                styles.searchTypeButton,
                                searchMode === 'route' && styles.searchTypeButtonActive
                            ]}
                            onPress={() => onSearchModeChange('route')}
                        >
                            <MaterialIcons
                                name="directions-bus"
                                size={20}
                                color={searchMode === 'route' ? '#0066cc' : '#666666'}
                            />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.searchTypeButton,
                                searchMode === 'nearby' && styles.searchTypeButtonActive
                            ]}
                            onPress={() => onSearchModeChange('nearby')}
                        >
                            <MaterialIcons
                                name="near-me"
                                size={20}
                                color={searchMode === 'nearby' ? '#0066cc' : '#666666'}
                            />
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity
                        style={styles.languageButton}
                        onPress={toggleLanguage}
                    >
                        <Text style={styles.languageButtonText}>
                            {getLanguageDisplay()}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}