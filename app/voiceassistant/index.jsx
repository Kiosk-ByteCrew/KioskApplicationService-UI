import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ActivityIndicator, FlatList, Dimensions } from 'react-native';
import LottieView from 'lottie-react-native';
import { useLocalSearchParams } from 'expo-router';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';

const BACKEND_URL = 'http://192.168.0.3:8082'; // Update to your actual backend URL

// Dimensions for scaling on a 10-inch iPad
// A 10-inch iPad typically has a resolution like 2160x1620 or similar. We'll just use Dimensions for responsive UI.
const { width, height } = Dimensions.get('window');

export default function VoiceAssistant() {
    const { sessionId, user } = useLocalSearchParams();
    const [isRecording, setIsRecording] = useState(false);
    const [recording, setRecording] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [conversation, setConversation] = useState([]);
    const [itemsList, setItemsList] = useState([]);
    const [showFinalizeOrder, setShowFinalizeOrder] = useState(false);

    const start_conversation = true;

    useEffect(() => {
        requestPermissions();
    }, []);

    const requestPermissions = async () => {
        const { status } = await Audio.requestPermissionsAsync();
        if (status !== 'granted') {
            alert('You need to grant microphone permissions to use this feature.');
        }
    };

    const startRecording = async () => {
        try {
            setIsRecording(true);
            const { granted } = await Audio.requestPermissionsAsync();
            if (!granted) {
                alert('Microphone permission not granted');
                setIsRecording(false);
                return;
            }

            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
            });

            const newRecording = new Audio.Recording();
            await newRecording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
            await newRecording.startAsync();
            setRecording(newRecording);
        } catch (err) {
            console.error('startRecording error:', err);
            setIsRecording(false);
        }
    };

    const stopRecording = async () => {
        setIsRecording(false);
        if (!recording) return;
        try {
            await recording.stopAndUnloadAsync();
            const uri = recording.getURI();
            console.log('Recording stopped. File stored at:', uri);
            setRecording(null);
            await uploadAudio(uri);
        } catch (err) {
            console.error('stopRecording error:', err);
        }
    };

    const uploadAudio = async (uri) => {
        setUploading(true);
        const message = '';

        let formData = new FormData();
        formData.append('file', {
            uri,
            type: 'audio/m4a',
            name: 'recorded_audio.m4a',
        });
        formData.append('session_id', sessionId);
        formData.append('message', message);
        formData.append('start_conversation', start_conversation ? 'true' : 'false');

        try {
            const response = await fetch(`${BACKEND_URL}/kiosk-comm/api/conversation/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'multipart/form-data; ',
                },
                body: formData,
            });

            const data = await response.json();
            console.log('Response:', data);

            handleApiResponse(data);
        } catch (err) {
            console.error('uploadAudio error:', err);
        } finally {
            setUploading(false);
        }
    };

    const handleApiResponse = (data) => {
        const { promptMessage } = data;
        const { prompt_response, action = {} } = data.data || {};
        const { add_item_id, finalize_order } = action;

        if (promptMessage) {
            setConversation(prev => [...prev, { role: 'user', text: promptMessage }]);
        }

        if (prompt_response) {
            setConversation(prev => [...prev, { role: 'assistant', text: prompt_response }]);
        }

        if (add_item_id) {
            setItemsList(prevItems => [...prevItems, add_item_id]);
        }

        if (finalize_order === 1) {
            setShowFinalizeOrder(true);
        } else {
            setShowFinalizeOrder(false);
        }
    };

    const placeOrder = () => {
        alert(`Placing order for items: ${itemsList.join(', ')}`);
        // Reset logic if needed
    };

    const renderMessage = ({ item }) => {
        const isUser = item.role === 'user';
        return (
            <View style={[styles.messageContainer, isUser ? styles.userMessage : styles.assistantMessage]}>
                <Text style={[styles.messageText, isUser ? styles.userText : styles.assistantText]}>{item.text}</Text>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>AI Voice Assistant</Text>
                <Text style={styles.sessionIdText}>Session: {sessionId}</Text>
            </View>

            <View style={styles.conversationWrapper}>
                <FlatList
                    data={conversation}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={renderMessage}
                    contentContainerStyle={styles.conversationList}
                />
            </View>

            {/* Status Display: Recording or Idle */}
            <View style={styles.assistantArea}>
                {isRecording || uploading ? (
                    <LottieView
                        source={require('../../assets/animation/voiceAnimation1.json')}
                        autoPlay
                        loop
                        style={styles.animation}
                    />
                ) : (
                    <Image source={require('../../assets/images/assistant.png')} style={styles.assistantImage} />
                )}
            </View>

            {/* Recording Controls */}
            <View style={styles.controlsContainer}>
                {isRecording ? (
                    <TouchableOpacity style={styles.stopButton} onPress={stopRecording}>
                        <Text style={styles.stopButtonText}>Stop Recording</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity style={styles.recordButton} onPress={startRecording}>
                        <Text style={styles.recordButtonText}>Record</Text>
                    </TouchableOpacity>
                )}
            </View>

            {uploading && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#007BFF" />
                    <Text style={styles.loadingText}>Processing your voice input...</Text>
                </View>
            )}

            {showFinalizeOrder && (
                <View style={styles.finalizeContainer}>
                    <TouchableOpacity style={styles.placeOrderButton} onPress={placeOrder}>
                        <Text style={styles.placeOrderButtonText}>Place Order</Text>
                    </TouchableOpacity>
                </View>
            )}

            {itemsList.length > 0 && (
                <View style={styles.itemsListContainer}>
                    <Text style={styles.itemsListTitle}>Items Added to Order:</Text>
                    <Text style={styles.itemsListText}>{itemsList.join(', ')}</Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FAFAFA',
        paddingHorizontal: width * 0.05,
        paddingTop: height * 0.05,
    },
    header: {
        marginBottom: height * 0.03,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    sessionIdText: {
        fontSize: 16,
        color: '#888',
    },
    conversationWrapper: {
        flex: 3,
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        padding: 10,
        marginBottom: height * 0.03,
        borderColor: '#CCC',
        borderWidth: 1,
    },
    conversationList: {
        paddingVertical: 10,
    },
    messageContainer: {
        padding: 12,
        marginVertical: 8,
        borderRadius: 20,
        maxWidth: '80%',
    },
    userMessage: {
        alignSelf: 'flex-end',
        backgroundColor: '#007BFF',
    },
    assistantMessage: {
        alignSelf: 'flex-start',
        backgroundColor: '#E5E5EA',
    },
    messageText: {
        fontSize: 18,
    },
    userText: {
        color: '#fff',
    },
    assistantText: {
        color: '#000',
    },
    assistantArea: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: height * 0.02,
    },
    assistantImage: {
        width: 120,
        height: 120,
        resizeMode: 'contain',
    },
    animation: {
        width: 200,
        height: 200,
    },
    controlsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: height * 0.02,
    },
    recordButton: {
        backgroundColor: '#D9534F',
        paddingVertical: 20,
        paddingHorizontal: 40,
        borderRadius: 50,
    },
    recordButtonText: {
        color: '#fff',
        fontSize: 20,
        fontWeight: '600',
    },
    stopButton: {
        backgroundColor: '#007BFF',
        paddingVertical: 20,
        paddingHorizontal: 40,
        borderRadius: 50,
    },
    stopButtonText: {
        color: '#fff',
        fontSize: 20,
        fontWeight: '600',
    },
    loadingContainer: {
        alignItems: 'center',
        marginBottom: height * 0.02,
    },
    loadingText: {
        marginTop: 10,
        fontSize: 18,
        color: '#555',
    },
    finalizeContainer: {
        alignItems: 'center',
        marginBottom: height * 0.03,
    },
    placeOrderButton: {
        backgroundColor: 'green',
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 10,
    },
    placeOrderButtonText: {
        color: '#fff',
        fontSize: 20,
        fontWeight: '600',
    },
    itemsListContainer: {
        backgroundColor: '#EFEFEF',
        padding: 15,
        borderRadius: 10,
        marginTop: height * 0.02,
    },
    itemsListTitle: {
        fontWeight: 'bold',
        fontSize: 20,
        marginBottom: 10,
        color: '#333',
    },
    itemsListText: {
        fontSize: 18,
        color: '#333',
    },
});
