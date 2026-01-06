import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, ScrollView, Alert, Modal } from "react-native";
import { useState } from "react";
import { usePaginatedQuery } from "../../hooks/usePaginatedQuery";
import { colors } from "../../theme/colors";
import { initializeApp, deleteApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db, firebaseConfig } from "../../services/firebase";

function CreateDoctorForm({ onCancel, onSuccess }) {
  const [form, setForm] = useState({
    email: "",
    password: "",
    name: "",
    phone: "",
    specialties: "",
    clinicName: "",
    status: "active"
  });
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!form.email || !form.password || !form.name) {
      Alert.alert("Erreur", "Veuillez remplir les champs obligatoires");
      return;
    }

    setLoading(true);
    let secondaryApp = null;
    try {
      // 1. Init secondary app to create user without logging out admin
      secondaryApp = initializeApp(firebaseConfig, "SecondaryApp");
      const secondaryAuth = getAuth(secondaryApp);
      
      // 2. Create Auth User
      const userCred = await createUserWithEmailAndPassword(secondaryAuth, form.email, form.password);
      const uid = userCred.user.uid;

      // 3. Create Firestore Documents (using primary db instance)
      // users/{uid}
      await setDoc(doc(db, "users", uid), {
        email: form.email,
        name: form.name,
        role: "doctor",
        createdAt: serverTimestamp()
      });

      // doctors/{uid}
      await setDoc(doc(db, "doctors", uid), {
        name: form.name,
        email: form.email,
        phone: form.phone,
        clinicName: form.clinicName,
        status: form.status,
        specialties: form.specialties.split(",").map(s => s.trim()).filter(Boolean),
        availability: [], // Default empty, doctor will set it
        createdAt: serverTimestamp()
      });

      Alert.alert("Succès", "Compte médecin créé avec succès");
      onSuccess();
    } catch (e) {
      console.error(e);
      Alert.alert("Erreur", e.message);
    } finally {
      if (secondaryApp) {
        await deleteApp(secondaryApp);
      }
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 20, fontWeight: "bold" }}>Nouveau Médecin</Text>
      
      <TextInput placeholder="Nom complet *" value={form.name} onChangeText={t => setForm({...form, name: t})} style={styles.input} />
      <TextInput placeholder="Email *" value={form.email} onChangeText={t => setForm({...form, email: t})} style={styles.input} autoCapitalize="none" keyboardType="email-address" />
      <TextInput placeholder="Mot de passe temporaire *" value={form.password} onChangeText={t => setForm({...form, password: t})} style={styles.input} secureTextEntry />
      <TextInput placeholder="Téléphone" value={form.phone} onChangeText={t => setForm({...form, phone: t})} style={styles.input} keyboardType="phone-pad" />
      <TextInput placeholder="Spécialités (séparées par virgule)" value={form.specialties} onChangeText={t => setForm({...form, specialties: t})} style={styles.input} />
      <TextInput placeholder="Nom de la clinique" value={form.clinicName} onChangeText={t => setForm({...form, clinicName: t})} style={styles.input} />
      
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <Text>Statut:</Text>
        <TouchableOpacity onPress={() => setForm({...form, status: "active"})} style={[styles.badge, form.status === "active" ? styles.activeBadge : styles.inactiveBadge]}>
          <Text style={{ color: form.status === "active" ? "#fff" : "#000" }}>Active</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setForm({...form, status: "inactive"})} style={[styles.badge, form.status === "inactive" ? styles.activeBadge : styles.inactiveBadge]}>
          <Text style={{ color: form.status === "inactive" ? "#fff" : "#000" }}>Inactive</Text>
        </TouchableOpacity>
      </View>

      <View style={{ flexDirection: "row", gap: 12, marginTop: 20 }}>
        <TouchableOpacity onPress={onCancel} style={[styles.button, { backgroundColor: "#9ca3af" }]}>
          <Text style={{ color: "#fff" }}>Annuler</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleCreate} style={[styles.button, { backgroundColor: colors.primary }]} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: "#fff" }}>Créer</Text>}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

export default function AdminDoctors() {
  const [showCreate, setShowCreate] = useState(false);
  const [clinicName, setClinicName] = useState("");
  const [status, setStatus] = useState("");
  
  const filters = [
    ...(clinicName ? [{ field: "clinicName", op: "==", value: clinicName }] : []),
    ...(status ? [{ field: "status", op: "==", value: status }] : [])
  ];
  
  const { items, loading, hasMore, loadNextPage, reload, error } = usePaginatedQuery({
    collectionName: "doctors",
    filters,
    orderByField: "clinicName",
    order: "asc",
    pageSize: 10
  });

  if (showCreate) {
    return <CreateDoctorForm onCancel={() => setShowCreate(false)} onSuccess={() => { setShowCreate(false); reload(); }} />;
  }

  return (
    <View style={{ flex: 1, padding: 16, gap: 12 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <Text style={{ fontSize: 18, fontWeight: "700" }}>Gestion des Médecins</Text>
        <TouchableOpacity onPress={() => setShowCreate(true)} style={{ backgroundColor: colors.primary, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 }}>
          <Text style={{ color: "#fff", fontWeight: "600" }}>+ Créer Doctor</Text>
        </TouchableOpacity>
      </View>

      <View style={{ flexDirection: "row", gap: 8 }}>
        <TextInput placeholder="Clinique" value={clinicName} onChangeText={setClinicName} style={{ flex: 1, borderWidth: 1, borderColor: "#ddd", borderRadius: 8, padding: 8 }} />
        <TextInput placeholder="Statut" value={status} onChangeText={setStatus} style={{ width: 100, borderWidth: 1, borderColor: "#ddd", borderRadius: 8, padding: 8 }} />
        <TouchableOpacity onPress={reload} style={{ backgroundColor: colors.secondary, paddingHorizontal: 12, borderRadius: 8, justifyContent: "center" }}>
          <Text style={{ color: "#fff" }}>Filtrer</Text>
        </TouchableOpacity>
      </View>

      {loading && items.length === 0 ? <ActivityIndicator /> : null}
      {error ? <Text style={{ color: "red" }}>{error}</Text> : null}
      
      <ScrollView contentContainerStyle={{ gap: 8 }}>
        {items.map(d => (
          <View key={d.id} style={{ borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 10, padding: 12, backgroundColor: "#fff" }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={{ fontWeight: "700", fontSize: 16 }}>{d.name || "Nom inconnu"}</Text>
              <View style={{ backgroundColor: d.status === "active" ? "#dcfce7" : "#f3f4f6", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 }}>
                <Text style={{ color: d.status === "active" ? "#166534" : "#374151", fontSize: 12 }}>{d.status}</Text>
              </View>
            </View>
            <Text style={{ color: "#666" }}>{d.email}</Text>
            <Text style={{ marginTop: 4 }}>🏥 {d.clinicName || "-"}</Text>
            <Text>🩺 {(d.specialties || []).join(", ") || "-"}</Text>
          </View>
        ))}
        {hasMore ? (
          <TouchableOpacity onPress={loadNextPage} style={{ alignSelf: "center", padding: 12 }}>
            <Text style={{ color: colors.secondary }}>Charger plus</Text>
          </TouchableOpacity>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = {
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    backgroundColor: "#fff"
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: "center"
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#ddd"
  },
  activeBadge: {
    backgroundColor: colors.secondary,
    borderColor: colors.secondary
  },
  inactiveBadge: {
    backgroundColor: "#fff"
  }
};
