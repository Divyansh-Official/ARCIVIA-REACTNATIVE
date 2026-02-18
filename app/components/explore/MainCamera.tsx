import { CameraType, CameraView, useCameraPermissions } from "expo-camera";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Pressable, Text, View } from "react-native";

const AI_API_URL = "https://your-ai-api.com/analyze"; // Replace with your API
const AI_API_KEY = "YOUR_API_KEY";
const SCAN_INTERVAL_MS = 2000;

const MainCamera = () => {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>("back");
  const [result, setResult] = useState<string>("");
  const [scanning, setScanning] = useState(false);
  const cameraRef = useRef<CameraView>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const analyzeFrame = useCallback(async () => {
    if (!cameraRef.current || scanning) return;
    setScanning(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({
        base64: true,
        quality: 0.4,
        skipProcessing: true,
      });

      const response = await fetch(AI_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${AI_API_KEY}`,
        },
        body: JSON.stringify({ image: photo?.base64 }),
      });

      const data = await response.json();
      setResult(data?.label ?? data?.result ?? JSON.stringify(data));
    } catch (e) {
      setResult("Error analyzing frame");
    } finally {
      setScanning(false);
    }
  }, [scanning]);

  useEffect(() => {
    if (permission?.granted) {
      intervalRef.current = setInterval(analyzeFrame, SCAN_INTERVAL_MS);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [permission?.granted, analyzeFrame]);

  if (!permission) return <View className="flex-1 bg-black" />;

  if (!permission.granted) {
    return (
      <View className="flex-1 items-center justify-center bg-black gap-4">
        <Text className="text-white text-base text-center px-8">
          Camera access is required for AI recognition.
        </Text>
        <Pressable
          onPress={requestPermission}
          className="bg-white px-6 py-3 rounded-full"
        >
          <Text className="text-black font-semibold">Grant Permission</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black">
      <CameraView ref={cameraRef} className="flex-1" facing={facing} />

      {/* Result Overlay */}
      <View className="absolute bottom-0 left-0 right-0 bg-black/60 px-6 py-5 gap-2">
        <View className="flex-row items-center gap-2">
          <View
            className={`w-2 h-2 rounded-full ${scanning ? "bg-yellow-400" : "bg-green-400"}`}
          />
          <Text className="text-white/60 text-xs uppercase tracking-widest">
            {scanning ? "Analyzing..." : "Live Recognition"}
          </Text>
        </View>
        <Text className="text-white text-lg font-medium">{result || "—"}</Text>
      </View>

      {/* Flip Button */}
      <Pressable
        onPress={() => setFacing((f) => (f === "back" ? "front" : "back"))}
        className="absolute top-12 right-5 bg-black/50 p-3 rounded-full"
      >
        <Text className="text-white text-sm">Flip</Text>
      </Pressable>
    </View>
  );
};

export default MainCamera;
