// src/components/SearchBar.js

import React from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { styles } from '../styles/styles';

export default function SearchBar({ busRoute, setBusRoute, onSearch, loading }) {
    const handleRouteChange = (text) => {
        // Convert to uppercase and remove spaces
        const formattedText = text.toUpperCase().replace(/\s+/g, '');
        
        // Allow only alphanumeric characters
        const validText = formattedText.replace(/[^A-Z0-9]/g, '');
        
        // Limit to 4 characters as most bus routes aren't longer than this
        const truncatedText = validText.slice(0, 4);
        
        setBusRoute(truncatedText);
    };

    return (
        <View style={styles.searchContainer}>
            <TextInput
                style={styles.input}
                placeholder="Enter bus route (e.g., 1A, N122)"
                value={busRoute}
                onChangeText={handleRouteChange}
                autoCapitalize="characters"
                maxLength={4}
            />
            <TouchableOpacity
                style={[
                    styles.searchButton,
                    (!busRoute || loading) && styles.searchButtonDisabled
                ]}
                onPress={onSearch}
                disabled={!busRoute || loading}
            >
                <Text style={styles.searchButtonText}>Search</Text>
            </TouchableOpacity>
        </View>
    );
}