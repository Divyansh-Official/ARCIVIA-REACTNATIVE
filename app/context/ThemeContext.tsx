import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useState,
} from "react";
import { ThemeName, themes } from "../../theme/theme";

type ThemeContextType = {
  themeName: ThemeName;
  theme: (typeof themes)[ThemeName];
  setTheme: (name: ThemeName) => Promise<void>; // ← was "void", must be Promise<void>
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [themeName, setThemeName] = useState<ThemeName>("dark");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem("APP_THEME");
        if (savedTheme && savedTheme in themes) {
          setThemeName(savedTheme as ThemeName);
        }
      } finally {
        setLoading(false);
      }
    };
    loadTheme();
  }, []);

  const setTheme = async (name: ThemeName) => {
    setThemeName(name);
    await AsyncStorage.setItem("APP_THEME", name);
  };

  if (loading) {
    return null;
  }

  return (
    <ThemeContext.Provider
      value={{
        themeName,
        theme: themes[themeName],
        setTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
};

export default ThemeContext;
