import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { JOB_TYPES, type JobType, usePortfolio } from "@/context/PortfolioContext";
import { useColors } from "@/hooks/useColors";

const JOB_TYPE_LABELS: Record<JobType, string> = {
  editorial: "Editorial",
  commercial: "Commercial",
  events: "Events",
  social: "Social Media",
  campaign: "Campaign",
  film: "Film / TV",
  runway: "Runway",
};

export default function PortfolioEditorScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { addItem } = usePortfolio();

  const [jobType, setJobType] = useState<JobType>("editorial");
  const [title, setTitle] = useState("");
  const [brandCredit, setBrandCredit] = useState("");
  const [agencyCredit, setAgencyCredit] = useState("");
  const [shootDate, setShootDate] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isHighlight, setIsHighlight] = useState(false);
  const [saving, setSaving] = useState(false);

  const paddingTop = insets.top + (Platform.OS === "web" ? 67 : 0);
  const paddingBottom = insets.bottom + 24;

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert("Title required", "Give this work a title — e.g. 'Nando's Summer Campaign'");
      return;
    }
    setSaving(true);
    try {
      await addItem({
        jobType,
        title,
        brandCredit: brandCredit || null,
        agencyCredit: agencyCredit || null,
        shootDate: shootDate || null,
        description: description || null,
        imageUrl: imageUrl || null,
        isHighlight: isHighlight ? "true" : "false",
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch {
      Alert.alert("Error", "Could not save portfolio item. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: paddingTop + 10, borderBottomColor: colors.border, backgroundColor: colors.background }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn} activeOpacity={0.7}>
          <Feather name="x" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground, fontFamily: "Fraunces_700Bold" }]}>
          Add Work
        </Text>
        <TouchableOpacity onPress={handleSave} disabled={saving} style={styles.headerBtn} activeOpacity={0.8}>
          <Text style={[styles.saveBtn, { color: saving ? colors.dim : colors.primary, fontFamily: "Inter_700Bold" }]}>
            {saving ? "Saving..." : "Save"}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom }]} showsVerticalScrollIndicator={false}>
        {/* Job type picker */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
            Type of Work
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typePicker}>
            {JOB_TYPES.map((t) => (
              <TouchableOpacity
                key={t}
                onPress={() => { Haptics.selectionAsync(); setJobType(t); }}
                style={[
                  styles.typeChip,
                  {
                    backgroundColor: jobType === t ? colors.primary : colors.muted,
                    borderRadius: colors.radius - 4,
                  },
                ]}
                activeOpacity={0.8}
              >
                <Text style={[styles.typeChipText, { color: jobType === t ? "#fff" : colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>
                  {JOB_TYPE_LABELS[t]}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Title */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
            Title <Text style={{ color: colors.primary }}>*</Text>
          </Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="e.g. Nando's Summer Campaign"
            placeholderTextColor={colors.dim}
            style={[styles.input, { borderColor: colors.border, color: colors.foreground, backgroundColor: colors.card, borderRadius: colors.radius - 4, fontFamily: "Inter_400Regular" }]}
          />
        </View>

        {/* Brand credit */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>Brand Credit</Text>
          <TextInput
            value={brandCredit}
            onChangeText={setBrandCredit}
            placeholder="e.g. Nando's South Africa"
            placeholderTextColor={colors.dim}
            style={[styles.input, { borderColor: colors.border, color: colors.foreground, backgroundColor: colors.card, borderRadius: colors.radius - 4, fontFamily: "Inter_400Regular" }]}
          />
        </View>

        {/* Agency credit */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>Agency / Production</Text>
          <TextInput
            value={agencyCredit}
            onChangeText={setAgencyCredit}
            placeholder="e.g. Ogilvy JHB, Sweetie Films"
            placeholderTextColor={colors.dim}
            style={[styles.input, { borderColor: colors.border, color: colors.foreground, backgroundColor: colors.card, borderRadius: colors.radius - 4, fontFamily: "Inter_400Regular" }]}
          />
        </View>

        {/* Shoot date */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>Date</Text>
          <TextInput
            value={shootDate}
            onChangeText={setShootDate}
            placeholder="e.g. March 2025"
            placeholderTextColor={colors.dim}
            style={[styles.input, { borderColor: colors.border, color: colors.foreground, backgroundColor: colors.card, borderRadius: colors.radius - 4, fontFamily: "Inter_400Regular" }]}
          />
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>Description</Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Brief description of the work, your role, techniques used..."
            placeholderTextColor={colors.dim}
            multiline
            style={[styles.textarea, { borderColor: colors.border, color: colors.foreground, backgroundColor: colors.card, borderRadius: colors.radius - 4, fontFamily: "Inter_400Regular" }]}
          />
        </View>

        {/* Image URL */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>Image Link</Text>
          <Text style={[styles.sublabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            Paste a link to your work (Instagram post, Dropbox, Google Drive)
          </Text>
          <TextInput
            value={imageUrl}
            onChangeText={setImageUrl}
            placeholder="https://..."
            placeholderTextColor={colors.dim}
            autoCapitalize="none"
            keyboardType="url"
            style={[styles.input, { borderColor: colors.border, color: colors.foreground, backgroundColor: colors.card, borderRadius: colors.radius - 4, fontFamily: "Inter_400Regular" }]}
          />
        </View>

        {/* Highlight toggle */}
        <View style={[styles.highlightRow, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={[styles.label, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
              Pin to top of profile
            </Text>
            <Text style={[styles.sublabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              Highlights appear first when brands view your profile
            </Text>
          </View>
          <Switch
            value={isHighlight}
            onValueChange={(v) => { Haptics.selectionAsync(); setIsHighlight(v); }}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor="#fff"
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1,
  },
  headerBtn: { padding: 4, minWidth: 60 },
  headerTitle: { fontSize: 17 },
  saveBtn: { fontSize: 16, textAlign: "right" },
  scroll: { padding: 16, gap: 20 },
  section: { gap: 8 },
  label: { fontSize: 14 },
  sublabel: { fontSize: 12, lineHeight: 17 },
  typePicker: { flexGrow: 0 },
  typeChip: { paddingHorizontal: 14, paddingVertical: 8, marginRight: 8 },
  typeChipText: { fontSize: 13 },
  input: { borderWidth: 1, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14 },
  textarea: { borderWidth: 1, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, minHeight: 100, textAlignVertical: "top" },
  highlightRow: { flexDirection: "row", alignItems: "center", gap: 16, padding: 16, borderWidth: 1 },
});
