import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    container: {
        marginBottom: 8,
    },
    header: {
        backgroundColor: '#ffffff',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
        paddingTop: 8,
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
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingBottom: 8,
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
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333333',
    },
    searchTypeContainer: {
        flexDirection: 'row',
        padding: 8,
        backgroundColor: '#ffffff',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
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
    searchTypeText: {
        fontSize: 16,
        color: '#666666',
    },
    searchTypeTextActive: {
        color: '#0066cc',
        fontWeight: '500',
    },
    searchContainer: {
        padding: 8,
        zIndex: 1000,
    },
    searchInputContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
        paddingHorizontal: 8,
    },
    searchInputWrapper: {
        flexDirection: 'row',
        gap: 8,
    },
    searchIcon: {
        paddingRight: 4,
    },
    input: {
        flex: 1,
        height: 36,
        fontSize: 15,
        color: '#333333',
    },
    clearButton: {
        padding: 4,
    },
    suggestionsContainer: {
        position: 'absolute',
        top: 52,
        left: 8,
        right: 8,
        backgroundColor: '#ffffff',
        borderRadius: 8,
        elevation: 4,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        zIndex: 1000,
    },
    suggestionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        gap: 8,
    },
    suggestionItemBorder: {
        borderBottomWidth: 1,
        borderBottomColor: '#eeeeee',
    },
    suggestionRoute: {
        fontSize: 16,
        fontWeight: '600',
        color: '#0066cc',
        minWidth: 45,
    },
    suggestionDest: {
        fontSize: 14,
        color: '#666666',
        flex: 1,
    },
    suggestionArrow: {
        color: '#0066cc',
        fontWeight: '600',
        paddingHorizontal: 4,
    },
    suggestionDest: {
        fontSize: 14,
        color: '#666666',
        flex: 1,
    },
    searchButton: {
        backgroundColor: '#0066cc',
        width: 36,
        height: 36,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    searchButtonText: {
        color: '#ffffff',
        fontWeight: 'bold',
    },
    searchButtonDisabled: {
        backgroundColor: '#cccccc',
    },
    loader: {
        marginTop: 24,
    },
    routeInfo: {
        backgroundColor: '#ffffff',
        padding: 12,
        marginHorizontal: 16,
        borderRadius: 8,
        marginBottom: 8,
    },
    routeInfoText: {
        fontSize: 16,
        color: '#333333',
    },
    listContainer: {
        padding: 16,
        paddingTop: 8,
    },
    stopItem: {
        backgroundColor: '#ffffff',
        borderRadius: 8,
        elevation: 2,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        borderWidth: 2,
        borderColor: 'transparent'
    },
    stopHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    stopSequence: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333333',
    },
    destination: {
        fontSize: 14,
        color: '#666666',
        textAlign: 'right',
        flex: 0.4,
    },
    etaContainer: {
        gap: 4,
    },
    etaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingVertical: 2,
    },
    etaTime: {
        fontSize: 14,
        fontWeight: '500',
    },
    etaRemark: {
        fontSize: 12,
        color: '#666666',
        fontStyle: 'italic',
    },
    noEta: {
        color: '#999999',
        fontStyle: 'italic',
        fontSize: 14,
    },
    nearbyContainer: {
        flex: 1,
    },
    nearbyHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        paddingBottom: 8,
    },
    actionsContainer: {
        width: 70,
        borderLeftWidth: 1,
        borderLeftColor: '#e0e0e0',
        paddingLeft: 8,
        gap: 8,
    },
    actionButton: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 8,
        borderRadius: 8,
        backgroundColor: '#f0f7ff',
    },
    actionButtonActive: {
        backgroundColor: '#e0e9f7',
    },
    actionButtonText: {
        fontSize: 12,
        color: '#0066cc',
        marginTop: 4,
    },
    nearbyTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333333',
    },
    refreshButton: {
        padding: 8,
    },
    nearbyStopItem: {
        backgroundColor: '#ffffff',
        borderRadius: 8,
        padding: 16,
        marginBottom: 8,
        elevation: 2,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    nearbyStopHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    nearbyStopName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333333',
        flex: 1,
    },
    nearbyStopDistance: {
        fontSize: 14,
        color: '#666666',
        backgroundColor: '#f0f0f0',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    routesScroll: {
        flexGrow: 0,
    },
    nearbyRouteItem: {
        backgroundColor: '#f0f7ff',
        borderRadius: 8,
        padding: 12,
        marginRight: 8,
        minWidth: 100,
        alignItems: 'center',
    },
    
    nearbyRouteNumber: {
        fontSize: 16,
        fontWeight: '600',
        color: '#0066cc',
        marginBottom: 4,
    },
    nearbyRouteEta: {
        fontSize: 14,
        color: '#666666',
    },
    noRoutes: {
        color: '#999999',
        fontStyle: 'italic',
        padding: 8,
    },
    errorText: {
        color: '#ff3b30',
        textAlign: 'center',
        margin: 16,
    },
    stopInfo: {
        flex: 1,
        marginRight: 8,
    },
    stopName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333333',
        marginBottom: 4,
    },
    stopSequence: {
        fontSize: 12,
        color: '#666666',
    },
    stopHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    destination: {
        fontSize: 14,
        color: '#666666',
        textAlign: 'right',
    },
    searchButtonDisabled: {
        backgroundColor: '#cccccc',
    },
    directionToggle: {
        backgroundColor: '#ffffff',
        marginHorizontal: 16,
        marginVertical: 8,
        borderRadius: 12,
        padding: 12,
        elevation: 2,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    directionToggleDisabled: {
        opacity: 0.6,
    },
    directionContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    directionTextContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    directionPrimary: {
        fontSize: 14,
        color: '#333333',
        fontWeight: '500',
    },
    directionArrow: {
        marginHorizontal: 4,
    },
    toggleIconContainer: {
        backgroundColor: '#f0f7ff',
        padding: 8,
        borderRadius: 8,
        marginLeft: 12,
    },
    routeHeader: {
        backgroundColor: '#ffffff',
        marginHorizontal: 16,
        marginVertical: 8,
        borderRadius: 12,
        padding: 16,
        elevation: 2,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    routeHeaderDisabled: {
        opacity: 0.6,
    },
    routeHeaderClickable: {
        backgroundColor: '#f8f9fa',
    },
    routeContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    routeNumber: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#0066cc',
        minWidth: 50,
    },
    routeDirectionContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 12,
        gap: 8,
    },
    routeTerminal: {
        fontSize: 14,
        color: '#333333',
        flex: 1,
        textAlign: 'center',
    },
    directionArrow: {
        marginHorizontal: 4,
    },
    toggleIcon: {
        backgroundColor: '#e8f2ff',
        padding: 8,
        borderRadius: 8,
        marginLeft: 8,
    },
    nearbyRouteItem: {
        backgroundColor: '#f0f7ff',
        borderRadius: 8,
        padding: 12,
        marginRight: 8,
        minWidth: 100,
        alignItems: 'center',
        // Add pressed state feedback
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1,
        elevation: 2,
    },
    selectedStopItem: {
        backgroundColor: '#f0f7ff',
        borderColor: '#0066cc',
    },
    contentWrapper: {
        flexDirection: 'row',
    },
    mainContent: {
        flex: 1,
        paddingRight: 8,
    },
    etaTime: {
        fontSize: 14,
        fontWeight: '500',
    },
    etaRemark: {
        fontSize: 12,
        color: '#666666',
        fontStyle: 'italic',
    },
    etaRemarkDeparted: {
        color: '#999999',
    },
    noEta: {
        color: '#999999',
        fontStyle: 'italic',
        fontSize: 14,
    },
    etaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingVertical: 2,
    },
    nearbyStopContent: {
        flex: 1,
    },

    mapContainer: {
        overflow: 'hidden',
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
        marginTop: 8,
        width: '100%',
    },

    map: {
        width: '100%',
        height: '100%',
    },

    busStopMarker: {
        backgroundColor: '#ffffff',
        borderRadius: 20,
        padding: 4,
        borderWidth: 2,
        borderColor: '#0066cc',
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },

    expandButton: {
        alignSelf: 'center',
        padding: 4,
        marginTop: 4,
    },

    expandButtonActive: {
        backgroundColor: '#f0f0f0',
        borderRadius: 12,
    },
    offlineBanner: {
        backgroundColor: '#ff9800',
        padding: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    offlineText: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: '500',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#ffffff',
    },
    errorTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#dc2626',
        marginBottom: 8,
    },
    errorMessage: {
        fontSize: 16,
        color: '#666666',
        textAlign: 'center',
        marginBottom: 16,
    },
    retryButton: {
        backgroundColor: '#0066cc',
        paddingHorizontal: 16,
    },
    streetViewButtonPosition: {
        position: 'absolute',
        bottom: 16,
        right: 16,
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    menuButton: {
        padding: 4,
        borderRadius: 4,
    },
    searchTypeContainer: {
        flexDirection: 'row',
        padding: 8,
        backgroundColor: '#ffffff',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
        justifyContent: 'space-around',
    },
    searchTypeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
        borderRadius: 8,
        gap: 8,
    },
    searchTypeButtonActive: {
        backgroundColor: '#f0f7ff',
    },
    searchTypeText: {
        fontSize: 16,
        color: '#666666',
    },
    searchTypeTextActive: {
        color: '#0066cc',
        fontWeight: '500',
    },
});