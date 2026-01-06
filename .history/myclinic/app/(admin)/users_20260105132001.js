import { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from "react-native";
import { colors } from "../../theme/colors";
import { Card } from "../../components/Card";
import { Badge } from "../../components/Badge";
import { db } from "../../services/firebase";
import { collection, query, where, getDocs, doc, updateDoc, getDoc, onSnapshot } from "firebase/firestore";

export default function AdminUsers() {
  const [roleFilter, setRoleFilter] = useState("");
  const [search, setSearch] = useState("");
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function subscribe() {
    setLoading(true);
    setError("");
    const base = [
      collection(db, "users"),
      ...(roleFilter ? [where("role", "==", roleFilter)] : [])
    ];
    const qRef = query(...base);
    const unsub = onSnapshot(qRef, async (snap) => {
      const docs = snap.docs.map(d => ({ id: d.id, uid: d.id, ...d.data() }));
      const enriched = await Promise.all(docs.map(async u => {
        if (u.role === "doctor") {
          try {
            const dSnap = await getDoc(doc(db, "doctors", u.id));
            const d = dSnap.exists() ? dSnap.data() : {};
            return { ...u, clinicName: d.clinicName || "", specialties: d.specialties || [], status: u.status || d.status || "active" };
          } catch {
            return u;
          }
        }
        return u;
      }));
      setItems(enriched);
      setFilteredItems(enriched);
      setLoading(false);
    }, (e) => {
      setError("Impossible de charger les utilisateurs");
      setLoading(false);
    });
    return unsub;
  }

  useEffect(() => {
    const unsub = subscribe();
    return () => { if (unsub) unsub(); };
  }, [roleFilter]);

  useEffect(() => {
    let res = items;
    if (search) {
      const q = search.toLowerCase();
      res = res.filter(u => 
        (u.displayName || "").toLowerCase().includes(q) ||
        (u.email || "").toLowerCase().includes(q) ||
        (u.phone || "").toLowerCase().includes(q)
      );
    }
    setFilteredItems(res);
  }, [search, items]);

  const toggleStatus = async (user) => {
    const newStatus = user.status === "disabled" ? "active" : "disabled";
    try {
      await updateDoc(doc(db, "users", user.id), { status: newStatus });
      // If user is a doctor, also update doctor doc status
      if (user.role === "doctor") {
         // Check if doctor doc exists? Usually yes.
         try {
           await updateDoc(doc(db, "doctors", user.id), { status: newStatus === "active" ? "active" : "inactive" });
         } catch (e) {
           console.log("No doctor doc found or error", e);
         }
      }
      if (user.role === "patient") {
        try {
          await updateDoc(doc(db, "patients", user.id), { status: newStatus });
        } catch (e) {
          console.log("No patient doc found or error", e);
        }
      }
      // Keep UI fresh; snapshot will push updates
    } catch (e) {
      Alert.alert("Erreur", "Impossible de modifier le statut");
    }
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 18, fontWeight: "700" }}>Liste des utilisateurs</Text>
      <View style={{ gap: 10 }}>
        <View style={{ flexDirection: "row", gap: 8 }}>
          <TouchableOpacity onPress={() => setRoleFilter("")} style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, borderWidth: 1, borderColor: "#ddd", backgroundColor: roleFilter === "" ? colors.secondary : "#fff" }}>
            <Text style={{ color: roleFilter === "" ? "#fff" : "#111827" }}>Tous</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setRoleFilter("admin")} style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, borderWidth: 1, borderColor: "#ddd", backgroundColor: roleFilter === "admin" ? colors.secondary : "#fff" }}>
            <Text style={{ color: roleFilter === "admin" ? "#fff" : "#111827" }}>Admin</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setRoleFilter("doctor")} style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, borderWidth: 1, borderColor: "#ddd", backgroundColor: roleFilter === "doctor" ? colors.secondary : "#fff" }}>
            <Text style={{ color: roleFilter === "doctor" ? "#fff" : "#111827" }}>Doctor</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setRoleFilter("patient")} style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, borderWidth: 1, borderColor: "#ddd", backgroundColor: roleFilter === "patient" ? colors.secondary : "#fff" }}>
            <Text style={{ color: roleFilter === "patient" ? "#fff" : "#111827" }}>Patient</Text>
          </TouchableOpacity>
        </View>
        <TextInput placeholder="Rechercher (nom/email/tél)" value={search} onChangeText={setSearch} style={{ borderWidth: 1, borderColor: "#ddd", borderRadius: 8, padding: 8 }} />
      </View>
      {loading ? <ActivityIndicator /> : null}
      {error ? <Text style={{ color: "red" }}>{error}</Text> : null}
      <View style={{ gap: 8 }}>
        {filteredItems.map(u => (
          <Card key={u.uid || u.id} title={u.displayName || "-"} subtitle={u.email}>
            <View style={{ flexDirection: "row", gap: 8, alignItems: "center", marginTop: 4 }}>
              <Badge label={u.role} type={u.role} />
              <Text style={{ color: "#666" }}>{u.phone || "-"}</Text>
            </View>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 12, borderTopWidth: 1, borderTopColor: "#eee", paddingTop: 8 }}>
              <Text style={{ color: u.status === "disabled" ? "red" : "green", fontWeight: "600" }}>
                {u.status === "disabled" ? "Désactivé" : "Actif"}
              </Text>
              {u.role !== "admin" && (
                <TouchableOpacity onPress={() => toggleStatus(u)} style={{ paddingHorizontal: 12, paddingVertical: 6, backgroundColor: u.status === "disabled" ? "#dcfce7" : "#fee2e2", borderRadius: 6 }}>
                  <Text style={{ color: u.status === "disabled" ? "#166534" : "#991b1b", fontSize: 12 }}>
                    {u.status === "disabled" ? "Activer" : "Désactiver"}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </Card>
        ))}
      </View>
    </ScrollView>
  );
}
