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
import { useNavigation } from '@react-navigation/native';
import {useRouter} from "expo-router";

const BACKEND_URL = 'http://192.168.0.3:8080';

const GenerateQR = () => {
    const [sessionId, setSessionId] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isPolling, setIsPolling] = useState(false);
    const [userName, setUserName] = useState(null); // Store the user's name here after successful scan
    const pollingIntervalRef = useRef(null);

    useEffect(() => {
        const newSessionId = uuid.v4();
        setSessionId(newSessionId);
        createSessionOnBackend(newSessionId);

        return () => {
            if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current);
            }
        };
    }, []);

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
                startPolling(newSessionId);
            } else {
                const errorText = await response.text();
                Alert.alert('Error', `Failed to create session: ${errorText}`);
            }
        } catch (error) {
            Alert.alert('Error', 'Unable to create session on backend');
        } finally {
            setIsLoading(false);
        }
    };

    const startPolling = (sessionId) => {
        if (isPolling) return;
        setIsPolling(true);

        pollingIntervalRef.current = setInterval(async () => {
            try {
                const response = await fetch(`${BACKEND_URL}/kiosk/api/session/${sessionId}/status`);
                if (response.ok) {
                    const data = await response.json();
                    if (data.status === 'connected') {
                        // Stop polling and store the user name
                        stopPolling();
                        setUserName(data.user);
                    }
                } else if (response.status === 404) {
                    Alert.alert('Error', 'Session not found');
                    stopPolling();
                }
            } catch (error) {
                console.error('Polling error:', error);
            }
        }, 2000);
    };

    const stopPolling = () => {
        if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
        }
        setIsPolling(false);
    };

    const resetSession = () => {
        const newSessionId = uuid.v4();
        setSessionId(newSessionId);
        setUserName(null);
        stopPolling();
        createSessionOnBackend(newSessionId);
    };

    const router = useRouter();
    const navigate = useNavigation();
    return (
        <View style={styles.container}>
            {userName ? (
                // If user is connected, show welcome info and sessionId
                <>
                    <Text style={styles.sessionIdText}>Session ID: {sessionId}</Text>
                    <Text style={styles.welcomeMessage}>Welcome {userName}</Text>
                    <TouchableOpacity
                        style={styles.assistantButton}
                        onPress={() => {
                            router.push({
                                pathname: "/voiceassistant",
                                params: {
                                    sessionId: sessionId,
                                    user: userName,
                                },
                            });
                        }}
                    >
                        <Text style={styles.assistantButtonText}>Start Voice Assistant</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.resetButton}
                        onPress={resetSession}
                    >
                        <Text style={styles.resetButtonText}>Generate New QR Code</Text>
                    </TouchableOpacity>
                </>
            ) : (
                // If user is not connected yet, show QR code
                <>
                    <Text style={styles.title}>Kiosk App</Text>
                    {isLoading ? (
                        <ActivityIndicator size="large" color="#0000ff" />
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
                    <TouchableOpacity
                        style={styles.resetButton}
                        onPress={resetSession}
                    >
                        <Text style={styles.resetButtonText}>Generate New QR Code</Text>
                    </TouchableOpacity>
                </>
            )}
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
    sessionIdText: {
        position: 'absolute',
        top: 40,
        fontSize: 12,
        color: '#888',
    },
    welcomeMessage: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        marginTop: 60, // to give space from the top sessionId
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
    assistantButton: {
        marginTop: 20,
        backgroundColor: '#28a745',
        padding: 10,
        borderRadius: 5,
    },
    assistantButtonText: {
        color: '#fff',
        fontSize: 16,
    },
});

export default GenerateQR;
