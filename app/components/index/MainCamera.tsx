import { CameraType, CameraView, useCameraPermissions } from "expo-camera";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Pressable, Text, View } from "react-native";

const AI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_VISION_API_KEY!;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${AI_API_KEY}`;

// Free tier = 15 req/min. 5s interval = 12 req/min (safe)
const SCAN_INTERVAL_MS = 5000;

const MainCamera = () => {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>("back");
  const [result, setResult] = useState<string>("");
  const [scanning, setScanning] = useState(false);
  const cameraRef = useRef<CameraView>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isRunning = useRef(false);

  const analyzeFrame = useCallback(async () => {
    if (isRunning.current || !cameraRef.current) return;
    isRunning.current = true;
    setScanning(true);

    try {
      const photo = await cameraRef.current.takePictureAsync({
        base64: true,
        quality: 0.4,
        skipProcessing: true,
      });

      if (!photo?.base64) throw new Error("No image captured");

      const response = await fetch(GEMINI_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  inlineData: {
                    mimeType: "image/jpeg",
                    data: photo.base64,
                  },
                },
                {
                  text: "Briefly describe what you see in one short sentence.",
                },
              ],
            },
          ],
          generationConfig: {
            maxOutputTokens: 60,
            temperature: 0.2,
          },
        }),
      });

      // Handle rate limit gracefully
      if (response.status === 429) {
        setResult("Rate limited — waiting 15s...");
        await new Promise((r) => setTimeout(r, 15000));
        return;
      }

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err?.error?.message ?? `HTTP ${response.status}`);
      }

      const data = await response.json();
      const text =
        data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "No result";
      setResult(text.trim());
    } catch (e: any) {
      setResult(`Error: ${e?.message ?? "Unknown error"}`);
    } finally {
      setScanning(false);
      isRunning.current = false;
    }
  }, []);

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
            {scanning ? "Analyzing..." : "Live"}
          </Text>
        </View>
        <Text className="text-white text-base font-medium leading-snug">
          {result || "—"}
        </Text>
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