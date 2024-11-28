// GenerateQR.js

import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
} from 'react-native';
import 'react-native-get-random-values'; // Must be first
import * as uuid from 'uuid';
import QRCode from 'react-native-qrcode-svg';

const BACKEND_URL = 'http://192.168.0.3:8080';

const GenerateQR = () => {
    const [sessionId, setSessionId] = useState('');
    const [welcomeMessage, setWelcomeMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isPolling, setIsPolling] = useState(false);
    const pollingIntervalRef = useRef(null); // To keep track of the polling interval

    useEffect(() => {
        console.log('useEffect triggered');

        // Generate a new Session ID when the app starts
        const newSessionId = uuid.v4();
        console.log('Generated new sessionId:', newSessionId);
        setSessionId(newSessionId);

        // Create a session on the backend
        createSessionOnBackend(newSessionId);

        // Cleanup on component unmount
        return () => {
            console.log('Component unmounted, clearing polling interval');
            if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current);
            }
        };
    }, []);

    /**
     * Creates a new session on the backend.
     * @param {string} newSessionId - The unique session ID.
     */
    const createSessionOnBackend = async (newSessionId) => {
        setIsLoading(true);
        try {
            const response = await fetch(`${BACKEND_URL}/kiosk/api/session`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ sessionId: newSessionId }),
            });

            if (response.ok) {
                console.log('Session created successfully');
                // Start polling for session status
                startPolling(newSessionId);
            } else {
                const errorText = await response.text();
                console.error('Failed to create session:', errorText);
                Alert.alert('Error', `Failed to create session: ${errorText}`);
            }
        } catch (error) {
            console.error('Error creating session:', error);
            Alert.alert('Error', 'Unable to create session on backend');
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Starts polling the backend for session status every 5 seconds.
     * @param {string} sessionId - The unique session ID.
     */
    const startPolling = (sessionId) => {
        if (isPolling) {
            // Prevent multiple polling intervals
            return;
        }

        setIsPolling(true);
        console.log('Starting to poll for session status');

        pollingIntervalRef.current = setInterval(async () => {
            try {
                const response = await fetch(`${BACKEND_URL}/kiosk/api/session/${sessionId}/status`);
                if (response.ok) {
                    const data = await response.json();
                    console.log('Polling response:', data);

                    if (data.status === 'connected') {
                        setWelcomeMessage(`Welcome ${data.user}`);
                        Alert.alert('Session Connected', `Welcome ${data.user}`);
                        stopPolling();
                    } else {
                        console.log('Session status:', data.status);
                    }
                } else if (response.status === 404) {
                    console.error('Session not found');
                    Alert.alert('Error', 'Session not found');
                    stopPolling();
                } else {
                    console.error('Polling failed with status:', response.status);
                }
            } catch (error) {
                console.error('Polling error:', error);
            }
        }, 2000); // Poll every 5 seconds
    };

    /**
     * Stops the polling interval.
     */
    const stopPolling = () => {
        if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
            setIsPolling(false);
            console.log('Stopped polling for session status');
        }
    };

    /**
     * Resets the session by generating a new session ID and restarting the process.
     */
    const resetSession = () => {
        const newSessionId = uuid.v4(); // Generate new UUID
        console.log('Generated new sessionId:', newSessionId);
        setSessionId(newSessionId);
        setWelcomeMessage('');
        stopPolling(); // Ensure any existing polling is stopped
        createSessionOnBackend(newSessionId);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Kiosk App</Text>
            {isLoading ? (
                <ActivityIndicator size="large" color="#0000ff" />
            ) : (
                <>
                    {welcomeMessage ? (
                        <Text style={styles.welcomeMessage}>{welcomeMessage}</Text>
                    ) : (
                        <>
                            <Text style={styles.subtitle}>Scan this QR Code:</Text>
                            {sessionId && (
                                <QRCode
                                    value={sessionId}
                                    size={200}
                                    backgroundColor="white"
                                    color="black"
                                />
                            )}
                            <Text style={styles.sessionId}>Session ID: {sessionId}</Text>
                        </>
                    )}
                </>
            )}
            <TouchableOpacity
                style={styles.resetButton}
                onPress={resetSession}
            >
                <Text style={styles.resetButtonText}>Generate New QR Code</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        backgroundColor: '#f9f9f9',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    subtitle: {
        fontSize: 18,
        marginBottom: 10,
    },
    sessionId: {
        fontSize: 14,
        color: '#888',
        marginTop: 10,
    },
    welcomeMessage: {
        fontSize: 20,
        color: 'green',
        fontWeight: 'bold',
    },
    resetButton: {
        marginTop: 20,
        backgroundColor: '#007BFF',
        padding: 10,
        borderRadius: 5,
    },
    resetButtonText: {
        color: '#fff',
        fontSize: 16,
    },
});

export default GenerateQR;
