import { View } from "react-native";
import { useTheme } from "../context/ThemeContext";

export default function Index() {
  const { theme } = useTheme();

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }} />
  );
}
