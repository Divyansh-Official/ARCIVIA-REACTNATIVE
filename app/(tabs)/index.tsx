import { View } from "react-native";
import { useTheme } from "../context/ThemeContext";
import MainCamera from "../components/index/MainCamera";

export default function Index() {
  const { theme } = useTheme();

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
        <View> <MainCamera /> </View>
    </View>
  );
}
