import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button, ActivityIndicator } from 'react-native';

const BACKEND_URL = 'http://192.168.0.3:8082/health';

export default function HealthCheck() {
    const [status, setStatus] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const testHealthAPI = async () => {
        setLoading(true);
        setStatus('');
        setError('');

        try {
            const response = await fetch(BACKEND_URL, {
                method: 'GET',
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            setStatus(`API is healthy: ${JSON.stringify(data)}`);
            console.log('Health API Response:', data);
        } catch (err) {
            console.error('Error testing health API:', err.message);
            setError(`Failed to connect: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        testHealthAPI();
    }, []);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Health API Test</Text>

            {loading && <ActivityIndicator size="large" color="#0000ff" />}

            {status ? <Text style={styles.successText}>{status}</Text> : null}
            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <Button title="Retry Health Check" onPress={testHealthAPI} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#f5f5f5',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    successText: {
        color: 'green',
        fontSize: 16,
        marginTop: 10,
    },
    errorText: {
        color: 'red',
        fontSize: 16,
        marginTop: 10,
    },
});
