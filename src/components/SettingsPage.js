import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useLanguage } from './Header';

const SettingsPage = ({ onClose }) => {
    const { language, setLanguage } = useLanguage();

    const languageOptions = [
        { code: 'en', label: 'English', nativeLabel: 'English' },
        { code: 'tc', label: '繁體中文', nativeLabel: '繁體中文' },
        { code: 'sc', label: '简体中文', nativeLabel: '简体中文' }
    ];

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={onClose}
                        style={styles.closeButton}
                    >
                        <MaterialIcons name="arrow-back" size={24} color="#666666" />
                    </TouchableOpacity>
                    <Text style={styles.title}>Settings</Text>
                </View>

                <ScrollView style={styles.content}>
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Language</Text>
                        <View style={styles.languageOptions}>
                            {languageOptions.map(option => (
                                <TouchableOpacity
                                    key={option.code}
                                    style={[
                                        styles.languageButton,
                                        language === option.code && styles.languageButtonActive
                                    ]}
                                    onPress={() => setLanguage(option.code)}
                                >
                                    <Text style={[
                                        styles.languageButtonText,
                                        language === option.code && styles.languageButtonTextActive
                                    ]}>
                                        {option.nativeLabel}
                                    </Text>
                                    {language === option.code && (
                                        <MaterialIcons
                                            name="check"
                                            size={20}
                                            color="#0066cc"
                                            style={styles.checkIcon}
                                        />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>About</Text>
                        <View style={styles.aboutContent}>
                            <Text style={styles.versionText}>Version 1.0.0</Text>
                            <Text style={styles.descriptionText}>
                                KMB bus arrival times and route information. Data provided by KMB Open Data API.
                            </Text>
                        </View>
                    </View>
                </ScrollView>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#ffffff',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    closeButton: {
        padding: 8,
        marginRight: 8,
        borderRadius: 20,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333333',
    },
    content: {
        flex: 1,
    },
    section: {
        backgroundColor: '#ffffff',
        marginTop: 16,
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333333',
        marginBottom: 12,
    },
    languageOptions: {
        gap: 8,
    },
    languageButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 12,
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    languageButtonActive: {
        backgroundColor: '#f0f7ff',
        borderColor: '#0066cc',
    },
    languageButtonText: {
        fontSize: 16,
        color: '#666666',
    },
    languageButtonTextActive: {
        color: '#0066cc',
        fontWeight: '500',
    },
    checkIcon: {
        marginLeft: 8,
    },
    aboutContent: {
        gap: 8,
    },
    versionText: {
        fontSize: 14,
        color: '#666666',
    },
    descriptionText: {
        fontSize: 14,
        color: '#666666',
        lineHeight: 20,
    },

});

export default SettingsPage;