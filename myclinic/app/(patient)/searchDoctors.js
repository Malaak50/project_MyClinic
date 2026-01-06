import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, ScrollView } from "react-native";
import { useEffect, useState } from "react";
import { colors } from "../../theme/colors";
import { Card } from "../../components/Card";
import { useRouter } from "expo-router";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../services/firebase";

export default function SearchDoctors() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [loadedCount, setLoadedCount] = useState(0);
  const pageSize = 10;
  
  async function reload() {
    setLoading(true);
    try {
      const baseQ = query(collection(db, "doctors"), where("status", "==", "active"));
      const snap = await getDocs(baseQ);
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      const filtered = docs.filter(d => {
        const matchesName = name ? String(d.name || "").toLowerCase().includes(name.toLowerCase()) : true;
        const matchesSpec = specialty ? (Array.isArray(d.specialties) && d.specialties.some(s => String(s).toLowerCase().includes(specialty.toLowerCase()))) : true;
        return matchesName && matchesSpec;
      });
      const sorted = filtered.sort((a, b) => String(a.name || "").localeCompare(String(b.name || "")));
      setLoadedCount(Math.min(pageSize, sorted.length));
      setHasMore(sorted.length > pageSize);
      setItems(sorted.slice(0, pageSize));
    } catch (e) {
      setItems([]);
      setHasMore(false);
      console.error(e);
    }
    setLoading(false);
  }

  async function loadNextPage() {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const baseQ = query(collection(db, "doctors"), where("status", "==", "active"));
      const snap = await getDocs(baseQ);
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      const filtered = docs.filter(d => {
        const matchesName = name ? String(d.name || "").toLowerCase().includes(name.toLowerCase()) : true;
        const matchesSpec = specialty ? (Array.isArray(d.specialties) && d.specialties.some(s => String(s).toLowerCase().includes(specialty.toLowerCase()))) : true;
        return matchesName && matchesSpec;
      });
      const sorted = filtered.sort((a, b) => String(a.name || "").localeCompare(String(b.name || "")));
      const nextCount = Math.min(sorted.length, loadedCount + pageSize);
      setItems(sorted.slice(0, nextCount));
      setLoadedCount(nextCount);
      setHasMore(nextCount < sorted.length);
    } catch (e) {
      setHasMore(false);
      console.error(e);
    }
    setLoading(false);
  }

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, specialty]);

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 18, fontWeight: "700" }}>Trouver un médecin</Text>
      
      <View style={{ gap: 8, backgroundColor: "#fff", padding: 12, borderRadius: 10 }}>
        <Text style={{ fontWeight: "600" }}>Filtres</Text>
        <TextInput 
          placeholder="Spécialité (ex: Cardiologue)" 
          value={specialty} 
          onChangeText={setSpecialty} 
          style={styles.input} 
        />
        <TextInput 
          placeholder="Nom du médecin" 
          value={name} 
          onChangeText={setName} 
          style={styles.input} 
        />
        <TouchableOpacity onPress={reload} style={styles.button}>
          <Text style={{ color: "#fff", fontWeight: "bold" }}>Rechercher</Text>
        </TouchableOpacity>
      </View>

      {loading && items.length === 0 ? <ActivityIndicator /> : null}

      <View style={{ gap: 10 }}>
        {items.map(d => (
          <TouchableOpacity 
            key={d.id} 
            onPress={() => router.push({ pathname: "/(patient)/doctorDetails", params: { id: d.id } })}
          >
            <Card title={d.name || "Docteur"} subtitle={d.clinicName || "Clinique inconnue"}>
              <View style={{ marginTop: 4 }}>
                <Text style={{ color: colors.primary, fontWeight: "600" }}>
                  {(d.specialties || []).join(", ")}
                </Text>
                {d.availability && d.availability.length > 0 ? (
                  <Text style={{ fontSize: 12, color: "#666", marginTop: 4 }}>
                    Dispo: {d.availability.length} créneaux
                  </Text>
                ) : (
                  <Text style={{ fontSize: 12, color: "#999", marginTop: 4 }}>
                    Aucune disponibilité affichée
                  </Text>
                )}
              </View>
            </Card>
          </TouchableOpacity>
        ))}
      </View>

      {hasMore && (
        <TouchableOpacity onPress={loadNextPage} style={{ alignSelf: "center", padding: 10 }}>
          <Text style={{ color: colors.secondary }}>Charger plus</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = {
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    backgroundColor: "#f9fafb"
  },
  button: {
    backgroundColor: colors.secondary,
    padding: 12,
    borderRadius: 8,
    alignItems: "center"
  }
};
