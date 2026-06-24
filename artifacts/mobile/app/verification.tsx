import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { router } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import Colors from "@/constants/colors";

// ─── Types ────────────────────────────────────────────────────────────────────

type VerificationType = "identity" | "portfolio" | "skill" | "agency";
type VerificationStatus = "pending" | "approved" | "rejected" | "unsubmitted";

interface Verification {
  id: string;
  type: VerificationType;
  status: VerificationStatus;
  submittedAt: string;
  reviewedAt?: string;
  notes?: string;
  evidenceUrl?: string;
}

const VERIFICATION_TYPES: {
  type: VerificationType;
  label: string;
  description: string;
  evidenceHint: string;
  icon: string;
}[] = [
  {
    type: "identity",
    label: "Identity",
    description: "Confirm you are who you say you are. Builds instant client trust.",
    evidenceHint: "Link to a scan of your ID, passport, or driver's licence",
    icon: "🪪",
  },
  {
    type: "portfolio",
    label: "Portfolio",
    description: "Verify past work credits with published tearsheets or links.",
    evidenceHint: "Link to your Behance, Instagram, or a tearsheet PDF",
    icon: "🖼",
  },
  {
    type: "skill",
    label: "Skill",
    description: "Certify a specialist skill — makeup artistry, hair styling, photography.",
    evidenceHint: "Link to a certificate, course completion, or professional credential",
    icon: "✂️",
  },
  {
    type: "agency",
    label: "Agency",
    description: "Prove you represent or are signed to a registered agency.",
    evidenceHint: "Link to your agency profile page or a signed letter",
    icon: "🏢",
  },
];

// ─── Status badge helper ──────────────────────────────────────────────────────

