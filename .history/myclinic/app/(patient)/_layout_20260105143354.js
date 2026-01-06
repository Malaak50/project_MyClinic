import { Drawer } from "expo-router/drawer";
import { colors } from "../../theme/colors";
import { LogoCircle } from "../../components/LogoCircle";

export default function PatientLayout() {
  return (
    <Drawer
      screenOptions={{
        drawerType: "front",
        drawerPosition: "left",
        drawerActiveTintColor: "#FFFFFF",
        drawerInactiveTintColor: "#E2E8F0",
        drawerContentStyle: { backgroundColor: colors.secondary },
        headerRight: () => <LogoCircle size={56} />,
        headerTitleStyle: { color: colors.secondary, fontWeight: "800" }
      }}
    >
      <Drawer.Screen name="index" options={{ title: "Dashboard" }} />
      <Drawer.Screen name="searchDoctors" options={{ title: "Find Doctor" }} />
      <Drawer.Screen name="myAppointments" options={{ title: "My Appointments" }} />
      <Drawer.Screen name="medical" options={{ title: "Medical Records" }} />
      <Drawer.Screen name="prescriptions" options={{ title: "Prescriptions" }} />
      <Drawer.Screen name="notifications" options={{ title: "Notifications" }} />
      <Drawer.Screen name="profile" options={{ title: "Profile" }} />
      <Drawer.Screen name="logout" options={{ title: "Logout" }} />

      {/* Hidden Screens */}
      <Drawer.Screen name="doctorDetails" options={{ drawerItemStyle: { display: "none" }, title: "Doctor Details" }} />
      <Drawer.Screen name="appointmentDetails" options={{ drawerItemStyle: { display: "none" }, title: "Appointment Details" }} />
      <Drawer.Screen name="medicalDetails" options={{ drawerItemStyle: { display: "none" }, title: "Medical Details" }} />
    </Drawer>
  );
}
