import { Drawer } from "expo-router/drawer";
import { LogoCircle } from "../../components/LogoCircle";
import { colors } from "../../theme/colors";

export default function AdminLayout() {
  return (
    <Drawer
      screenOptions={{
        drawerType: "front",
        drawerPosition: "left",
        drawerActiveTintColor: "#FFFFFF",
        drawerInactiveTintColor: "#E2E8F0",
        drawerContentStyle: { backgroundColor: colors.secondary },
        headerRight: () => <LogoCircle size={32} />,
        headerTitleStyle: { color: colors.secondary, fontWeight: "800" }
      }}
    >
      <Drawer.Screen name="index" options={{ title: "Dashboard" }} />
      <Drawer.Screen name="doctors" options={{ title: "Doctors" }} />
      <Drawer.Screen name="patients" options={{ title: "Patients" }} />
      <Drawer.Screen name="users" options={{ title: "Users" }} />
      <Drawer.Screen name="appointments" options={{ title: "Appointments" }} />
      <Drawer.Screen name="notifications" options={{ title: "Notifications" }} />
      <Drawer.Screen name="profile" options={{ title: "Profile" }} />
      <Drawer.Screen name="logout" options={{ title: "Logout" }} />
    </Drawer>
  );
}
