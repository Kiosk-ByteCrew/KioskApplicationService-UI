import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Dimensions, ScrollView } from 'react-native';
import LottieView from 'lottie-react-native';
import {useLocalSearchParams, useRouter} from 'expo-router';
import { Audio } from 'expo-av';

const BACKEND_URL = 'http://192.168.0.3:8082';
const { width, height } = Dimensions.get('window');

// Import Menu JSON
const menu = {
    categories: {
        burgers: [
            { id: 'b1', name: 'Veg Burger', price: 5.99 },
            { id: 'b2', name: 'Chicken Burger', price: 6.99 },
            { id: 'b3', name: 'Beef Burger', price: 7.99 }
        ],
        pizzas: [
            { id: 'p1', name: 'Margherita', price: 8.99 },
            { id: 'p2', name: 'Pepperoni', price: 9.99 }
        ],
        drinks: [
            { id: 'd1', name: 'Coke', price: 1.99 },
            { id: 'd2', name: 'Orange Juice', price: 2.49 }
        ]
    }
};

export default function VoiceAssistant() {
    const { sessionId, user } = useLocalSearchParams();
    const [isRecording, setIsRecording] = useState(false);
    const [isTalking, setIsTalking] = useState(false); // Animation state
    const [recording, setRecording] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [conversation, setConversation] = useState([]);
    const [cart, setCart] = useState([]);
    const [typing, setTyping] = useState(false);
    const [showPlaceOrder, setShowPlaceOrder] = useState(false);
    const router = useRouter();

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
        setIsTalking(true); // Start animation
        setIsRecording(true);

        const { granted } = await Audio.requestPermissionsAsync();
        if (!granted) return alert('Microphone permission not granted');

        await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });

        const newRecording = new Audio.Recording();
        await newRecording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
        await newRecording.startAsync();
        setRecording(newRecording);
    };

    const stopRecording = async () => {
        setIsTalking(false); // Stop animation
        setIsRecording(false);

        if (!recording) return;
        await recording.stopAndUnloadAsync();
        const uri = recording.getURI();
        await uploadAudio(uri);
        setRecording(null);
    };

    const uploadAudio = async (uri) => {
        setUploading(true);
        let formData = new FormData();
        formData.append('file', { uri, type: 'audio/m4a', name: 'recorded_audio.m4a' });
        formData.append('session_id', sessionId);
        formData.append('start_conversation', 'true');

        try {
            const response = await fetch(`${BACKEND_URL}/kiosk-comm/api/conversation/`, {
                method: 'POST',
                headers: { 'Content-Type': 'multipart/form-data' },
                body: formData,
            });

            const data = await response.json();
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

        if (add_item_id) {
            const item = findMenuItem(add_item_id);
            if (item) {
                setCart(prev => [...prev, item]);
            }
        }

        if (finalize_order === 1) {
            setShowPlaceOrder(true);
        }

        if (prompt_response) {
            setTyping(true);
            setTimeout(() => {
                setTyping(false);
                setConversation(prev => [...prev, { role: 'assistant', text: prompt_response }]);
            }, 2000);
        }
    };

    const findMenuItem = (id) => {
        for (let category in menu.categories) {
            const item = menu.categories[category].find((i) => i.id === id);
            if (item) return item;
        }
        return null;
    };

    const calculateTotal = () => {
        return cart.reduce((total, item) => total + item.price, 0).toFixed(2);
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
            <Text style={styles.header}>AI Voice Assistant</Text>
            <View style={styles.content}>
                <FlatList
                    data={typing ? [...conversation, { role: 'assistant', typing: true }] : conversation}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item }) =>
                        item.typing ? (
                            <View style={[styles.messageContainer, styles.assistantMessage]}>
                                <LottieView
                                    source={require('../../assets/animation/Typing.json')}
                                    autoPlay
                                    loop
                                    style={styles.typingAnimation}
                                />
                            </View>
                        ) : (
                            renderMessage({ item })
                        )
                    }
                    contentContainerStyle={styles.conversationList}
                />

                <View style={styles.cart}>
                    <Text style={styles.cartTitle}>Your Cart</Text>
                    <ScrollView>
                        {cart.map((item, index) => (
                            <View key={index} style={styles.cartItem}>
                                <Text>{item.name}</Text>
                                <Text>${item.price.toFixed(2)}</Text>
                            </View>
                        ))}
                    </ScrollView>
                    <Text style={styles.total}>Total: ${calculateTotal()}</Text>
                    {showPlaceOrder && (
                        <TouchableOpacity
                            style={styles.placeOrderButton}
                            onPress={async () => {
                                const payload = {
                                    userName: user,
                                    restaurantId: 100,          // Replace with actual restaurant ID
                                    tenantId: 607,              // Replace with actual tenant ID
                                    status: "PENDING",
                                    itemDetails: cart.map((item) => ({
                                        itemId: item.id,       // Assuming item.id matches the API
                                        itemName: item.name,
                                        quantity: 1,           // Default quantity set to 1
                                        price: item.price
                                    }))
                                };

                                try {
                                    /*const response = await fetch(`${BACKEND_URL}/kiosk-comm/api/orders/place`, {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify(payload),
                                    });*/

                                    if (true) {
                                        console.log("Order placed successfully");
                                        router.push({
                                            pathname: '/confirmation',
                                            params: { cart: JSON.stringify(cart), total: calculateTotal() }
                                        });
                                    } else {
                                        console.error("Failed to place order");
                                        alert("Error: Failed to place order");
                                    }
                                } catch (error) {
                                    console.error("Error placing order:", error);
                                    alert("An unexpected error occurred. Please try again.");
                                }
                            }}
                        >
                            <Text style={styles.buttonText}>Place Order</Text>
                        </TouchableOpacity>

                    )}
                </View>
            </View>

            <View style={styles.controls}>
                {isTalking && (
                    <LottieView
                        source={require('../../assets/animation/voiceAnimation1.json')}
                        autoPlay
                        loop
                        style={styles.voiceAnimation}
                    />
                )}

                {isRecording ? (
                    <TouchableOpacity style={styles.stopButton} onPress={stopRecording}>
                        <Text style={styles.buttonText}>Stop</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity style={styles.recordButton} onPress={startRecording}>
                        <Text style={styles.buttonText}>Talk with AI</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F8F8', padding: 10 },
    header: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 10 },
    content: { flex: 1, flexDirection: 'row' },
    conversationList: { flex: 3, padding: 10 },
    messageContainer: { padding: 10, borderRadius: 10, marginVertical: 5, maxWidth: '80%' },
    userMessage: { alignSelf: 'flex-end', backgroundColor: '#007BFF' },
    assistantMessage: { alignSelf: 'flex-start', backgroundColor: '#E0E0E0' },
    messageText: { fontSize: 16 },
    userText: { color: '#FFF' },
    assistantText: { color: '#000' },
    typingAnimation: { width: 100, height: 40, alignSelf: 'flex-start' },
    cart: { width: 250, backgroundColor: '#FFF', padding: 10, borderRadius: 10, marginLeft: 10, elevation: 3 },
    cartTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
    cartItem: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
    total: { fontSize: 18, fontWeight: 'bold', marginTop: 10 },
    placeOrderButton: { backgroundColor: '#28A745', padding: 10, marginTop: 10, borderRadius: 5 },
    controls: { flexDirection: 'column', alignItems: 'center', marginTop: 10 },
    voiceAnimation: { width: 150, height: 150, marginBottom: 10 },
    recordButton: { backgroundColor: '#28A745', padding: 15, borderRadius: 30 },
    stopButton: { backgroundColor: '#DC3545', padding: 15, borderRadius: 30 },
    buttonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold', textAlign: 'center' },
});
