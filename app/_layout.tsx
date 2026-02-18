import { Stack } from "expo-router";
import "./global.css";
import { ThemeProvider } from "./context/ThemeContext";

export default function RootLayout() {
  return (
    <ThemeProvider>
      <Stack>

      <Stack.Screen 
      name="(tabs)" 
      options={{ headerShown: false }} />
      
    </Stack>
    </ThemeProvider>
  );
}
