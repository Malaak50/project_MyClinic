import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, ScrollView, Alert, Modal } from "react-native";
import { useState } from "react";
import { usePaginatedQuery } from "../../hooks/usePaginatedQuery";
import { colors } from "../../theme/colors";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../../services/firebase";

function CreateNotificationForm({ onCancel, onSuccess }) {
  const [form, setForm] = useState({
    title: "",
    body: "",
    targetGroup: "all" // all, doctors, patients
  });
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!form.title || !form.body) {
      Alert.alert("Erreur", "Titre et message requis");
      return;
    }
    setLoading(true);
    try {
      await addDoc(collection(db, "notifications"), {
        title: form.title,
        body: form.body,
        targetGroup: form.targetGroup,
        type: "system",
        createdAt: serverTimestamp(),
        read: false // Not relevant for broadcast but consistent schema
      });
      Alert.alert("Succès", "Notification envoyée");
      onSuccess();
    } catch (e) {
      Alert.alert("Erreur", e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ gap: 12, padding: 16, backgroundColor: "#fff", borderRadius: 10 }}>
      <Text style={{ fontSize: 18, fontWeight: "bold" }}>Nouvelle Notification</Text>
      <TextInput 
        placeholder="Titre" 
        value={form.title} 
        onChangeText={t => setForm({...form, title: t})} 
        style={styles.input} 
      />
      <TextInput 
        placeholder="Message" 
        value={form.body} 
        onChangeText={t => setForm({...form, body: t})} 
        style={[styles.input, { height: 80 }]} 
        multiline 
      />
      
      <Text style={{ fontWeight: "600" }}>Cibler :</Text>
      <View style={{ flexDirection: "row", gap: 8 }}>
        {["all", "doctors", "patients"].map(g => (
          <TouchableOpacity 
            key={g} 
            onPress={() => setForm({...form, targetGroup: g})}
            style={[
              styles.badge, 
              form.targetGroup === g ? styles.activeBadge : styles.inactiveBadge
            ]}
          >
            <Text style={{ color: form.targetGroup === g ? "#fff" : "#000" }}>
              {g === "all" ? "Tous" : g === "doctors" ? "Médecins" : "Patients"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={{ flexDirection: "row", gap: 12, marginTop: 10 }}>
        <TouchableOpacity onPress={onCancel} style={[styles.button, { backgroundColor: "#9ca3af" }]}>
          <Text style={{ color: "#fff" }}>Annuler</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleCreate} style={[styles.button, { backgroundColor: colors.primary }]}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: "#fff" }}>Envoyer</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function AdminNotifications() {
  const [showCreate, setShowCreate] = useState(false);
  
  // Show all system notifications or targeted ones
  const filters = []; 
  
  const { items, loading, hasMore, loadNextPage, reload, error } = usePaginatedQuery({
    collectionName: "notifications",
    filters,
    orderByField: "createdAt",
    order: "desc",
    pageSize: 10
  });

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <Text style={{ fontSize: 24, fontWeight: "800", color: colors.primary }}>Centre des notifications</Text>
        <TouchableOpacity 
          onPress={() => setShowCreate(!showCreate)} 
          style={{ backgroundColor: colors.secondary, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10 }}
        >
          <Text style={{ color: "#fff", fontWeight: "700" }}>{showCreate ? "Fermer" : "+ Créer"}</Text>
        </TouchableOpacity>
      </View>

      {showCreate && (
        <CreateNotificationForm 
          onCancel={() => setShowCreate(false)} 
          onSuccess={() => { setShowCreate(false); reload(); }} 
        />
      )}

      <Text style={{ fontSize: 18, fontWeight: "700", color: colors.secondary }}>Historique</Text>
      {loading && items.length === 0 ? <ActivityIndicator /> : null}
      
      <View style={{ gap: 10 }}>
        {items.map(n => (
          <View key={n.id} style={{ borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 12, padding: 14, backgroundColor: "#fff" }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Text style={{ fontSize: 16, fontWeight: "700", color: colors.primary }}>{n.title}</Text>
              <Text style={{ fontSize: 12, color: "#666" }}>
                {n.createdAt?.toDate ? n.createdAt.toDate().toLocaleString() : ""}
              </Text>
            </View>
            <Text style={{ marginVertical: 8, color: "#111827" }}>{n.body}</Text>
            <View style={{ flexDirection: "row", gap: 8 }}>
              <View style={{ backgroundColor: "#f0f9ff", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: 1, borderColor: colors.secondary }}>
                <Text style={{ fontSize: 12, color: colors.secondary }}>Cible: {n.targetGroup || "User"}</Text>
              </View>
            </View>
          </View>
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
