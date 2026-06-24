/**
 * Castings feed — public photographer casting calls.
 * Models and stylists browse and apply here.
 * Photographers use this screen to post new calls.
 *
 * Route: /castings
 */
import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
  StyleSheet,
} from "react-native";
import { router } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import Colors from "@/constants/colors";

const API_BASE = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000/api";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Casting {
  id: string;
  photographerId: string;
  title: string;
  concept: string;
  location?: string;
  shootDate?: string;
  compensation?: string;
  rolesNeeded: string;
  status: string;
  createdAt: string;
}

// ─── Helper: role chips ───────────────────────────────────────────────────────

function RoleChips({ rolesNeeded }: { rolesNeeded: string }) {
  const roles = rolesNeeded.split(",").map((r) => r.trim()).filter(Boolean);
  return (
    <View style={styles.rolesRow}>
      {roles.map((r) => (
        <View key={r} style={styles.roleChip}>
          <Text style={styles.roleChipText}>{r.replace(/_/g, " ")}</Text>
        </View>
      ))}
    </View>
  );
}

// ─── Casting card ─────────────────────────────────────────────────────────────

function CastingCard({ casting, onApply }: { casting: Casting; onApply: (c: Casting) => void }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <Text style={styles.cardTitle}>{casting.title}</Text>
        <View style={[styles.statusBadge, casting.status === "open" ? styles.statusOpen : styles.statusClosed]}>
          <Text style={styles.statusText}>{casting.status}</Text>
        </View>
      </View>
      <Text style={styles.cardConcept}>{casting.concept}</Text>
      <RoleChips rolesNeeded={casting.rolesNeeded} />
      <View style={styles.metaRow}>
        {casting.location ? <Text style={styles.metaText}>📍 {casting.location}</Text> : null}
        {casting.shootDate ? <Text style={styles.metaText}>📅 {casting.shootDate}</Text> : null}
        {casting.compensation ? <Text style={styles.metaText}>💰 {casting.compensation}</Text> : null}
      </View>
      {casting.status === "open" && (
        <TouchableOpacity style={styles.applyBtn} onPress={() => onApply(casting)}>
          <Text style={styles.applyBtnText}>Apply</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ─── Apply modal ──────────────────────────────────────────────────────────────

function ApplyModal({
  casting,
  token,
  onClose,
  onSuccess,
}: {
  casting: Casting;
  token: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const roles = casting.rolesNeeded.split(",").map((r) => r.trim()).filter(Boolean);
  const [selectedRole, setSelectedRole] = useState(roles[0] ?? "");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async () => {
    if (!selectedRole) { Alert.alert("Select a role"); return; }
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/flywheel/castings/${casting.id}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ role: selectedRole, message: message.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok) { Alert.alert("Could not apply", data.error ?? "Try again"); return; }
      Alert.alert("Applied!", "The photographer will review your application.");
      onSuccess();
    } catch {
      Alert.alert("Network error", "Check your connection");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.modalOverlay}>
      <View style={styles.modalCard}>
        <Text style={styles.modalTitle}>Apply — {casting.title}</Text>
        <Text style={styles.formLabel}>Your role</Text>
        <View style={styles.rolesRow}>
          {roles.map((r) => (
            <TouchableOpacity
              key={r}
              style={[styles.roleChip, selectedRole === r && styles.roleChipSelected]}
              onPress={() => setSelectedRole(r)}
            >
              <Text style={[styles.roleChipText, selectedRole === r && styles.roleChipTextSelected]}>
                {r.replace(/_/g, " ")}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={[styles.formLabel, { marginTop: 14 }]}>Message (optional)</Text>
        <TextInput
          style={[styles.input, styles.inputMulti]}
          placeholder="Tell the photographer about your experience..."
          placeholderTextColor={Colors.mutedForeground}
          value={message}
          onChangeText={setMessage}
          multiline
          numberOfLines={4}
        />
        <View style={styles.modalActions}>
          <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.submitBtn, isSubmitting && { opacity: 0.6 }]}
            onPress={submit}
            disabled={isSubmitting}
          >
            {isSubmitting
              ? <ActivityIndicator color="#fff" size="small" />
              : <Text style={styles.submitBtnText}>Send Application</Text>
            }
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

// ─── Post casting modal ───────────────────────────────────────────────────────

function PostCastingModal({ token, onClose, onSuccess }: { token: string; onClose: () => void; onSuccess: () => void }) {
  const [title, setTitle] = useState("");
  const [concept, setConcept] = useState("");
  const [location, setLocation] = useState("");
  const [shootDate, setShootDate] = useState("");
  const [compensation, setCompensation] = useState("");
  const [rolesNeeded, setRolesNeeded] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const PRESET_ROLES = ["model", "stylist", "makeup_artist", "hair_stylist", "assistant"];

  const toggleRole = (r: string) => {
    const current = rolesNeeded.split(",").map((x) => x.trim()).filter(Boolean);
    if (current.includes(r)) {
      setRolesNeeded(current.filter((x) => x !== r).join(","));
    } else {
      setRolesNeeded([...current, r].join(","));
    }
  };

  const selectedRoles = rolesNeeded.split(",").map((x) => x.trim()).filter(Boolean);

  const submit = async () => {
    if (!title.trim() || !concept.trim() || !rolesNeeded.trim()) {
      Alert.alert("Fill in title, concept, and at least one role"); return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/flywheel/castings`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title, concept, location, shootDate, compensation, rolesNeeded }),
      });
      const data = await res.json();
      if (!res.ok) { Alert.alert("Error", data.error ?? "Try again"); return; }
      Alert.alert("Posted!", "Your casting call is live.");
      onSuccess();
    } catch {
      Alert.alert("Network error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.modalOverlay} contentContainerStyle={{ padding: 0 }} keyboardShouldPersistTaps="handled">
      <View style={styles.modalCard}>
        <Text style={styles.modalTitle}>Post a Casting Call</Text>

        {[
          { label: "Title *", value: title, setter: setTitle, placeholder: "e.g. Lookbook shoot for emerging brand" },
          { label: "Concept / Mood *", value: concept, setter: setConcept, placeholder: "Describe the shoot vibe and vision..." },
          { label: "Location", value: location, setter: setLocation, placeholder: "e.g. Cape Town CBD studio" },
          { label: "Shoot date", value: shootDate, setter: setShootDate, placeholder: "e.g. 2026-07-15" },
          { label: "Compensation", value: compensation, setter: setCompensation, placeholder: "e.g. TFP, R 500, negotiable" },
        ].map(({ label, value, setter, placeholder }) => (
          <View key={label}>
            <Text style={[styles.formLabel, { marginTop: 12 }]}>{label}</Text>
            <TextInput
              style={styles.input}
              value={value}
              onChangeText={setter}
              placeholder={placeholder}
              placeholderTextColor={Colors.mutedForeground}
              multiline={label.includes("Concept")}
              numberOfLines={label.includes("Concept") ? 3 : 1}
            />
          </View>
        ))}

        <Text style={[styles.formLabel, { marginTop: 12 }]}>Roles needed *</Text>
        <View style={styles.rolesRow}>
          {PRESET_ROLES.map((r) => (
            <TouchableOpacity
              key={r}
              style={[styles.roleChip, selectedRoles.includes(r) && styles.roleChipSelected]}
              onPress={() => toggleRole(r)}
            >
              <Text style={[styles.roleChipText, selectedRoles.includes(r) && styles.roleChipTextSelected]}>
                {r.replace(/_/g, " ")}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.modalActions}>
          <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.submitBtn, isSubmitting && { opacity: 0.6 }]}
            onPress={submit}
            disabled={isSubmitting}
          >
            {isSubmitting
              ? <ActivityIndicator color="#fff" size="small" />
              : <Text style={styles.submitBtnText}>Post Casting</Text>
            }
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function CastingsScreen() {
  const { token, user } = useAuth();
  const [castings, setCastings] = useState<Casting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [applyTarget, setApplyTarget] = useState<Casting | null>(null);
  const [showPost, setShowPost] = useState(false);

  const isPhotographer = (user as any)?.role === "photographer";

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/flywheel/castings`);
      if (res.ok) {
        const data = await res.json();
        setCastings(data.castings ?? []);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Casting Calls</Text>
        {isPhotographer && (
          <TouchableOpacity style={styles.postBtn} onPress={() => setShowPost(true)}>
            <Text style={styles.postBtnText}>+ Post</Text>
          </TouchableOpacity>
        )}
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={Colors.accent} size="large" />
        </View>
      ) : castings.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>No open casting calls yet.</Text>
          {isPhotographer && (
            <TouchableOpacity style={[styles.postBtn, { marginTop: 16 }]} onPress={() => setShowPost(true)}>
              <Text style={styles.postBtnText}>Post the first one</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
          {castings.map((c) => (
            <CastingCard key={c.id} casting={c} onApply={setApplyTarget} />
          ))}
          <View style={{ height: 32 }} />
        </ScrollView>
      )}

      {/* Apply modal */}
      <Modal visible={!!applyTarget} transparent animationType="slide">
        {applyTarget && (
          <ApplyModal
            casting={applyTarget}
            token={token ?? ""}
            onClose={() => setApplyTarget(null)}
            onSuccess={() => { setApplyTarget(null); load(); }}
          />
        )}
      </Modal>

      {/* Post modal */}
      <Modal visible={showPost} transparent animationType="slide">
        <PostCastingModal
          token={token ?? ""}
          onClose={() => setShowPost(false)}
          onSuccess={() => { setShowPost(false); load(); }}
        />
      </Modal>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    paddingTop: 52,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 12,
  },
  headerTitle: { flex: 1, fontSize: 20, fontFamily: "Fraunces_700Bold", color: Colors.foreground },
  backText: { color: Colors.accent, fontSize: 15, fontFamily: "Inter_500Medium" },
  postBtn: { backgroundColor: Colors.accent, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8 },
  postBtnText: { color: "#fff", fontSize: 14, fontFamily: "Inter_600SemiBold" },
  emptyText: { fontSize: 15, color: Colors.mutedForeground, fontFamily: "Inter_400Regular" },

  card: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
  },
  cardTop: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 6 },
  cardTitle: { fontSize: 16, fontFamily: "Inter_600SemiBold", color: Colors.foreground, flex: 1, marginRight: 8 },
  cardConcept: { fontSize: 13, color: Colors.mutedForeground, fontFamily: "Inter_400Regular", lineHeight: 18, marginBottom: 10 },
  statusBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  statusOpen: { backgroundColor: Colors.green },
  statusClosed: { backgroundColor: Colors.border },
  statusText: { fontSize: 11, fontFamily: "Inter_600SemiBold", color: "#fff" },

  rolesRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 10 },
  roleChip: {
    backgroundColor: Colors.accentDim,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  roleChipSelected: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  roleChipText: { fontSize: 12, color: Colors.accent, fontFamily: "Inter_500Medium" },
  roleChipTextSelected: { color: "#fff" },

  metaRow: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 12 },
  metaText: { fontSize: 12, color: Colors.mutedForeground, fontFamily: "Inter_400Regular" },

  applyBtn: {
    backgroundColor: Colors.accent,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
  },
  applyBtnText: { color: "#fff", fontSize: 14, fontFamily: "Inter_600SemiBold" },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)" },
  modalCard: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    marginTop: "auto",
  },
  modalTitle: { fontSize: 20, fontFamily: "Fraunces_700Bold", color: Colors.foreground, marginBottom: 16 },

  formLabel: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: Colors.foreground, marginBottom: 4 },
  input: {
    backgroundColor: Colors.card,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.foreground,
    fontFamily: "Inter_400Regular",
  },
  inputMulti: { minHeight: 80, textAlignVertical: "top" },

  modalActions: { flexDirection: "row", gap: 10, marginTop: 20 },
  cancelBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  cancelBtnText: { color: Colors.foreground, fontSize: 14, fontFamily: "Inter_500Medium" },
  submitBtn: {
    flex: 2,
    backgroundColor: Colors.accent,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  submitBtnText: { color: "#fff", fontSize: 14, fontFamily: "Inter_600SemiBold" },
});
