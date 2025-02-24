import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import LottieView from 'lottie-react-native';

export default function Confirmation() {
    const router = useRouter();
    const { cart, total } = useLocalSearchParams(); // Fetch passed parameters

    // Parse the cart data
    const orderItems = cart ? JSON.parse(cart) : [];

    return (
        <View style={styles.container}>
            {/* Success Animation */}
            <LottieView
                source={require('../../assets/animation/success1.json')}
                autoPlay
                loop={true}
                style={styles.successAnimation}
            />

            {/* Confirmation Message */}
            <Text style={styles.header}>Order Confirmed!</Text>
            <Text style={styles.message}>
                Thank you for your order. Your food is being prepared and will be ready soon.
            </Text>

            {/* Summary */}
            <View style={styles.orderSummary}>
                <Text style={styles.summaryHeader}>Order Summary</Text>
                <ScrollView>
                    {orderItems.map((item, index) => (
                        <View key={index} style={styles.summaryItem}>
                            <Text style={styles.itemText}>
                                1 x {item.name}
                            </Text>
                            <Text style={styles.itemText}>${item.price.toFixed(2)}</Text>
                        </View>
                    ))}
                </ScrollView>

                <View style={styles.total}>
                    <Text style={styles.totalText}>Total:</Text>
                    <Text style={styles.totalText}>${total}</Text>
                </View>
            </View>

            {/* Back to Home Button */}
            <TouchableOpacity style={styles.homeButton} onPress={() => router.push('/')}>
                <Text style={styles.buttonText}>Back to Home</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F8F8', alignItems: 'center', justifyContent: 'center', padding: 20 },
    successAnimation: { width: 200, height: 200, marginBottom: 20 },
    header: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', color: '#28A745', marginBottom: 10 },
    message: { fontSize: 16, textAlign: 'center', color: '#555', marginBottom: 20 },
    orderSummary: {
        width: '100%',
        backgroundColor: '#FFF',
        padding: 15,
        borderRadius: 10,
        elevation: 2,
        marginBottom: 20,
    },
    summaryHeader: { fontSize: 20, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
    summaryItem: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 5 },
    itemText: { fontSize: 16, color: '#333' },
    total: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, borderTopWidth: 1, paddingTop: 10 },
    totalText: { fontSize: 18, fontWeight: 'bold', color: '#333' },
    homeButton: { backgroundColor: '#28A745', padding: 15, borderRadius: 10, width: '60%', alignItems: 'center' },
    buttonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
});
