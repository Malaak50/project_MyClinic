import { Stack } from "expo-router";
import { LogoCircle } from "../../components/LogoCircle";
import { colors } from "../../theme/colors";

export default function AdminLayout() {
  return (
    <Stack
      screenOptions={{
        headerRight: () => <LogoCircle size={32} />,
        headerTitleStyle: { color: colors.secondary, fontWeight: "800" }
      }}
    />
  );
}
