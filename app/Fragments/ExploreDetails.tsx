import { useTheme } from "@/app/context/ThemeContext";
import { useFetchItemDetail } from "@/hooks/useFetchExplore";
import { getAccentColor, getExploreGradient } from "@/theme/gradients";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, Tabs } from "expo-router";
import React, { useCallback, useRef, useState } from "react";
import { Animated, Share, View } from "react-native";
import { HeritageItem } from "../components/explore/FeaturedCard";
import DetailContent from "../components/explore_details/DetailContent";
import DetailHero from "../components/explore_details/DetailHero";
import RelatedItems from "../components/explore_details/RelatedItems";

type RootStackParamList = {
  Explore: undefined;
  ExploreDetails: { item: HeritageItem };
};
type DetailRoute = RouteProp<RootStackParamList, "ExploreDetails">;
type NavProp = NativeStackNavigationProp<RootStackParamList>;

const ExploreDetails: React.FC = () => {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<DetailRoute>();
  const { item: routeItem } = route.params;
  const { themeName } = useTheme();

  const grad = getExploreGradient(themeName);
  const accent = getAccentColor(themeName);

  const [isLiked, setIsLiked] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;

  const { item, loading, relatedItems } = useFetchItemDetail(routeItem.id);
  const displayItem = item ?? routeItem;

  const handleBack = useCallback(() => navigation.goBack(), []);

  const handleLike = useCallback(() => setIsLiked((prev) => !prev), []);

  const handleShare = useCallback(async () => {
    try {
      await Share.share({
        title: displayItem.title,
        message: `Check out "${displayItem.title}" on ARCIVIA — ${displayItem.era}, ${displayItem.location}`,
      });
    } catch {}
  }, [displayItem]);

  const handleARPress = useCallback(() => {
    console.log("Launch AR for:", displayItem.id);
  }, [displayItem]);

  const handleRelatedPress = useCallback(
    (relItem: HeritageItem) =>
      navigation.push("ExploreDetails", { item: relItem }),
    [navigation],
  );

  return (
    <View className="flex-1">
      <Tabs
        screenOptions={{
          headerShown: false,
        }}
      />
      <LinearGradient
        colors={grad.colors as any}
        start={grad.start}
        end={grad.end}
        className="absolute inset-0"
      />

      <View
        className="absolute rounded-full"
        style={{
          width: 280,
          height: 280,
          top: 100,
          right: -100,
          backgroundColor: accent + "15",
        }}
      />
      <View
        className="absolute rounded-full"
        style={{
          width: 200,
          height: 200,
          bottom: 150,
          left: -80,
          backgroundColor: accent + "0a",
        }}
      />

      <Animated.ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false },
        )}
        bounces
      >
        <DetailHero
          item={displayItem}
          scrollY={scrollY}
          onBack={handleBack}
          onLike={handleLike}
          onShare={handleShare}
          isLiked={isLiked}
        />
        <DetailContent item={displayItem} onARPress={handleARPress} />
        {relatedItems.length > 0 && (
          <RelatedItems items={relatedItems} onPress={handleRelatedPress} />
        )}
        <View style={{ height: 80 }} />
      </Animated.ScrollView>
    </View>
  );
};

export default ExploreDetails;
