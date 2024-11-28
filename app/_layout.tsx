import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false, // Hides headers globally for all screens
        animation: "fade", // Optional: Sets a fade animation for screen transitions
      }}
    >
      {/* Add individual screen-specific options if needed */}
      <Stack.Screen
        name="index" // The main welcome screen
        options={{
          headerShown: false, // Ensure no header for the index screen
        }}
      />
      <Stack.Screen
        name="dashboard" // The dashboard screen
        options={{
          headerShown: false, // Optionally hide the header for the dashboard as well
          animation: "slide_from_right", // Optional: Custom animation for this screen
        }}
      />
    </Stack>
  );
}
