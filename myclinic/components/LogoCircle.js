import { View, Image } from "react-native";
import { colors } from "../theme/colors";

export function LogoCircle({ size = 40 }) {
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
      <Image source={require("../assets/logo.png")} style={{ width: size, height: size }} resizeMode="cover" />
    </View>
  );
}
