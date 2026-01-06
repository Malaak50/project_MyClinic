import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { colors } from "../theme/colors";

export function Button({ title, onPress, variant = "primary" }) {
  const style = variant === "primary" ? styles.primary : styles.secondary;
  return (
    <TouchableOpacity style={[styles.base, style]} onPress={onPress}>
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center"
  },
  primary: {
    backgroundColor: colors.primary
  },
  secondary: {
    backgroundColor: colors.secondary
  },
  text: {
    color: "#FFFFFF",
    fontWeight: "600"
  }
});

