import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const TrafficInformation = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Traffic Information</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        padding: 16,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333333',
        marginBottom: 16,
    },
});

export default TrafficInformation;