function StatusBadge({ status }: { status: VerificationStatus }) {
  const map: Record<VerificationStatus, { bg: string; label: string }> = {
    approved: { bg: Colors.green, label: "Verified" },
    pending: { bg: Colors.accentDim, label: "In Review" },
    rejected: { bg: "#7f1d1d", label: "Rejected" },
    unsubmitted: { bg: Colors.border, label: "Not Submitted" },
  };
  const { bg, label } = map[status];
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={styles.badgeText}>{label}</Text>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

const API_BASE = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000/api";

export default function VerificationScreen() {
  const { token } = useAuth();

  const [verifications, setVerifications] = useState<Verification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Submission form state
  const [activeType, setActiveType] = useState<VerificationType | null>(null);
  const [evidenceUrl, setEvidenceUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load existing verifications
  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/trust/verifications/mine`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setVerifications(data.verifications ?? []);
      }
    } catch {
      // silently fail — will show "unsubmitted" for all
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const statusFor = (type: VerificationType): VerificationStatus => {
    const match = verifications.find((v) => v.type === type);
    return match ? (match.status as VerificationStatus) : "unsubmitted";
  };

  const handleSubmit = async () => {
    if (!activeType) return;
    if (!evidenceUrl.trim()) {
      Alert.alert("Evidence required", "Please paste a link to your evidence.");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/trust/verifications`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ type: activeType, evidenceUrl: evidenceUrl.trim(), notes: notes.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        Alert.alert("Could not submit", data.error ?? "Please try again.");
        return;
      }
      Alert.alert("Submitted!", "We'll review your request within 2 business days.");
      setActiveType(null);
      setEvidenceUrl("");
      setNotes("");
      load();
    } catch {
      Alert.alert("Network error", "Check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      {/* Header */}
      <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>
      <Text style={styles.title}>Verification</Text>
      <Text style={styles.subtitle}>
        Verified badges appear on your profile and booking cards, signalling trust to clients at a glance.
      </Text>

      {isLoading ? (
        <ActivityIndicator color={Colors.accent} style={{ marginTop: 32 }} />
      ) : (
        VERIFICATION_TYPES.map(({ type, label, description, evidenceHint, icon }) => {
          const status = statusFor(type);
          const isOpen = activeType === type;
          const isApproved = status === "approved";
          return (
            <View key={type} style={styles.card}>
              {/* Card header row */}
              <View style={styles.cardHeader}>
                <Text style={styles.cardIcon}>{icon}</Text>
                <View style={styles.cardTitle}>
                  <Text style={styles.cardLabel}>{label} Verification</Text>
                  <Text style={styles.cardDesc}>{description}</Text>
                </View>
                <StatusBadge status={status} />
              </View>

              {/* Expandable submission form */}
              {!isApproved && status !== "pending" && (
                <TouchableOpacity
                  style={styles.applyBtn}
                  onPress={() => setActiveType(isOpen ? null : type)}
                >
                  <Text style={styles.applyBtnText}>{isOpen ? "Cancel" : "Apply"}</Text>
                </TouchableOpacity>
              )}

              {isOpen && (
                <View style={styles.form}>
                  <Text style={styles.formLabel}>Evidence link *</Text>
                  <Text style={styles.formHint}>{evidenceHint}</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="https://..."
                    placeholderTextColor={Colors.mutedForeground}
                    value={evidenceUrl}
                    onChangeText={setEvidenceUrl}
                    autoCapitalize="none"
                    keyboardType="url"
                  />
                  <Text style={[styles.formLabel, { marginTop: 12 }]}>Notes (optional)</Text>
                  <TextInput
                    style={[styles.input, styles.inputMulti]}
                    placeholder="Any context for our team..."
                    placeholderTextColor={Colors.mutedForeground}
                    value={notes}
                    onChangeText={setNotes}
                    multiline
                    numberOfLines={3}
                  />
                  <TouchableOpacity
                    style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]}
                    onPress={handleSubmit}
                    disabled={isSubmitting}
                  >
                    {isSubmitting
                      ? <ActivityIndicator color="#fff" size="small" />
                      : <Text style={styles.submitBtnText}>Submit for Review</Text>
                    }
                  </TouchableOpacity>
                </View>
              )}

              {/* Rejection note */}
              {status === "rejected" && (() => {
                const v = verifications.find((x) => x.type === type);
                return v?.notes ? (
                  <View style={styles.rejectionNote}>
                    <Text style={styles.rejectionNoteText}>Reason: {v.notes}</Text>
                  </View>
                ) : null;
              })()}
            </View>
          );
        })
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 20 },

  backBtn: { marginBottom: 8 },
  backText: { color: Colors.accent, fontSize: 15, fontFamily: "Inter_500Medium" },

  title: { fontSize: 26, fontFamily: "Fraunces_700Bold", color: Colors.foreground, marginBottom: 6 },
  subtitle: { fontSize: 14, color: Colors.mutedForeground, fontFamily: "Inter_400Regular", marginBottom: 24, lineHeight: 20 },

  badge: { borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4, alignSelf: "flex-start" },
  badgeText: { fontSize: 11, fontFamily: "Inter_600SemiBold", color: "#fff", textTransform: "uppercase", letterSpacing: 0.5 },

  card: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    marginBottom: 16,
  },
  cardHeader: { flexDirection: "row", alignItems: "flex-start", gap: 12, marginBottom: 12 },
  cardIcon: { fontSize: 28, lineHeight: 34 },
  cardTitle: { flex: 1 },
  cardLabel: { fontSize: 16, fontFamily: "Inter_600SemiBold", color: Colors.foreground, marginBottom: 4 },
  cardDesc: { fontSize: 13, color: Colors.mutedForeground, fontFamily: "Inter_400Regular", lineHeight: 18 },

  applyBtn: {
    borderWidth: 1,
    borderColor: Colors.accent,
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: "center",
  },
  applyBtnText: { color: Colors.accent, fontSize: 14, fontFamily: "Inter_600SemiBold" },

  form: { marginTop: 14 },
  formLabel: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: Colors.foreground, marginBottom: 2 },
  formHint: { fontSize: 12, color: Colors.mutedForeground, fontFamily: "Inter_400Regular", marginBottom: 6 },
  input: {
    backgroundColor: Colors.background,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.foreground,
    fontFamily: "Inter_400Regular",
  },
  inputMulti: { minHeight: 72, textAlignVertical: "top" },

  submitBtn: {
    marginTop: 14,
    backgroundColor: Colors.accent,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText: { color: "#fff", fontSize: 15, fontFamily: "Inter_600SemiBold" },

  rejectionNote: {
    marginTop: 10,
    backgroundColor: "#450a0a33",
    borderRadius: 8,
    padding: 10,
  },
  rejectionNoteText: { fontSize: 13, color: "#f87171", fontFamily: "Inter_400Regular" },
});
