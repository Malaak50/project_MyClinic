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
      const now = new Date();
      const start = new Date(now);
      start.setHours(0, 0, 0, 0);
      const end = new Date(now);
      end.setHours(23, 59, 59, 999);
      
      const baseQ = query(
        collection(db, "appointments"),
        where("doctorId", "==", auth.currentUser.uid)
      );
      const snap = await getDocs(baseQ);
      const allApps = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      const todays = allApps
        .filter(a => {
          const t = a.scheduledAt?.toDate ? a.scheduledAt.toDate() : null;
          return t && t >= start && t <= end;
        })
        .sort((a, b) => {
          const ta = a.scheduledAt?.seconds || 0;
          const tb = b.scheduledAt?.seconds || 0;
          return ta - tb;
        })
        .map(a => ({
          ...a,
          displayTime: a.scheduledAt?.toDate ? a.scheduledAt.toDate().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "",
        }));
      setTodayApps(todays);

      const upcoming = allApps
        .filter(a => (a.scheduledAt?.seconds || 0) > Math.floor(now.getTime() / 1000))
        .sort((a, b) => {
          const ta = a.scheduledAt?.seconds || 0;
          const tb = b.scheduledAt?.seconds || 0;
          return ta - tb;
        })
        .slice(0, 5)
        .map(a => ({
          ...a,
          displayDate: a.scheduledAt?.toDate ? a.scheduledAt.toDate().toLocaleDateString() : "",
          displayTime: a.scheduledAt?.toDate ? a.scheduledAt.toDate().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "",
        }));
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
          <Card title={app.patientName || "Patient"} subtitle={`${app.displayTime || ""} - ${app.status}`} />
        </TouchableOpacity>
      ))}

      <Text style={{ fontSize: 18, fontWeight: "600", marginTop: 8 }}>Prochains rendez-vous</Text>
      {nextApps.length === 0 ? <Text style={{ color: "#666" }}>Aucun rendez-vous à venir</Text> : null}
      {nextApps.map(app => (
        <TouchableOpacity key={app.id} onPress={() => router.push({ pathname: "/(doctor)/appointmentDetails", params: { id: app.id } })}>
          <Card title={app.patientName || "Patient"} subtitle={`${app.displayDate || ""} à ${app.displayTime || ""} - ${app.status}`} />
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}
