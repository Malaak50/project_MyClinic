import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, ScrollView, Alert, Modal } from "react-native";
import { useEffect, useState } from "react";
import { collection, query, getDocs, orderBy, where, doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { colors } from "../../theme/colors";
import { initializeApp, deleteApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { db, firebaseConfig } from "../../services/firebase";
import { MaterialCommunityIcons } from "@expo/vector-icons";

function CreateDoctorForm({ onCancel, onSuccess }) {
  const [form, setForm] = useState({
    email: "",
    password: "",
    name: "",
    phone: "",
    specialties: "",
    clinicName: "MyClinic",
    status: "active"
  });
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

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
        phone: form.phone || "",
        role: "doctor",
        createdAt: serverTimestamp()
      });

      // doctors/{uid}
      // Schema: availability, clinicName, id, specialties, status, userId
      // Note: name, email, phone are NOT in doctors schema, they are in users.
      await setDoc(doc(db, "doctors", uid), {
        id: uid,
        userId: uid,
        name: form.name,
        phone: form.phone || "",
        clinicName: form.clinicName,
        status: form.status,
        specialties: form.specialties.split(",").map(s => s.trim()).filter(Boolean),
        availability: [], // Default empty, doctor will set it
        // createdAt is not in schema for doctors, but useful? 
        // User schema for doctors doesn't show createdAt. 
        // But users schema has createdAt. I'll omit it here to be strict.
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
      <View style={{ position: "relative" }}>
        <TextInput 
          placeholder="Mot de passe temporaire *" 
          value={form.password} 
          onChangeText={t => setForm({...form, password: t})} 
          style={[styles.input, { paddingRight: 44 }]} 
          secureTextEntry={!showPwd} 
        />
        <TouchableOpacity 
          onPress={() => setShowPwd(p => !p)} 
          style={{ position: "absolute", right: 10, top: 10, padding: 4 }}
        >
          <MaterialCommunityIcons name="stethoscope" size={24} color={colors.secondary} />
        </TouchableOpacity>
      </View>
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
  const [nameFilter, setNameFilter] = useState("");
  const [specialtyFilter, setSpecialtyFilter] = useState("");

  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const q = query(collection(db, "doctors"));
      const snap = await getDocs(q);
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      const enrichedDocs = await Promise.all(docs.map(async (d) => {
        let email = "";
        try {
          const uid = d.userId || d.id;
          const uSnap = await getDoc(doc(db, "users", uid));
          if (uSnap.exists()) {
            const u = uSnap.data();
            email = u.email || "";
          }
        } catch {}
        return { ...d, email };
      }));

      setItems(enrichedDocs);
      setFilteredItems(enrichedDocs);
    } catch (e) {
      console.error(e);
      Alert.alert("Erreur", "Impossible de charger les médecins");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    let res = items;
    if (nameFilter) {
      res = res.filter(d => d.name?.toLowerCase().includes(nameFilter.toLowerCase()));
    }
    if (specialtyFilter) {
      res = res.filter(d => d.specialties?.some(s => s.toLowerCase().includes(specialtyFilter.toLowerCase())));
    }
    // Only apply if user wants to strict match status/clinic
    if (status) {
      res = res.filter(d => d.status === status);
    }
    if (clinicName) {
      res = res.filter(d => d.clinicName?.toLowerCase().includes(clinicName.toLowerCase()));
    }
    setFilteredItems(res);
  }, [nameFilter, specialtyFilter, status, clinicName, items]);

  if (showCreate) {
    return <CreateDoctorForm onCancel={() => setShowCreate(false)} onSuccess={() => { setShowCreate(false); load(); }} />;
  }

  return (
    <View style={{ flex: 1, padding: 16, gap: 12 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <Text style={{ fontSize: 18, fontWeight: "700" }}>Gestion des Médecins</Text>
        <TouchableOpacity onPress={() => setShowCreate(true)} style={{ backgroundColor: colors.primary, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 }}>
          <Text style={{ color: "#fff", fontWeight: "600" }}>+ Créer Doctor</Text>
        </TouchableOpacity>
      </View>

      <View style={{ gap: 8 }}>
         <TextInput 
          placeholder="Rechercher par nom" 
          value={nameFilter} 
          onChangeText={setNameFilter} 
          style={{ borderWidth: 1, borderColor: "#ddd", padding: 8, borderRadius: 8, backgroundColor: "#fff" }} 
        />
        <TextInput 
          placeholder="Rechercher par spécialité" 
          value={specialtyFilter} 
          onChangeText={setSpecialtyFilter} 
          style={{ borderWidth: 1, borderColor: "#ddd", padding: 8, borderRadius: 8, backgroundColor: "#fff" }} 
        />
      </View>

      {loading ? <ActivityIndicator /> : null}

      <ScrollView contentContainerStyle={{ gap: 10 }}>
        {filteredItems.map(d => (
          <View key={d.id} style={{ padding: 12, borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 12, backgroundColor: "#fff" }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={{ fontWeight: "700", fontSize: 16 }}>{d.name || "Nom inconnu"}</Text>
              <Text style={{ color: d.status === "active" ? "green" : "red", fontWeight: "600" }}>{d.status}</Text>
            </View>
            <Text style={{ color: "#666" }}>{d.email}</Text>
            {d.phone ? <Text style={{ color: "#666" }}>Tel: {d.phone}</Text> : null}
            <Text style={{ marginTop: 4 }}>🏥 {d.clinicName || "-"}</Text>
            <Text>🩺 {(d.specialties || []).join(", ") || "-"}</Text>
          </View>
        ))}
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
