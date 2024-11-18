import React from "react";
import { Text, View, StyleSheet, ImageBackground } from "react-native";

export default function Index() {
    return (
        <ImageBackground
            source={require("../assets/images/background1.png")}
            style={styles.background}
        >
            <View style={styles.overlay}>
                <Text style={styles.title}>Welcome to Smart Kiosk!</Text>
                <Text style={styles.subtitle}>Your journey begins here.</Text>
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
        color: "#fff",
        textAlign: "center",
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 18,
        color: "#ddd",
        textAlign: "center",
    },
});
