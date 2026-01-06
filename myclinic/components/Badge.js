import { View, Text } from "react-native";

const variants = {
  requested: { bg: "#eef2ff", color: "#4338ca" },
  confirmed: { bg: "#ecfeff", color: "#0e7490" },
  canceled: { bg: "#fee2e2", color: "#b91c1c" },
  completed: { bg: "#dcfce7", color: "#15803d" },
  admin: { bg: "#fde68a", color: "#92400e" },
  doctor: { bg: "#e0f2fe", color: "#0369a1" },
  patient: { bg: "#f5f3ff", color: "#6d28d9" },
  default: { bg: "#f3f4f6", color: "#374151" }
};

export function Badge({ label, type = "default" }) {
  const v = variants[type] || variants.default;
  return (
    <View style={{ alignSelf: "flex-start", backgroundColor: v.bg, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999 }}>
      <Text style={{ color: v.color, fontWeight: "600", fontSize: 12 }}>{label}</Text>
    </View>
  );
}

