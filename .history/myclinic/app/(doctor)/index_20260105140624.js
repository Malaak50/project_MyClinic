import { View, Text, ScrollView, RefreshControl, ActivityIndicator, TouchableOpacity } from "react-native";
import { useEffect, useState } from "react";
import { collection, query, where, getDocs, orderBy, limit, doc, getDoc } from "firebase/firestore";
import { db, auth } from "../../services/firebase";
import { colors } from "../../theme/colors";
import { Card } from "../../components/Card";
import { useRouter } from "expo-router";

export default function DoctorDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [todayApps, setTodayApps] = useState([]);
  const [nextApps, setNextApps] = useState([]);
  const [status, setStatus] = useState("active");

  const fetchData = async () => {
    try {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];
      
      const baseQ = query(
        collection(db, "appointments"),
        where("doctorId", "==", auth.currentUser.uid)
      );
      const snap = await getDocs(baseQ);
      const allApps = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      const todays = allApps.filter(a => a.date === today).sort((a, b) => String(a.time).localeCompare(String(b.time)));
      setTodayApps(todays);

      const upcoming = allApps
        .filter(a => String(a.date) > today)
        .sort((a, b) => String(a.date).localeCompare(String(b.date)))
        .slice(0, 5);
      setNextApps(upcoming);

      // Account Status
      const docRef = doc(db, "doctors", auth.currentUser.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setStatus(docSnap.data().status || "active");
      }

    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      <Text style={{ fontSize: 22, fontWeight: "700", color: colors.secondary }}>Tableau de bord</Text>
      
      <View style={{ backgroundColor: status === "active" ? "#dcfce7" : "#fee2e2", padding: 12, borderRadius: 8 }}>
        <Text style={{ color: status === "active" ? "#166534" : "#991b1b", fontWeight: "bold" }}>
          Statut du compte : {status.toUpperCase()}
        </Text>
      </View>

      <Text style={{ fontSize: 18, fontWeight: "600" }}>Rendez-vous du jour</Text>
      {todayApps.length === 0 ? <Text style={{ color: "#666" }}>Aucun rendez-vous aujourd'hui</Text> : null}
      {todayApps.map(app => (
        <TouchableOpacity key={app.id} onPress={() => router.push({ pathname: "/(doctor)/appointmentDetails", params: { id: app.id } })}>
          <Card title={app.patientName} subtitle={`${app.time} - ${app.status}`} />
        </TouchableOpacity>
      ))}

      <Text style={{ fontSize: 18, fontWeight: "600", marginTop: 8 }}>Prochains rendez-vous</Text>
      {nextApps.length === 0 ? <Text style={{ color: "#666" }}>Aucun rendez-vous à venir</Text> : null}
      {nextApps.map(app => (
        <TouchableOpacity key={app.id} onPress={() => router.push({ pathname: "/(doctor)/appointmentDetails", params: { id: app.id } })}>
          <Card title={app.patientName} subtitle={`${app.date} à ${app.time} - ${app.status}`} />
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}
