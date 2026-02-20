import { useTheme } from "@/app/context/ThemeContext";
import { getAccentColor, getGlowColor } from "@/theme/gradients";
import { LinearGradient } from "expo-linear-gradient";
import React, { useRef } from "react";
import {
    Animated,
    ImageBackground,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { HeritageItem } from "../explore/FeaturedCard";

interface RelatedItemsProps {
  items: HeritageItem[];
  onPress: (item: HeritageItem) => void;
}

const RelatedCard = ({
  item,
  onPress,
}: {
  item: HeritageItem;
  onPress: (item: HeritageItem) => void;
}) => {
  const { themeName } = useTheme();
  const accent = getAccentColor(themeName);
  const glow = getGlowColor(themeName);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  return (
    <Animated.View
      style={{ transform: [{ scale: scaleAnim }], marginRight: 12 }}
    >
      <TouchableOpacity
        onPress={() => onPress(item)}
        onPressIn={() =>
          Animated.spring(scaleAnim, {
            toValue: 0.95,
            friction: 8,
            useNativeDriver: true,
          }).start()
        }
        onPressOut={() =>
          Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 6,
            useNativeDriver: true,
          }).start()
        }
        activeOpacity={1}
        className="rounded-[18px] overflow-hidden"
        style={{
          width: 150,
          height: 200,
          shadowColor: glow,
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.4,
          shadowRadius: 12,
          elevation: 8,
        }}
      >
        <ImageBackground
          source={{ uri: item.imageUrl }}
          className="flex-1 justify-end"
          imageStyle={{ borderRadius: 18 }}
        >
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.85)"]}
            className="p-3 pt-10"
          >
            {item.isAR && (
              <View
                className="w-1.5 h-1.5 rounded-sm mb-1.5"
                style={{ backgroundColor: accent }}
              />
            )}
            <Text
              style={{
                fontFamily: "PlayfairDisplay-Bold",
                fontSize: 12,
                color: "#fff",
                lineHeight: 16,
                marginBottom: 3,
              }}
              numberOfLines={2}
            >
              {item.title}
            </Text>
            <Text
              style={{
                fontFamily: "SpaceMono-Regular",
                fontSize: 9,
                color: "rgba(255,255,255,0.55)",
                letterSpacing: 1,
              }}
            >
              {item.culture}
            </Text>
          </LinearGradient>
        </ImageBackground>
      </TouchableOpacity>
    </Animated.View>
  );
};

const RelatedItems: React.FC<RelatedItemsProps> = ({ items, onPress }) => {
  const { theme, themeName } = useTheme();
  const accent = getAccentColor(themeName);

  if (items.length === 0) return null;

  return (
    <View className="mb-6">
      <View className="flex-row items-center gap-2.5 px-5 mb-4">
        <View
          className="w-0.5 h-4 rounded-sm"
          style={{ backgroundColor: accent }}
        />
        <Text
          style={{
            fontFamily: "PlayfairDisplay-Bold",
            fontSize: 15,
            color: theme.text01,
          }}
        >
          Related
        </Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingLeft: 20, paddingRight: 8 }}
      >
        {items.map((item) => (
          <RelatedCard key={item.id} item={item} onPress={onPress} />
        ))}
      </ScrollView>
    </View>
  );
};

export default RelatedItems;
