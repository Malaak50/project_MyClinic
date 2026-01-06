import { View, Text, ActivityIndicator, TouchableOpacity } from "react-native";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../services/firebase";
import { colors } from "../../theme/colors";
import { useRouter } from "expo-router";

export default function DoctorProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function load() {
      try {
        const d = await getDoc(doc(db, "doctors", auth.currentUser.uid));
        if (d.exists()) {
          setProfile(d.data());
        } else {
           // Fallback to users collection if not found in doctors
           const u = await getDoc(doc(db, "users", auth.currentUser.uid));
           if (u.exists()) setProfile(u.data());
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <ActivityIndicator style={{ marginTop: 20 }} />;

  return (
    <View style={{ padding: 16, gap: 16 }}>
      <View style={{ alignItems: "center", marginBottom: 20 }}>
        <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ fontSize: 32, color: "#fff", fontWeight: "bold" }}>
            {profile?.name ? profile.name[0].toUpperCase() : "D"}
          </Text>
        </View>
        <Text style={{ fontSize: 22, fontWeight: "700", marginTop: 12 }}>{profile?.name || "Docteur"}</Text>
        <Text style={{ color: "#666" }}>{profile?.specialty || "Médecin généraliste"}</Text>
      </View>

      <View style={{ gap: 12, backgroundColor: "#fff", padding: 16, borderRadius: 12 }}>
        <Text style={{ fontWeight: "600", color: colors.primary }}>Informations</Text>
        <Text>Email: {profile?.email || auth.currentUser?.email}</Text>
        <Text>Téléphone: {profile?.phone || "Non renseigné"}</Text>
        <Text>Clinique: {profile?.clinicName || "Non renseigné"}</Text>
        <Text>Status: {profile?.status || "Actif"}</Text>
      </View>

      <TouchableOpacity onPress={() => auth.signOut()} style={{ backgroundColor: "#ef4444", padding: 16, borderRadius: 12, alignItems: "center" }}>
        <Text style={{ color: "#fff", fontWeight: "bold" }}>Se déconnecter</Text>
      </TouchableOpacity>
    </View>
  );
}

