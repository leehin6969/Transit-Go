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

export default function Header({ searchMode, onSearchModeChange, showMenu, onMenuPress }) {
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
                <View style={styles.titleContainer}>
                    <Text style={styles.title}>KMB</Text>
                    <TouchableOpacity
                        style={styles.menuButton}
                        onPress={onMenuPress}
                        activeOpacity={0.7}
                    >
                        <MaterialIcons
                            name={showMenu ? "expand-less" : "expand-more"}
                            size={24}
                            color="#0066cc"
                        />
                    </TouchableOpacity>
                </View>
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

// Add these styles to your styles.js file if not already present
const additionalStyles = {
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    menuButton: {
        padding: 4,
        borderRadius: 4,
        marginLeft: 4,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        backgroundColor: '#ffffff',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
        paddingTop: 8,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingBottom: 8,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333333',
    },
    headerButtons: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    searchTypeButtons: {
        flexDirection: 'row',
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
        padding: 2,
    },
    searchTypeButton: {
        padding: 6,
        borderRadius: 6,
    },
    searchTypeButtonActive: {
        backgroundColor: '#ffffff',
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
        elevation: 1,
    },
    languageButton: {
        backgroundColor: '#f0f7ff',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    languageButtonText: {
        color: '#0066cc',
        fontSize: 13,
        fontWeight: '500',
    },
};