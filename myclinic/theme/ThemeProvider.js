import { SafeAreaView } from "react-native";
import { colors } from "./colors";

export function ThemeProvider({ children }) {
  return <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>{children}</SafeAreaView>;
}

