import React, { useRef } from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Image,
    TouchableOpacity,
    ScrollView,
    Animated,
} from "react-native";

const products = [
    {
        id: "1",
        name: "The Jalapeno Popper",
        description: "Mexican Chicken Burger topped with jalapeno-infused cream cheese.",
        price: "$17.99",
        rating: 4.4,
        image: require("./../../assets/images/food_products/burger1.png"),
    },
    {
        id: "2",
        name: "The Veggie Delight",
        description: "A veggie burger topped with cheddar, BBQ sauce, and fresh greens.",
        price: "$14.99",
        rating: 4.8,
        image: require("./../../assets/images/food_products/burger2.png"),
    },
    {
        id: "3",
        name: "The Baconator",
        description:
            "A savory chicken burger with black truffle cheese, crispy bacon, and truffle-infused mushrooms.",
        price: "$9.99",
        rating: 4.2,
        image: require("./../../assets/images/food_products/burger3.png"),
    },
    {
        id: "4",
        name: "The Virginia",
        description:
            "Classic burger with melted cheese and fresh onion on a soft bun.",
        price: "$12.99",
        rating: 4.3,
        image: require("./../../assets/images/food_products/burger4.png"),
    },
];

// Define the recommended products separately
const recommendedProducts = [
    {
        id: "101",
        name: "Vegetable Salad",
        description: "A healthy meal that tastes delicious as well!",
        price: "$10.99",
        rating: 4.5,
        image: require("./../../assets/images/food/product1.jpg"),
    },
    {
        id: "102",
        name: "Pizza with fries",
        description: "Pizza with lettuce and fries a product just for you.",
        price: "$12.99",
        rating: 4.6,
        image: require("./../../assets/images/food/product2.jpg"),
    },
    {
        id: "103",
        name: "Italian Pasta",
        description: "A popular choice among Italian food lovers.",
        price: "$9.49",
        rating: 4.7,
        image: require("./../../assets/images/food/product3.jpg"),
    },
    {
        id: "104",
        name: "Chicken Roll",
        description: "A delicious Pita stuffed with chicken and peppers.",
        price: "$11.49",
        rating: 4.8,
        image: require("./../../assets/images/food/product4.jpg"),
    },
];

const Dashboard = () => {
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const handleCartPress = () => {
        // Scale animation
        Animated.sequence([
            Animated.timing(scaleAnim, {
                toValue: 1.2,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 100,
                useNativeDriver: true,
            }),
        ]).start();
    };

    const renderProduct = ({ item }) => (
        <View style={styles.productCard}>
            <Image source={item.image} style={styles.productImage} />
            <Text style={styles.productName}>{item.name}</Text>
            <Text style={styles.productDescription} numberOfLines={2}>
                {item.description}
            </Text>
            <View style={styles.productDetails}>
                <Text style={styles.productRating}>
                    ⭐ {item.rating} <Text style={styles.reviewCount}>(120 reviews)</Text>
                </Text>
            </View>
            <View style={styles.priceAndButton}>
                <Text style={styles.productPrice}>{item.price}</Text>
                <TouchableOpacity style={styles.addButton}>
                    <Text style={styles.addButtonText}>+</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={{ flex: 1 }}>
            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                <Text style={styles.header}>Recommended for You</Text>
                <FlatList
                    data={recommendedProducts} // Use the new recommended products
                    renderItem={renderProduct}
                    keyExtractor={(item) => item.id}
                    horizontal
                    contentContainerStyle={styles.horizontalList}
                    showsHorizontalScrollIndicator={false}
                />
                <Text style={styles.header}>Menu - Burgers</Text>
                <FlatList
                    data={products} // Use the original products array
                    renderItem={renderProduct}
                    keyExtractor={(item) => item.id}
                    horizontal
                    contentContainerStyle={styles.horizontalList}
                    showsHorizontalScrollIndicator={false}
                />
            </ScrollView>
            {/* Cart Button */}
            <Animated.View
                style={[
                    styles.cartButton,
                    {
                        transform: [{ scale: scaleAnim }],
                    },
                ]}
            >
                <TouchableOpacity onPress={handleCartPress}>
                    <Image
                        source={require("./../../assets/images/cart.png")} // Replace with your cart image
                        style={styles.cartImage}
                    />
                </TouchableOpacity>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f8f8f8",
        padding: 16,
    },
    header: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 10,
    },
    horizontalList: {
        marginBottom: 20,
    },
    productCard: {
        backgroundColor: "#fff",
        borderRadius: 20,
        padding: 16,
        marginRight: 16,
        marginBottom: 16,
        width: 180,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 5,
        alignItems: "center",
    },
    productImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
        marginBottom: 10,
        resizeMode: "contain",
    },
    productName: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#333",
        textAlign: "center",
        marginBottom: 5,
    },
    productDescription: {
        fontSize: 12,
        color: "#666",
        textAlign: "center",
        marginBottom: 10,
    },
    productDetails: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
        alignItems: "center",
        marginBottom: 10,
    },
    priceAndButton: {
        flexDirection: "row", // Align price and button horizontally
        justifyContent: "space-between",
        alignItems: "center",
        width: "100%",
    },
    productRating: {
        fontSize: 12,
        color: "#666",
    },
    reviewCount: {
        fontSize: 12,
        color: "#888", // Lighter color for differentiation
    },
    productPrice: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#333",
    },
    addButton: {
        backgroundColor: "#FF6347",
        borderRadius: 15, // Ensure circular shape
        alignItems: "center",
        justifyContent: "center",
        width: 30, // Circle width
        height: 30, // Circle height
        marginLeft: 10, // Space between price and button
    },
    addButtonText: {
        fontSize: 16, // Font size of the "+"
        fontWeight: "bold",
        color: "#fff",
        lineHeight: 16, // Matches font size for centering
        textAlign: "center",
    },
    cartButton: {
        position: "absolute",
        bottom: 20,
        right: 20,
        backgroundColor: "#FF6347",
        borderRadius: 40, // Larger radius for bigger circle
        width: 70, // Increased width
        height: 70, // Increased height
        justifyContent: "center",
        alignItems: "center",
        elevation: 5, // Add shadow for Android
        shadowColor: "#000", // Add shadow for iOS
        shadowOpacity: 0.1,
        shadowRadius: 5,
    },
    cartImage: {
        width: 40, // Adjust cart image size
        height: 40,
        resizeMode: "contain", // Ensure it scales well
    },
});

export default Dashboard;
