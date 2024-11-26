import { MaterialIcons } from '@expo/vector-icons';
import React, { createContext, useContext, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { styles } from '../styles/styles';

export const LanguageContext = createContext({
    language: 'en',
    setLanguage: () => { },
    getLocalizedText: () => { }
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

export default function Header({
    searchMode,
    onSearchModeChange,
    showMenu,
    onMenuPress,
    onSettingsPress
}) {
    return (
        <View style={styles.header}>
            <View style={styles.headerContent}>
                <View style={styles.titleContainer}>
                    <Text style={styles.title}>Transit Go</Text>
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
                                searchMode === 'mtr' && styles.searchTypeButtonActive
                            ]}
                            onPress={() => onSearchModeChange('mtr')}
                        >
                            <MaterialIcons
                                name="train"
                                size={20}
                                color={searchMode === 'mtr' ? '#0066cc' : '#666666'}
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
                        <TouchableOpacity
                            style={[
                                styles.searchTypeButton,
                                searchMode === 'traffic' && styles.searchTypeButtonActive
                            ]}
                            onPress={() => onSearchModeChange('traffic')}
                        >
                            <MaterialIcons
                                name="traffic"
                                size={20}
                                color={searchMode === 'traffic' ? '#0066cc' : '#666666'}
                            />
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity
                        style={styles.settingsButton}
                        onPress={onSettingsPress}
                    >
                        <MaterialIcons name="settings" size={24} color="#0066cc" />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}