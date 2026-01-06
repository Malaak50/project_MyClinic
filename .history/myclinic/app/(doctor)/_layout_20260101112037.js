import { Drawer } from "expo-router/drawer";
import { colors } from "../../theme/colors";
import { LogoCircle } from "../../components/LogoCircle";

export default function DoctorLayout() {
  return (
    <Drawer
      screenOptions={{
        tabBarActiveTintColor: "#FFFFFF",
        tabBarInactiveTintColor: "#E2E8F0",
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
      <Drawer.Screen name="appointments" options={{ title: "Appointments" }} />
      <Drawer.Screen name="patients" options={{ title: "Patients" }} />
      <Drawer.Screen name="medicalRecords" options={{ title: "Medical Records" }} />
      <Drawer.Screen name="prescriptions" options={{ title: "Prescriptions" }} />
      <Drawer.Screen name="availability" options={{ title: "Availability" }} />
      <Drawer.Screen name="notifications" options={{ title: "Notifications" }} />
      <Drawer.Screen name="profile" options={{ title: "Profile" }} />
      <Drawer.Screen name="logout" options={{ title: "Logout" }} />

      {/* Hidden Screens */}
      <Drawer.Screen name="appointmentDetails" options={{ drawerItemStyle: { display: "none" }, title: "Appointment Details" }} />
      <Drawer.Screen name="patientDetails" options={{ drawerItemStyle: { display: "none" }, title: "Patient Details" }} />
      <Drawer.Screen name="prescriptionDetails" options={{ drawerItemStyle: { display: "none" }, title: "Prescription Details" }} />
      <Drawer.Screen name="notes" options={{ drawerItemStyle: { display: "none" }, title: "Notes" }} />
    </Drawer>
  );
}
