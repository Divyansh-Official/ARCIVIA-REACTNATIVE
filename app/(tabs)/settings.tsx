import React from "react";
import { View } from "react-native";
import ThemeToggle from "../components/settings/ThemeToggle";
import { useTheme } from "../context/ThemeContext";

const settings = () => {
  const { theme } = useTheme();

  return (
    <View className="flex-1 items-center justify-center" style={{ backgroundColor: theme.background }}>
      <ThemeToggle />
    </View>
  );
};

export default settings;
