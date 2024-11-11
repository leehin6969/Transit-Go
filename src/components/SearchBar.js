// SearchBar.js
import { MaterialIcons } from '@expo/vector-icons';
import debounce from 'lodash/debounce';
import React, { useCallback, useEffect, useState } from 'react';
import {
    Animated,
    Keyboard,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { styles } from '../styles/styles';
import { useLanguage } from './Header';

// Cache for route suggestions
let routeSuggestionsCache = {};

const SearchBar = ({
    busRoute,
    setBusRoute,
    onSearch,
    loading,
    allRoutes = []
}) => {
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [suggestionsOpacity] = useState(new Animated.Value(0));
    const { getLocalizedText } = useLanguage();

    // Process routes to combine inbound and outbound information
    const processRoutes = useCallback((routes) => {
        const routeMap = {};

        routes.forEach(route => {
            const key = route.route;
            if (!routeMap[key]) {
                routeMap[key] = {
                    route: key,
                    directions: []
                };
            }

            routeMap[key].directions.push({
                bound: route.bound,
                orig_en: route.orig_en,
                orig_tc: route.orig_tc,
                orig_sc: route.orig_sc,
                dest_en: route.dest_en,
                dest_tc: route.dest_tc,
                dest_sc: route.dest_sc
            });
        });

        return Object.values(routeMap);
    }, []);

    // Debounced search function
    const debouncedSearch = useCallback(
        debounce((text) => {
            if (text.length === 0) {
                setSuggestions([]);
                return;
            }

            // Check cache first
            if (routeSuggestionsCache[text]) {
                setSuggestions(routeSuggestionsCache[text]);
                return;
            }

            // Get combined routes
            const combinedRoutes = processRoutes(allRoutes);

            // Filter routes
            const matches = combinedRoutes
                .filter(route =>
                    route.route.toLowerCase().startsWith(text.toLowerCase())
                )
                .slice(0, 3); // Limit to 3 suggestions

            // Cache results
            routeSuggestionsCache[text] = matches;
            setSuggestions(matches);
        }, 150),
        [allRoutes, processRoutes]
    );

    useEffect(() => {
        Animated.timing(suggestionsOpacity, {
            toValue: showSuggestions ? 1 : 0,
            duration: 200,
            useNativeDriver: true
        }).start();
    }, [showSuggestions]);

    const handleRouteChange = (text) => {
        const formattedText = text.toUpperCase().replace(/\s+/g, '');
        const validText = formattedText.replace(/[^A-Z0-9]/g, '');
        const truncatedText = validText.slice(0, 4);

        setBusRoute(truncatedText);
        setShowSuggestions(truncatedText.length > 0);
        debouncedSearch(truncatedText);
    };

    const handleSuggestionPress = (route) => {
        setBusRoute(route);
        setShowSuggestions(false);
        Keyboard.dismiss();
        onSearch(route);
    };

    const isCircularRoute = (direction) => {
        const origin = direction.orig_en;
        const destination = direction.dest_en;
        return destination.includes('CIRCULAR') || origin === destination;
    };

    const renderRouteTermini = (directions) => {
        if (directions.length === 0) return null;

        // Check if it's a circular route
        if (isCircularRoute(directions[0])) {
            return (
                <Text style={styles.suggestionDest}>
                    {getLocalizedText({
                        en: directions[0].orig_en,
                        tc: directions[0].orig_tc,
                        sc: directions[0].orig_sc
                    })}
                </Text>
            );
        }

        // For two-way routes
        if (directions.length === 2) {
            return (
                <Text style={styles.suggestionDest}>
                    {getLocalizedText({
                        en: directions[0].orig_en,
                        tc: directions[0].orig_tc,
                        sc: directions[0].orig_sc
                    })}
                    <Text style={styles.suggestionArrow}> ↔ </Text>
                    {getLocalizedText({
                        en: directions[0].dest_en,
                        tc: directions[0].dest_tc,
                        sc: directions[0].dest_sc
                    })}
                </Text>
            );
        }

        // For one-way routes
        return (
            <Text style={styles.suggestionDest}>
                {getLocalizedText({
                    en: directions[0].orig_en,
                    tc: directions[0].orig_tc,
                    sc: directions[0].orig_sc
                })}
                <Text style={styles.suggestionArrow}> → </Text>
                {getLocalizedText({
                    en: directions[0].dest_en,
                    tc: directions[0].dest_tc,
                    sc: directions[0].dest_sc
                })}
            </Text>
        );
    };

    return (
        <View style={styles.searchContainer}>
            <View style={styles.searchInputWrapper}>
                <View style={styles.searchInputContainer}>
                    <MaterialIcons
                        name="search"
                        size={18}
                        color="#666666"
                        style={styles.searchIcon}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Enter route number"
                        value={busRoute}
                        onChangeText={handleRouteChange}
                        onFocus={() => {
                            if (busRoute) {
                                setShowSuggestions(true);
                                debouncedSearch(busRoute);
                            }
                        }}
                        autoCapitalize="characters"
                        maxLength={4}
                    />
                    {busRoute.length > 0 && (
                        <TouchableOpacity
                            onPress={() => {
                                setBusRoute('');
                                setSuggestions([]);
                                setShowSuggestions(false);
                            }}
                            style={styles.clearButton}
                        >
                            <MaterialIcons name="close" size={18} color="#666666" />
                        </TouchableOpacity>
                    )}
                </View>
                <TouchableOpacity
                    style={[
                        styles.searchButton,
                        (!busRoute || loading) && styles.searchButtonDisabled
                    ]}
                    onPress={() => {
                        setShowSuggestions(false);
                        onSearch();
                    }}
                    disabled={!busRoute || loading}
                >
                    <MaterialIcons name="search" size={20} color="#ffffff" />
                </TouchableOpacity>
            </View>

            {/* Suggestions dropdown remains the same */}
            {showSuggestions && suggestions.length > 0 && (
                <Animated.View
                    style={[
                        styles.suggestionsContainer,
                        { opacity: suggestionsOpacity }
                    ]}
                >
                    {suggestions.map((suggestion, index) => (
                        <TouchableOpacity
                            key={`${suggestion.route}-${index}`}
                            style={[
                                styles.suggestionItem,
                                index < suggestions.length - 1 && styles.suggestionItemBorder
                            ]}
                            onPress={() => handleSuggestionPress(suggestion.route)}
                        >
                            <Text style={styles.suggestionRoute}>
                                {suggestion.route}
                            </Text>
                            {renderRouteTermini(suggestion.directions)}
                        </TouchableOpacity>
                    ))}
                </Animated.View>
            )}
        </View>
    );
};

export default SearchBar;