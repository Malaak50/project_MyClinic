import { View, Text } from "react-native";
import { colors } from "../theme/colors";

export function Card({ title, subtitle, children, style }) {
  return (
    <View style={[{ borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 12, padding: 12, backgroundColor: "#fff" }, style]}>
      {title ? <Text style={{ fontSize: 16, fontWeight: "700", color: colors.secondary }}>{title}</Text> : null}
      {subtitle ? <Text style={{ color: "#6b7280", marginBottom: 8 }}>{subtitle}</Text> : null}
      {children}
    </View>
  );
}

