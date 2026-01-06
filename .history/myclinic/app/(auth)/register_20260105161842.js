import { useState } from "react";
import { View, TextInput, Text, ScrollView, TouchableOpacity } from "react-native";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../services/firebase";
import { Button } from "../../components/Button";
import { colors } from "../../theme/colors";
import { useRouter } from "expo-router";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { LogoCircle } from "../../components/LogoCircle";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [allergies, setAllergies] = useState("");
  const [chronicConditions, setChronicConditions] = useState("");
  const [insuranceNumber, setInsuranceNumber] = useState("");
  
  const role = "patient";
  const [error, setError] = useState("");
  const router = useRouter();
  const [showPwd, setShowPwd] = useState(false);

  async function onSubmit() {
    setError("");
    if (!email || !password || !displayName || !phone || !birthDate || !insuranceNumber) {
      setError("Veuillez remplir tous les champs obligatoires");
      return;
    }

    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const uid = cred.user.uid;
      
      // 1. Create User (Auth/System info)
      await setDoc(doc(db, "users", uid), {
        uid,
        role,
        email: email.trim(),
        displayName,
        phone,
        createdAt: serverTimestamp()
      });

      // 2. Create Patient Profile (Medical info)
      await setDoc(doc(db, "patients", uid), {
        id: uid,
        userId: uid,
        displayName, // Duplicated for easier access
        email: email.trim(),
        phone,
        birthDate,
        allergies: allergies.split(",").map(a => a.trim()).filter(Boolean),
        chronicConditions: chronicConditions.split(",").map(c => c.trim()).filter(Boolean),
        insuranceNumber,
        createdAt: serverTimestamp()
      });
      
      router.replace("/(auth)/login");
    } catch (e) {
      console.error(e);
      setError("Création échouée: " + e.message);
    }
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <LogoCircle size={48} />
        <Text style={{ fontSize: 26, fontWeight: "800", color: colors.secondary }}>Créer un compte</Text>
      </View>
      
      <View style={{ backgroundColor: "#fff", borderRadius: 12, padding: 14, borderWidth: 1, borderColor: "#e5e7eb", gap: 10 }}>
        <Text style={{ fontWeight: "700", color: colors.primary }}>Informations Personnelles</Text>
        <TextInput placeholder="Nom et prénom *" value={displayName} onChangeText={setDisplayName} style={styles.input} />
        <TextInput placeholder="Téléphone *" keyboardType="phone-pad" value={phone} onChangeText={setPhone} style={styles.input} />
        <TextInput placeholder="Date de naissance (JJ/MM/AAAA) *" value={birthDate} onChangeText={setBirthDate} style={styles.input} />
        <TextInput placeholder="Numéro d'assurance *" value={insuranceNumber} onChangeText={setInsuranceNumber} style={styles.input} />
      </View>

      <View style={{ backgroundColor: "#fff", borderRadius: 12, padding: 14, borderWidth: 1, borderColor: "#e5e7eb", gap: 10 }}>
        <Text style={{ fontWeight: "700", color: colors.primary }}>Informations Médicales</Text>
        <TextInput placeholder="Allergies (séparées par virgule)" value={allergies} onChangeText={setAllergies} style={styles.input} />
        <TextInput placeholder="Maladies chroniques (séparées par virgule)" value={chronicConditions} onChangeText={setChronicConditions} style={styles.input} />
      </View>

      <View style={{ backgroundColor: "#fff", borderRadius: 12, padding: 14, borderWidth: 1, borderColor: "#e5e7eb", gap: 10 }}>
        <Text style={{ fontWeight: "700", color: colors.primary }}>Connexion</Text>
        <TextInput placeholder="Email *" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} style={styles.input} />
        <View style={{ position: "relative" }}>
          <TextInput placeholder="Mot de passe *" secureTextEntry={!showPwd} value={password} onChangeText={setPassword} style={[styles.input, { paddingRight: 44 }]} />
          <TouchableOpacity onPress={() => setShowPwd(p => !p)} style={{ position: "absolute", right: 10, top: 10, padding: 4 }}>
            <MaterialCommunityIcons name="stethoscope" size={24} color={colors.secondary} />
          </TouchableOpacity>
        </View>
        <Text style={{ color: colors.secondary, fontWeight: "600" }}>Rôle: Patient</Text>
        {error ? <Text style={{ color: "red" }}>{error}</Text> : null}
        <Button title="S’inscrire" onPress={onSubmit} />
      </View>
    </ScrollView>
  );
}

const styles = {
  input: { borderWidth: 1, borderColor: "#ddd", borderRadius: 8, padding: 12, backgroundColor: "#fff" }
};
