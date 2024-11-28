import React from "react";
import { Text, View, StyleSheet, TouchableOpacity, ImageBackground } from "react-native";
import { useRouter } from "expo-router";

export default function Index() {
    const router = useRouter();

    // @ts-ignore
    // @ts-ignore
    return (
        <ImageBackground
            source={require("../assets/images/backgroundi.jpg")}
            style={styles.background}
        >
            <View style={styles.overlay}>
                <Text style={styles.title}>Welcome to Smart Kiosk!</Text>
                <Text style={styles.subtitle}>Your journey begins here.</Text>
                <TouchableOpacity
                    style={[styles.button, styles.getStartedButton]}
                    onPress={() => router.push("/dashboard")}
                >
                    <Text style={styles.buttonText}>Get Started</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.button, styles.qrButton]}
                    onPress={() => router.push("/qrscreen")}
                >
                    <Text style={styles.buttonText}>Generate QR Code</Text>
                </TouchableOpacity>
            </View>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    background: {
        flex: 1,
        resizeMode: "cover", // Ensures the image covers the screen
        justifyContent: "center",
    },
    overlay: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)", // Dark overlay for better text readability
    },
    title: {
        fontSize: 32,
        fontWeight: "bold",
        color: "#fcfafa",
        textAlign: "center",
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 18,
        color: "#ddd", // Lighter text for better visibility
        textAlign: "center",
        marginBottom: 20,
    },
    button: {
        width: 200, // Ensures both buttons have the same width
        paddingVertical: 10,
        borderRadius: 5,
        alignItems: "center",
        marginBottom: 15, // Spacing between the two buttons
    },
    getStartedButton: {
        backgroundColor: "#FF6347", // Bold orange for "Get Started"
    },
    qrButton: {
        backgroundColor: "#F9881F", // Lighter orange for "Generate QR Code"
    },
    buttonText: {
        fontSize: 16,
        color: "#fff",
        fontWeight: "bold",
    },
});
