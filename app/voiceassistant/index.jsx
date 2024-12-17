import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ActivityIndicator, FlatList } from 'react-native';
import LottieView from 'lottie-react-native';
import { useLocalSearchParams } from 'expo-router';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';

const BACKEND_URL = 'http://192.168.0.3:8082'; // Update to your actual backend URL

export default function VoiceAssistant() {
    const { sessionId, user } = useLocalSearchParams();
    console.log("-------------------------Session Id------------------------------");
    console.log(sessionId);
    console.log("-------------------------User------------------------------");
    console.log(user);

    const [isRecording, setIsRecording] = useState(false);
    const [recording, setRecording] = useState(null);
    const [uploading, setUploading] = useState(false);

    // Conversation: an array of objects { role: 'user'|'assistant', text: string }
    const [conversation, setConversation] = useState([]);
    const [itemsList, setItemsList] = useState([]);
    const [showFinalizeOrder, setShowFinalizeOrder] = useState(false);

    // We can assume this might be the first conversation, so:
    const start_conversation = true;
    // If you have logic to handle multiple turns, you can track this state.

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
            // Once we have the audio file URI, we upload it to the server as form data.
            await uploadAudio(uri);
        } catch (err) {
            console.error('stopRecording error:', err);
        }
    };

    const uploadAudio = async (uri) => {
        setUploading(true);
        // message can be empty or some placeholder if not required by your API
        const message = '';

        let formData = new FormData();
        formData.append('file', {
            uri,
            type: 'audio/m4a', // Adjust if your format differs
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
        // Example response structure:
        // {
        //   "promptMessage": "Hey, can you suggest me some burgers?",
        //   "data": {
        //     "session_id": "abc3123456123",
        //     "prompt_response": "Sure ... Which one?",
        //     "action": {
        //       "general": 1,
        //       "add_item_id": "d2",
        //       "finalize_order": 1
        //     }
        //   }
        // }

        const { promptMessage } = data;
        const { prompt_response, action = {} } = data.data || {};
        const { add_item_id, finalize_order } = action;

        // Add user message to conversation
        if (promptMessage) {
            setConversation(prev => [...prev, { role: 'user', text: promptMessage }]);
        }

        // Add assistant response to conversation
        if (prompt_response) {
            setConversation(prev => [...prev, { role: 'assistant', text: prompt_response }]);
        }

        // If there's an add_item_id, add it to the itemsList
        if (add_item_id) {
            setItemsList(prevItems => [...prevItems, add_item_id]);
        }

        // If finalize_order is present and equals 1, show the place order button
        if (finalize_order === 1) {
            setShowFinalizeOrder(true);
        } else {
            setShowFinalizeOrder(false);
        }
    };

    const placeOrder = () => {
        // Implement order placing logic here
        alert(`Placing order for items: ${itemsList.join(', ')}`);
        // Reset conversation or itemsList if needed
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
            <Text style={styles.sessionIdText}>Session ID: {sessionId}</Text>
            <Text style={styles.greetingText}>Hello, I am your AI assistant.</Text>

            <View style={styles.conversationWrapper}>
                <FlatList
                    data={conversation}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={renderMessage}
                />
            </View>

            {isRecording || uploading ? (
                <LottieView
                    source={require('../../assets/animation/voiceAnimation1.json')}
                    autoPlay
                    loop
                    style={{ width: 200, height: 200 }}
                />
            ) : (
                <Image source={require('../../assets/images/assistant.png')} style={{ width: 100, height: 100 }} />
            )}

            {isRecording ? (
                <TouchableOpacity style={styles.stopButton} onPress={stopRecording}>
                    <Text style={styles.stopButtonText}>Stop Recording</Text>
                </TouchableOpacity>
            ) : (
                <TouchableOpacity style={styles.recordButton} onPress={startRecording}>
                    <Text style={styles.recordButtonText}>Record</Text>
                </TouchableOpacity>
            )}

            {uploading && <ActivityIndicator size="large" color="#0000ff" />}

            {showFinalizeOrder && (
                <TouchableOpacity style={styles.placeOrderButton} onPress={placeOrder}>
                    <Text style={styles.placeOrderButtonText}>Place Order</Text>
                </TouchableOpacity>
            )}

            {itemsList.length > 0 && (
                <View style={styles.itemsListContainer}>
                    <Text style={styles.itemsListTitle}>Items Added:</Text>
                    <Text>{itemsList.join(', ')}</Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9f9f9',
        padding: 20,
        paddingTop: 60,
    },
    sessionIdText: {
        position: 'absolute',
        top: 40,
        fontSize: 12,
        color: '#888',
        alignSelf: 'center'
    },
    greetingText: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    conversationWrapper: {
        flex: 1,
        marginBottom: 20,
    },
    messageContainer: {
        padding: 10,
        marginVertical: 5,
        borderRadius: 10,
        maxWidth: '80%'
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
        fontSize: 16,
    },
    userText: {
        color: '#fff'
    },
    assistantText: {
        color: '#000'
    },
    recordButton: {
        backgroundColor: 'red',
        padding: 15,
        borderRadius: 50,
        alignItems: 'center',
        marginBottom: 20,
    },
    recordButtonText: {
        color: '#fff',
        fontSize: 16,
    },
    stopButton: {
        backgroundColor: '#007BFF',
        padding: 15,
        borderRadius: 50,
        alignItems: 'center',
        marginBottom: 20,
    },
    stopButtonText: {
        color: '#fff',
        fontSize: 16,
    },
    placeOrderButton: {
        backgroundColor: 'green',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginBottom: 20,
    },
    placeOrderButtonText: {
        color: '#fff',
        fontSize: 16,
    },
    itemsListContainer: {
        marginTop: 10,
        backgroundColor: '#EFEFEF',
        padding: 10,
        borderRadius: 5,
    },
    itemsListTitle: {
        fontWeight: 'bold',
        marginBottom: 5,
    },
});
