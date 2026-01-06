import { useState } from "react";
import { View, TextInput, Text, TouchableOpacity } from "react-native";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../services/firebase";
import { Button } from "../../components/Button";
import { colors } from "../../theme/colors";
import { useRouter } from "expo-router";
import { useRole } from "../../hooks/useRole";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LogoCircle } from "../../components/LogoCircle";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const router = useRouter();
  const { role } = useRole();

  async function onSubmit() {
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      if (role === "admin") router.replace("/(admin)");
      else if (role === "doctor") router.replace("/(doctor)");
      else router.replace("/(patient)");
    } catch (e) {
      setError("Connexion échouée");
    }
  }

  return (
    <View style={{ flex: 1, padding: 16, gap: 16, justifyContent: "center" }}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Text style={{ fontSize: 26, fontWeight: "800", color: colors.secondary }}>MyClinic</Text>
          <MaterialCommunityIcons name="stethoscope" size={26} color={colors.primary} />
        </View>
        <LogoCircle size={48} />
      </View>
      <View style={{ gap: 12 }}>
        <TextInput placeholder="Email" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} style={{ borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 10, padding: 12 }} />
        <View style={{ position: "relative" }}>
          <TextInput placeholder="Mot de passe" secureTextEntry={!showPwd} value={password} onChangeText={setPassword} style={{ borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 10, padding: 12, paddingRight: 44 }} />
          <TouchableOpacity onPress={() => setShowPwd(s => !s)} style={{ position: "absolute", right: 10, top: 10 }}>
            <MaterialCommunityIcons name={showPwd ? "stethoscope-off" : "stethoscope"} size={22} color={colors.accent} />
          </TouchableOpacity>
        </View>
        {error ? <Text style={{ color: "red" }}>{error}</Text> : null}
        <Button title="Se connecter" onPress={onSubmit} />
      </View>
      <TouchableOpacity onPress={() => router.push("/(auth)/register")} style={{ alignSelf: "center", marginTop: 8 }}>
        <Text style={{ color: colors.secondary, fontWeight: "600" }}>S’inscrire si vous n’avez pas de compte</Text>
      </TouchableOpacity>
    </View>
  );
}
