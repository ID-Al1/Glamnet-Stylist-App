import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { JOB_BOARD, type JobRole } from "@/constants/jobs";
import { useApplications } from "@/context/ApplicationsContext";
import { useColors } from "@/hooks/useColors";

const TYPE_COLORS: Record<string, string> = {
  Editorial: "#7A5AB8",
  Commercial: "#4A7AB8",
  "TV/Film": "#C4526E",
  Events: "#3A9E6A",
  Bridal: "#B8893A",
  "Social Media": "#C4526E",
};

const ROLE_OPTIONS: JobRole[] = [
  "MUA",
  "Hair",
  "Nails",
  "Model",
  "Photographer",
  "Stylist",
  "Lash & Brow",
];

export default function JobDetailScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { hasApplied, apply, withdraw, getApplication } = useApplications();
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState<JobRole | null>(null);
  const [message, setMessage] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const paddingTop = insets.top + (Platform.OS === "web" ? 67 : 0);
  const paddingBottom = insets.bottom + (Platform.OS === "web" ? 34 : 0);

  const job = JOB_BOARD.find((j) => j.id === id);
  const application = job ? getApplication(job.id) : undefined;
  const applied = job ? hasApplied(job.id) : false;
  const spotsLeft = job ? job.spotsTotal - job.spotsFilled : 0;

  if (!job) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, paddingTop }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.notFound, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
          Job not found
        </Text>
      </View>
    );
  }

  const typeColor = TYPE_COLORS[job.type] ?? colors.primary;
  const eligibleRoles = ROLE_OPTIONS.filter((r) => job.roles.includes(r));

  const handleApply = () => {
    if (!selectedRole) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    apply(job.id, selectedRole, message);
    setShowApplyModal(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
    setSelectedRole(null);
    setMessage("");
  };

  const handleWithdraw = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    withdraw(job.id);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: paddingTop + 10,
            backgroundColor: colors.background,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
          Job Brief
        </Text>
        <View style={{ width: 30 }} />
      </View>

      {/* Success toast */}
      {showSuccess && (
        <View
          style={[
            styles.successToast,
            { backgroundColor: colors.green, borderRadius: 12 },
          ]}
        >
          <Feather name="check-circle" size={16} color="#fff" />
          <Text style={[styles.successText, { color: "#fff", fontFamily: "Inter_600SemiBold" }]}>
            Application submitted!
          </Text>
        </View>
      )}

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: paddingBottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View
          style={[
            styles.hero,
            {
              backgroundColor: typeColor + "10",
              borderRadius: colors.radius + 4,
              borderColor: typeColor + "30",
              borderWidth: 1,
            },
          ]}
        >
          <View style={styles.heroTop}>
            <View style={styles.heroLeft}>
              {job.featured && (
                <View style={[styles.featuredBadge, { backgroundColor: colors.accent, borderRadius: 6 }]}>
                  <Feather name="star" size={9} color="#fff" />
                  <Text style={[styles.featuredText, { color: "#fff", fontFamily: "Inter_700Bold" }]}>
                    Featured
                  </Text>
                </View>
              )}
              {job.urgent && (
                <View style={[styles.urgentBadge, { backgroundColor: colors.primary, borderRadius: 6 }]}>
                  <Feather name="zap" size={9} color="#fff" />
                  <Text style={[styles.urgentText, { color: "#fff", fontFamily: "Inter_700Bold" }]}>
                    Urgent
                  </Text>
                </View>
              )}
            </View>
            <View style={[styles.typePill, { backgroundColor: typeColor + "20", borderRadius: 8, borderColor: typeColor + "40", borderWidth: 1 }]}>
              <Text style={[styles.typeText, { color: typeColor, fontFamily: "Inter_600SemiBold" }]}>
                {job.type}
              </Text>
            </View>
          </View>

          <Text style={[styles.heroTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
            {job.title}
          </Text>

          <View style={styles.heroClientRow}>
            <View style={[styles.clientAvatar, { backgroundColor: typeColor + "20", borderRadius: 10 }]}>
              <Text style={[styles.clientAvatarText, { color: typeColor, fontFamily: "Inter_700Bold" }]}>
                {job.client[0]}
              </Text>
            </View>
            <View>
              <Text style={[styles.clientName, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
                {job.client}
              </Text>
              <Text style={[styles.clientType, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                {job.clientType} · Posted {job.posted}
              </Text>
            </View>
          </View>
        </View>

        {/* Key details row */}
        <View style={styles.detailsRow}>
          {[
            { icon: "dollar-sign" as const, label: "Day Rate", value: job.rate, color: colors.accent },
            { icon: "map-pin" as const, label: "Location", value: `${job.city}, ${job.province}`, color: colors.primary },
            { icon: "calendar" as const, label: "Shoot Date", value: job.date, color: colors.purple },
            { icon: "clock" as const, label: "Deadline", value: job.deadline, color: spotsLeft <= 1 ? colors.primary : colors.green },
          ].map((d) => (
            <View
              key={d.label}
              style={[
                styles.detailCard,
                { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius },
              ]}
            >
              <Feather name={d.icon} size={13} color={d.color} />
              <Text style={[styles.detailValue, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
                {d.value}
              </Text>
              <Text style={[styles.detailLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                {d.label}
              </Text>
            </View>
          ))}
        </View>

        {/* Spots remaining */}
        <View
          style={[
            styles.spotsBar,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              borderRadius: colors.radius,
              borderWidth: 1,
            },
          ]}
        >
          <View style={styles.spotsLeft}>
            <Text style={[styles.spotsNum, { color: spotsLeft === 0 ? colors.dim : colors.green, fontFamily: "Inter_700Bold" }]}>
              {spotsLeft}
            </Text>
            <Text style={[styles.spotsLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              of {job.spotsTotal} spots remaining
            </Text>
          </View>
          <View style={[styles.spotsTrack, { backgroundColor: colors.muted, borderRadius: 4 }]}>
            {Array.from({ length: job.spotsTotal }).map((_, i) => (
              <View
                key={i}
                style={[
                  styles.spotDot,
                  {
                    backgroundColor:
                      i < job.spotsFilled ? colors.dim : colors.green,
                    borderRadius: 4,
                  },
                ]}
              />
            ))}
          </View>
        </View>

        {/* Brief */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
            Project Brief
          </Text>
          <Text style={[styles.briefText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            {job.brief}
          </Text>
        </View>

        {/* Roles needed */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
            Roles Needed
          </Text>
          <View style={styles.rolesWrap}>
            {job.roles.map((r) => (
              <View
                key={r}
                style={[
                  styles.roleChip,
                  {
                    backgroundColor: colors.primaryDim,
                    borderColor: colors.primary + "40",
                    borderRadius: 8,
                    borderWidth: 1,
                  },
                ]}
              >
                <Feather name="user" size={11} color={colors.primary} />
                <Text style={[styles.roleChipText, { color: colors.primary, fontFamily: "Inter_600SemiBold" }]}>
                  {r}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Requirements */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
            Requirements
          </Text>
          <View style={styles.requirementsList}>
            {job.requirements.map((req, i) => (
              <View key={i} style={styles.requirementRow}>
                <View style={[styles.requirementDot, { backgroundColor: typeColor }]} />
                <Text style={[styles.requirementText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                  {req}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Tags */}
        <View style={styles.tagsRow}>
          {job.tags.map((tag) => (
            <View
              key={tag}
              style={[
                styles.tag,
                { backgroundColor: colors.muted, borderRadius: 6, borderColor: colors.border, borderWidth: 1 },
              ]}
            >
              <Text style={[styles.tagText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                #{tag.replace(/ /g, "")}
              </Text>
            </View>
          ))}
        </View>

        {/* Application status if applied */}
        {applied && application && (
          <View
            style={[
              styles.applicationStatus,
              {
                backgroundColor: colors.greenDim,
                borderRadius: colors.radius,
                borderColor: colors.green + "40",
                borderWidth: 1,
              },
            ]}
          >
            <View style={styles.appStatusTop}>
              <Feather name="check-circle" size={16} color={colors.green} />
              <Text style={[styles.appStatusTitle, { color: colors.green, fontFamily: "Inter_700Bold" }]}>
                Application Submitted
              </Text>
            </View>
            <Text style={[styles.appStatusRole, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>
              Role: {application.role}
            </Text>
            {application.message.length > 0 && (
              <Text
                style={[styles.appStatusMsg, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}
                numberOfLines={3}
              >
                "{application.message}"
              </Text>
            )}
            <View style={[styles.pendingBadge, { backgroundColor: colors.accentDim, borderRadius: 6 }]}>
              <View style={[styles.pendingDot, { backgroundColor: colors.accent }]} />
              <Text style={[styles.pendingText, { color: colors.accent, fontFamily: "Inter_500Medium" }]}>
                Pending review by client
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Bottom CTA */}
      <View
        style={[
          styles.bottomBar,
          {
            paddingBottom: paddingBottom + 8,
            paddingHorizontal: 16,
            paddingTop: 16,
            borderTopColor: colors.border,
            backgroundColor: colors.background,
          },
        ]}
      >
        {applied ? (
          <View style={styles.appliedRow}>
            <View
              style={[
                styles.appliedBadge,
                {
                  backgroundColor: colors.greenDim,
                  borderRadius: colors.radius,
                  borderColor: colors.green + "40",
                  borderWidth: 1,
                  flex: 1,
                },
              ]}
            >
              <Feather name="check-circle" size={16} color={colors.green} />
              <Text style={[styles.appliedText, { color: colors.green, fontFamily: "Inter_700Bold" }]}>
                Applied
              </Text>
            </View>
            <TouchableOpacity
              style={[
                styles.withdrawBtn,
                {
                  borderColor: colors.border,
                  borderRadius: colors.radius,
                  borderWidth: 1,
                },
              ]}
              onPress={handleWithdraw}
              activeOpacity={0.75}
            >
              <Text style={[styles.withdrawText, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>
                Withdraw
              </Text>
            </TouchableOpacity>
          </View>
        ) : spotsLeft === 0 ? (
          <View
            style={[
              styles.filledBtn,
              { backgroundColor: colors.muted, borderRadius: colors.radius },
            ]}
          >
            <Text style={[styles.filledText, { color: colors.mutedForeground, fontFamily: "Inter_600SemiBold" }]}>
              All spots filled
            </Text>
          </View>
        ) : (
          <TouchableOpacity
            style={[
              styles.applyBtn,
              { backgroundColor: colors.primary, borderRadius: colors.radius },
            ]}
            onPress={() => { Haptics.selectionAsync(); setShowApplyModal(true); }}
            activeOpacity={0.82}
          >
            <Feather name="send" size={16} color="#fff" />
            <Text style={[styles.applyBtnText, { color: "#fff", fontFamily: "Inter_700Bold" }]}>
              Apply Now
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Apply Modal */}
      <Modal
        visible={showApplyModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowApplyModal(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={() => setShowApplyModal(false)}
          />
          <View
            style={[
              styles.modalSheet,
              {
                backgroundColor: colors.background,
                paddingBottom: paddingBottom + 16,
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
              },
            ]}
          >
            {/* Handle */}
            <View style={[styles.modalHandle, { backgroundColor: colors.border }]} />

            <Text style={[styles.modalTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
              Apply for this job
            </Text>
            <Text style={[styles.modalSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              {job.title}
            </Text>

            {/* Role picker */}
            <Text style={[styles.modalLabel, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
              Which role are you applying for?
            </Text>
            <View style={styles.modalRoles}>
              {eligibleRoles.map((r) => (
                <TouchableOpacity
                  key={r}
                  onPress={() => { Haptics.selectionAsync(); setSelectedRole(r); }}
                  style={[
                    styles.modalRoleBtn,
                    {
                      backgroundColor:
                        selectedRole === r ? colors.primary : colors.muted,
                      borderRadius: 10,
                      borderColor:
                        selectedRole === r ? colors.primary : colors.border,
                      borderWidth: 1.5,
                    },
                  ]}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.modalRoleBtnText,
                      {
                        color: selectedRole === r ? "#fff" : colors.foreground,
                        fontFamily:
                          selectedRole === r ? "Inter_700Bold" : "Inter_400Regular",
                      },
                    ]}
                  >
                    {r}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Message */}
            <Text style={[styles.modalLabel, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
              Message to client{" "}
              <Text style={[styles.modalOptional, { color: colors.dim }]}>(optional)</Text>
            </Text>
            <View
              style={[
                styles.messageInputWrap,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  borderRadius: colors.radius,
                },
              ]}
            >
              <TextInput
                value={message}
                onChangeText={setMessage}
                placeholder="Introduce yourself, share your portfolio link, or add any relevant details..."
                placeholderTextColor={colors.dim}
                multiline
                numberOfLines={4}
                style={[
                  styles.messageInput,
                  { color: colors.foreground, fontFamily: "Inter_400Regular" },
                ]}
                textAlignVertical="top"
              />
            </View>

            <TouchableOpacity
              style={[
                styles.submitBtn,
                {
                  backgroundColor: selectedRole ? colors.primary : colors.muted,
                  borderRadius: colors.radius,
                  opacity: selectedRole ? 1 : 0.6,
                },
              ]}
              onPress={handleApply}
              disabled={!selectedRole}
              activeOpacity={0.82}
            >
              <Text style={[styles.submitBtnText, { color: selectedRole ? "#fff" : colors.dim, fontFamily: "Inter_700Bold" }]}>
                {selectedRole ? `Apply as ${selectedRole}` : "Select a role to apply"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  notFound: { textAlign: "center", marginTop: 40, fontSize: 16 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 16 },
  successToast: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginHorizontal: 16,
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  successText: { fontSize: 14 },
  scroll: { padding: 16, gap: 14 },
  hero: { padding: 18, gap: 12 },
  heroTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  heroLeft: { flexDirection: "row", gap: 6 },
  featuredBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  featuredText: { fontSize: 10 },
  urgentBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  urgentText: { fontSize: 10 },
  typePill: { paddingHorizontal: 10, paddingVertical: 5 },
  typeText: { fontSize: 11 },
  heroTitle: { fontSize: 18, letterSpacing: -0.4, lineHeight: 24 },
  heroClientRow: { flexDirection: "row", gap: 10, alignItems: "center" },
  clientAvatar: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
  },
  clientAvatarText: { fontSize: 14 },
  clientName: { fontSize: 13 },
  clientType: { fontSize: 11 },
  detailsRow: { flexDirection: "row", gap: 8 },
  detailCard: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    alignItems: "center",
    gap: 4,
  },
  detailValue: { fontSize: 12, textAlign: "center" as const, letterSpacing: -0.2 },
  detailLabel: { fontSize: 9, textTransform: "uppercase" as const, letterSpacing: 0.4, textAlign: "center" as const },
  spotsBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
    gap: 12,
  },
  spotsLeft: { flexDirection: "row", alignItems: "baseline", gap: 6 },
  spotsNum: { fontSize: 22, letterSpacing: -0.5 },
  spotsLabel: { fontSize: 12 },
  spotsTrack: { flexDirection: "row", gap: 5, padding: 8 },
  spotDot: { width: 10, height: 10 },
  section: { gap: 10 },
  sectionTitle: { fontSize: 15, letterSpacing: -0.3 },
  briefText: { fontSize: 13, lineHeight: 21 },
  rolesWrap: { flexDirection: "row", flexWrap: "wrap" as const, gap: 8 },
  roleChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  roleChipText: { fontSize: 13 },
  requirementsList: { gap: 10 },
  requirementRow: { flexDirection: "row", gap: 10, alignItems: "flex-start" },
  requirementDot: { width: 6, height: 6, borderRadius: 3, marginTop: 6, flexShrink: 0 },
  requirementText: { fontSize: 13, lineHeight: 20, flex: 1 },
  tagsRow: { flexDirection: "row", flexWrap: "wrap" as const, gap: 6 },
  tag: { paddingHorizontal: 10, paddingVertical: 5 },
  tagText: { fontSize: 11 },
  applicationStatus: { padding: 16, gap: 10 },
  appStatusTop: { flexDirection: "row", alignItems: "center", gap: 8 },
  appStatusTitle: { fontSize: 14 },
  appStatusRole: { fontSize: 13 },
  appStatusMsg: { fontSize: 12, lineHeight: 18, fontStyle: "italic" as const },
  pendingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignSelf: "flex-start",
  },
  pendingDot: { width: 6, height: 6, borderRadius: 3 },
  pendingText: { fontSize: 11 },
  bottomBar: { flexDirection: "row", borderTopWidth: 1 },
  appliedRow: { flex: 1, flexDirection: "row", gap: 10 },
  appliedBadge: {
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  appliedText: { fontSize: 15 },
  withdrawBtn: {
    height: 52,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  withdrawText: { fontSize: 13 },
  filledBtn: {
    flex: 1,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
  },
  filledText: { fontSize: 15 },
  applyBtn: {
    flex: 1,
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  applyBtnText: { fontSize: 16 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(28,20,16,0.55)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    padding: 20,
    gap: 14,
  },
  modalHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 4,
  },
  modalTitle: { fontSize: 18, letterSpacing: -0.4 },
  modalSub: { fontSize: 13, marginTop: -8 },
  modalLabel: { fontSize: 14 },
  modalOptional: { fontSize: 12 },
  modalRoles: { flexDirection: "row", flexWrap: "wrap" as const, gap: 8 },
  modalRoleBtn: { paddingHorizontal: 16, paddingVertical: 10 },
  modalRoleBtnText: { fontSize: 14 },
  messageInputWrap: { borderWidth: 1, padding: 12 },
  messageInput: { fontSize: 14, minHeight: 80 },
  submitBtn: {
    height: 52,
    alignItems: "center",
    justifyContent: "center",
  },
  submitBtnText: { fontSize: 16 },
});
