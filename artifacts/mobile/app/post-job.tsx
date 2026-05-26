import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import React, { useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { SA_PROVINCES } from "@/constants/data";
import { JOB_TYPES, type JobRole, type JobType } from "@/constants/jobs";
import { usePostings, type PostingDraft } from "@/context/PostingsContext";
import { useColors } from "@/hooks/useColors";

const ROLES: JobRole[] = ["MUA", "Hair", "Nails", "Model", "Photographer", "Stylist", "Lash & Brow"];
const CLIENT_TYPES = ["Brand", "Agency", "Private"] as const;
const SPOTS_OPTIONS = [1, 2, 3, 4, 5, 6];

const TOTAL_STEPS = 4;

const STEP_LABELS = [
  "The Basics",
  "Location & Dates",
  "Roles & Rate",
  "Brief & Details",
];

const STEP_ICONS: Array<React.ComponentProps<typeof Feather>["name"]> = [
  "edit-3",
  "map-pin",
  "users",
  "file-text",
];

function StepIndicator({ current, colors }: { current: number; colors: ReturnType<typeof import("@/hooks/useColors").useColors> }) {
  return (
    <View style={stepStyles.row}>
      {Array.from({ length: TOTAL_STEPS }).map((_, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <React.Fragment key={i}>
            <View
              style={[
                stepStyles.circle,
                {
                  backgroundColor: done
                    ? colors.green
                    : active
                    ? colors.primary
                    : colors.muted,
                  borderColor: done
                    ? colors.green
                    : active
                    ? colors.primary
                    : colors.border,
                },
              ]}
            >
              {done ? (
                <Feather name="check" size={12} color="#fff" />
              ) : (
                <Feather name={STEP_ICONS[i]} size={11} color={active ? "#fff" : colors.dim} />
              )}
            </View>
            {i < TOTAL_STEPS - 1 && (
              <View
                style={[
                  stepStyles.line,
                  { backgroundColor: done ? colors.green : colors.border },
                ]}
              />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
}

const stepStyles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 0 },
  circle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  line: { flex: 1, height: 1.5 },
});

export default function PostJobScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { addPosting } = usePostings();
  const scrollRef = useRef<ScrollView>(null);

  const paddingTop = insets.top + (Platform.OS === "web" ? 67 : 0);
  const paddingBottom = insets.bottom + (Platform.OS === "web" ? 34 : 0);

  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  // Step 1 fields
  const [title, setTitle] = useState("");
  const [client, setClient] = useState("");
  const [clientType, setClientType] = useState<"Brand" | "Agency" | "Private">("Brand");
  const [jobType, setJobType] = useState<JobType>("Editorial");
  const [urgent, setUrgent] = useState(false);

  // Step 2 fields
  const [province, setProvince] = useState("GP");
  const [city, setCity] = useState("");
  const [shootDate, setShootDate] = useState("");
  const [deadline, setDeadline] = useState("");

  // Step 3 fields
  const [roles, setRoles] = useState<JobRole[]>([]);
  const [spots, setSpots] = useState(1);
  const [rateText, setRateText] = useState("");

  // Step 4 fields
  const [brief, setBrief] = useState("");
  const [reqInput, setReqInput] = useState("");
  const [requirements, setRequirements] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  const scrollTop = () => scrollRef.current?.scrollTo({ y: 0, animated: true });

  const canAdvance = (() => {
    if (step === 0) return title.trim().length > 3 && client.trim().length > 1;
    if (step === 1) return city.trim().length > 1 && shootDate.trim().length > 2 && deadline.trim().length > 2;
    if (step === 2) return roles.length > 0 && rateText.trim().length > 0;
    if (step === 3) return brief.trim().length > 20;
    return false;
  })();

  const handleNext = () => {
    if (!canAdvance) return;
    Haptics.selectionAsync();
    setStep((s) => s + 1);
    scrollTop();
  };

  const handleBack = () => {
    Haptics.selectionAsync();
    setStep((s) => s - 1);
    scrollTop();
  };

  const handleSubmit = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setSubmitting(true);
    const rateNum = parseInt(rateText.replace(/\D/g, ""), 10) || 0;
    const draft: PostingDraft = {
      title: title.trim(),
      client: client.trim(),
      clientType,
      brief: brief.trim(),
      type: jobType,
      province,
      city: city.trim(),
      date: shootDate.trim(),
      deadline: deadline.trim(),
      rate: `R${rateNum.toLocaleString("en-ZA")}`,
      rateNum,
      urgent,
      roles,
      spotsTotal: spots,
      requirements,
      tags,
    };
    addPosting(draft);
    setTimeout(() => {
      setSubmitting(false);
      router.replace("/(tabs)/earn");
    }, 600);
  };

  const toggleRole = (r: JobRole) => {
    Haptics.selectionAsync();
    setRoles((prev) => (prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r]));
  };

  const addRequirement = () => {
    if (!reqInput.trim()) return;
    setRequirements((prev) => [...prev, reqInput.trim()]);
    setReqInput("");
  };

  const addTag = () => {
    if (!tagInput.trim()) return;
    const clean = tagInput.trim().replace(/^#/, "");
    if (clean && !tags.includes(clean)) setTags((prev) => [...prev, clean]);
    setTagInput("");
  };

  const provinceOpts = SA_PROVINCES.filter((p) => p.id !== "all");
  const jobTypeOpts = JOB_TYPES.filter((t) => t.id !== "all");

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
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn} activeOpacity={0.7}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
            Post a Casting
          </Text>
          <Text style={[styles.headerSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            Step {step + 1} of {TOTAL_STEPS} · {STEP_LABELS[step]}
          </Text>
        </View>
        <View style={{ width: 30 }} />
      </View>

      {/* Progress */}
      <View style={[styles.progressWrap, { borderBottomColor: colors.borderLight, backgroundColor: colors.card }]}>
        <View style={[styles.progressTrack, { backgroundColor: colors.muted, borderRadius: 3 }]}>
          <View
            style={[
              styles.progressFill,
              {
                backgroundColor: colors.primary,
                borderRadius: 3,
                width: `${((step + 1) / TOTAL_STEPS) * 100}%`,
              },
            ]}
          />
        </View>
        <StepIndicator current={step} colors={colors} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
        keyboardVerticalOffset={paddingTop + 120}
      >
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={[styles.scroll, { paddingBottom: paddingBottom + 120 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ─── STEP 1: BASICS ─── */}
          {step === 0 && (
            <View style={styles.stepContent}>
              <View style={[styles.stepHero, { backgroundColor: colors.primaryDim, borderRadius: colors.radius + 4 }]}>
                <Feather name="edit-3" size={24} color={colors.primary} />
                <Text style={[styles.stepHeroTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
                  Tell us about the role
                </Text>
                <Text style={[styles.stepHeroSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                  Start with the job title and who's hiring.
                </Text>
              </View>

              <Field label="Job Title *" hint="e.g. Luxury Brand Editorial — Summer Campaign">
                <Input
                  value={title}
                  onChangeText={setTitle}
                  placeholder="What is this casting for?"
                  colors={colors}
                />
              </Field>

              <Field label="Client / Company Name *">
                <Input value={client} onChangeText={setClient} placeholder="Your brand or company name" colors={colors} />
              </Field>

              <Field label="Client Type">
                <View style={styles.pillRow}>
                  {CLIENT_TYPES.map((ct) => (
                    <Pill
                      key={ct}
                      label={ct}
                      active={clientType === ct}
                      onPress={() => { Haptics.selectionAsync(); setClientType(ct); }}
                      activeColor={colors.primary}
                      colors={colors}
                    />
                  ))}
                </View>
              </Field>

              <Field label="Job Category">
                <View style={styles.pillGrid}>
                  {jobTypeOpts.map((t) => (
                    <Pill
                      key={t.id}
                      label={t.label}
                      active={jobType === t.id}
                      onPress={() => { Haptics.selectionAsync(); setJobType(t.id as JobType); }}
                      activeColor={colors.purple}
                      colors={colors}
                    />
                  ))}
                </View>
              </Field>

              <TouchableOpacity
                onPress={() => { Haptics.selectionAsync(); setUrgent((v) => !v); }}
                style={[
                  styles.urgentToggle,
                  {
                    backgroundColor: urgent ? colors.primaryDim : colors.card,
                    borderColor: urgent ? colors.primary + "50" : colors.border,
                    borderRadius: colors.radius,
                  },
                ]}
                activeOpacity={0.8}
              >
                <View style={styles.urgentToggleLeft}>
                  <Feather name="zap" size={16} color={urgent ? colors.primary : colors.mutedForeground} />
                  <View>
                    <Text style={[styles.urgentToggleTitle, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
                      Mark as Urgent
                    </Text>
                    <Text style={[styles.urgentToggleSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                      Highlighted in the job board
                    </Text>
                  </View>
                </View>
                <View
                  style={[
                    styles.toggle,
                    { backgroundColor: urgent ? colors.primary : colors.muted, borderRadius: 12 },
                  ]}
                >
                  <View
                    style={[
                      styles.toggleThumb,
                      { backgroundColor: "#fff", transform: [{ translateX: urgent ? 14 : 0 }] },
                    ]}
                  />
                </View>
              </TouchableOpacity>
            </View>
          )}

          {/* ─── STEP 2: LOCATION & DATES ─── */}
          {step === 1 && (
            <View style={styles.stepContent}>
              <View style={[styles.stepHero, { backgroundColor: colors.accentDim, borderRadius: colors.radius + 4 }]}>
                <Feather name="map-pin" size={24} color={colors.accent} />
                <Text style={[styles.stepHeroTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
                  Where & when?
                </Text>
                <Text style={[styles.stepHeroSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                  Set your shoot location and important dates.
                </Text>
              </View>

              <Field label="Province *">
                <View style={styles.pillGrid}>
                  {provinceOpts.map((p) => (
                    <Pill
                      key={p.id}
                      label={p.id}
                      active={province === p.id}
                      onPress={() => { Haptics.selectionAsync(); setProvince(p.id); }}
                      activeColor={colors.purple}
                      colors={colors}
                    />
                  ))}
                </View>
              </Field>

              <Field label="City *" hint="e.g. Cape Town, Sandton, Durban North">
                <Input value={city} onChangeText={setCity} placeholder="Which city?" colors={colors} />
              </Field>

              <Field label="Shoot Date(s) *" hint="e.g. July 12–13  or  August 5">
                <Input
                  value={shootDate}
                  onChangeText={setShootDate}
                  placeholder="When is the shoot?"
                  colors={colors}
                />
              </Field>

              <Field label="Application Deadline *" hint="e.g. July 5  or  30 June">
                <Input
                  value={deadline}
                  onChangeText={setDeadline}
                  placeholder="Last date to apply"
                  colors={colors}
                />
              </Field>
            </View>
          )}

          {/* ─── STEP 3: ROLES & RATE ─── */}
          {step === 2 && (
            <View style={styles.stepContent}>
              <View style={[styles.stepHero, { backgroundColor: colors.greenDim, borderRadius: colors.radius + 4 }]}>
                <Feather name="users" size={24} color={colors.green} />
                <Text style={[styles.stepHeroTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
                  Who do you need?
                </Text>
                <Text style={[styles.stepHeroSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                  Select the roles you're casting for.
                </Text>
              </View>

              <Field label="Roles Needed * (select all that apply)">
                <View style={styles.pillGrid}>
                  {ROLES.map((r) => (
                    <Pill
                      key={r}
                      label={r}
                      active={roles.includes(r)}
                      onPress={() => toggleRole(r)}
                      activeColor={colors.primary}
                      colors={colors}
                    />
                  ))}
                </View>
              </Field>

              <Field label="Number of Spots Available">
                <View style={styles.pillRow}>
                  {SPOTS_OPTIONS.map((n) => (
                    <Pill
                      key={n}
                      label={String(n)}
                      active={spots === n}
                      onPress={() => { Haptics.selectionAsync(); setSpots(n); }}
                      activeColor={colors.accent}
                      colors={colors}
                    />
                  ))}
                </View>
              </Field>

              <Field label="Day Rate (ZAR) *" hint="Enter the total fee per person per day">
                <View
                  style={[
                    styles.rateInputWrap,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                      borderRadius: colors.radius,
                    },
                  ]}
                >
                  <Text style={[styles.ratePrefix, { color: colors.mutedForeground, fontFamily: "Inter_600SemiBold" }]}>
                    R
                  </Text>
                  <TextInput
                    value={rateText}
                    onChangeText={(t) => setRateText(t.replace(/\D/g, ""))}
                    placeholder="0"
                    placeholderTextColor={colors.dim}
                    keyboardType="numeric"
                    style={[styles.rateInput, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}
                  />
                  {rateText ? (
                    <Text style={[styles.rateLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                      per day / per person
                    </Text>
                  ) : null}
                </View>
              </Field>
            </View>
          )}

          {/* ─── STEP 4: BRIEF & DETAILS ─── */}
          {step === 3 && (
            <View style={styles.stepContent}>
              <View style={[styles.stepHero, { backgroundColor: colors.purpleDim, borderRadius: colors.radius + 4 }]}>
                <Feather name="file-text" size={24} color={colors.purple} />
                <Text style={[styles.stepHeroTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
                  Paint the picture
                </Text>
                <Text style={[styles.stepHeroSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                  A great brief attracts the right talent.
                </Text>
              </View>

              <Field label="Project Brief *" hint="Describe the project, vibe, deliverables, and what you're looking for. Be specific!">
                <View
                  style={[
                    styles.textAreaWrap,
                    {
                      backgroundColor: colors.card,
                      borderColor: brief.length > 20 ? colors.green + "60" : colors.border,
                      borderRadius: colors.radius,
                    },
                  ]}
                >
                  <TextInput
                    value={brief}
                    onChangeText={setBrief}
                    placeholder="e.g. We're shooting our autumn campaign for print and digital. Looking for a skilled MUA for glass-skin editorial finishes..."
                    placeholderTextColor={colors.dim}
                    multiline
                    numberOfLines={5}
                    style={[styles.textArea, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}
                    textAlignVertical="top"
                  />
                  <Text style={[styles.charCount, { color: brief.length > 20 ? colors.green : colors.dim, fontFamily: "Inter_400Regular" }]}>
                    {brief.length} chars {brief.length < 20 ? `(min ${20 - brief.length} more)` : "✓"}
                  </Text>
                </View>
              </Field>

              <Field label="Requirements" hint="Add one requirement at a time and tap Add">
                <View style={styles.addRow}>
                  <View
                    style={[
                      styles.addInputWrap,
                      {
                        flex: 1,
                        backgroundColor: colors.card,
                        borderColor: colors.border,
                        borderRadius: colors.radius,
                      },
                    ]}
                  >
                    <TextInput
                      value={reqInput}
                      onChangeText={setReqInput}
                      placeholder="e.g. Own professional kit required"
                      placeholderTextColor={colors.dim}
                      style={[styles.addInput, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}
                      onSubmitEditing={addRequirement}
                      returnKeyType="done"
                    />
                  </View>
                  <TouchableOpacity
                    onPress={addRequirement}
                    style={[styles.addBtn, { backgroundColor: colors.primary, borderRadius: colors.radius }]}
                    activeOpacity={0.8}
                  >
                    <Feather name="plus" size={16} color="#fff" />
                  </TouchableOpacity>
                </View>
                {requirements.map((req, i) => (
                  <View
                    key={i}
                    style={[
                      styles.listItem,
                      { backgroundColor: colors.card, borderColor: colors.border, borderRadius: 10 },
                    ]}
                  >
                    <View style={[styles.reqDot, { backgroundColor: colors.primary }]} />
                    <Text style={[styles.listItemText, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}>
                      {req}
                    </Text>
                    <TouchableOpacity
                      onPress={() => setRequirements((prev) => prev.filter((_, j) => j !== i))}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Feather name="x" size={13} color={colors.dim} />
                    </TouchableOpacity>
                  </View>
                ))}
              </Field>

              <Field label="Tags" hint="Optional — helps talent discover your casting">
                <View style={styles.addRow}>
                  <View
                    style={[
                      styles.addInputWrap,
                      {
                        flex: 1,
                        backgroundColor: colors.card,
                        borderColor: colors.border,
                        borderRadius: colors.radius,
                      },
                    ]}
                  >
                    <TextInput
                      value={tagInput}
                      onChangeText={setTagInput}
                      placeholder="e.g. Afrobeats, Natural Hair, Luxury"
                      placeholderTextColor={colors.dim}
                      style={[styles.addInput, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}
                      onSubmitEditing={addTag}
                      returnKeyType="done"
                    />
                  </View>
                  <TouchableOpacity
                    onPress={addTag}
                    style={[styles.addBtn, { backgroundColor: colors.accent, borderRadius: colors.radius }]}
                    activeOpacity={0.8}
                  >
                    <Feather name="hash" size={16} color="#fff" />
                  </TouchableOpacity>
                </View>
                {tags.length > 0 && (
                  <View style={styles.tagsWrap}>
                    {tags.map((tag) => (
                      <TouchableOpacity
                        key={tag}
                        onPress={() => setTags((prev) => prev.filter((t) => t !== tag))}
                        style={[
                          styles.tagChip,
                          { backgroundColor: colors.accentDim, borderRadius: 8, borderColor: colors.accent + "40", borderWidth: 1 },
                        ]}
                        activeOpacity={0.75}
                      >
                        <Text style={[styles.tagText, { color: colors.accent, fontFamily: "Inter_500Medium" }]}>
                          #{tag}
                        </Text>
                        <Feather name="x" size={10} color={colors.accent} />
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </Field>

              {/* Review summary */}
              <View
                style={[
                  styles.reviewCard,
                  {
                    backgroundColor: colors.warm,
                    borderRadius: colors.radius + 4,
                    borderColor: colors.border,
                    borderWidth: 1,
                  },
                ]}
              >
                <Text style={[styles.reviewTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
                  Review Summary
                </Text>
                {[
                  { icon: "edit-3" as const, label: title, sub: `${jobType} · ${clientType}` },
                  { icon: "map-pin" as const, label: `${city}, ${province}`, sub: `Shoot: ${shootDate} · Deadline: ${deadline}` },
                  {
                    icon: "users" as const,
                    label: roles.join(", ") || "No roles selected",
                    sub: `${spots} spot${spots !== 1 ? "s" : ""} · R${parseInt(rateText || "0").toLocaleString("en-ZA")} per day`,
                  },
                ].map((row, i) => (
                  <View key={i} style={styles.reviewRow}>
                    <Feather name={row.icon} size={13} color={colors.primary} />
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.reviewLabel, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>
                        {row.label}
                      </Text>
                      <Text style={[styles.reviewSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                        {row.sub}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Bottom navigation */}
      <View
        style={[
          styles.bottomBar,
          {
            paddingBottom: paddingBottom + 8,
            paddingHorizontal: 16,
            paddingTop: 14,
            borderTopColor: colors.border,
            backgroundColor: colors.background,
          },
        ]}
      >
        {step > 0 && (
          <TouchableOpacity
            onPress={handleBack}
            style={[
              styles.backBtn,
              {
                borderColor: colors.border,
                borderRadius: colors.radius,
                backgroundColor: colors.card,
              },
            ]}
            activeOpacity={0.75}
          >
            <Feather name="arrow-left" size={16} color={colors.foreground} />
            <Text style={[styles.backBtnText, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
              Back
            </Text>
          </TouchableOpacity>
        )}

        {step < TOTAL_STEPS - 1 ? (
          <TouchableOpacity
            onPress={handleNext}
            style={[
              styles.nextBtn,
              {
                backgroundColor: canAdvance ? colors.primary : colors.muted,
                borderRadius: colors.radius,
                flex: 1,
                opacity: canAdvance ? 1 : 0.6,
              },
            ]}
            disabled={!canAdvance}
            activeOpacity={0.82}
          >
            <Text style={[styles.nextBtnText, { color: canAdvance ? "#fff" : colors.dim, fontFamily: "Inter_700Bold" }]}>
              Continue
            </Text>
            <Feather name="arrow-right" size={16} color={canAdvance ? "#fff" : colors.dim} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={handleSubmit}
            style={[
              styles.nextBtn,
              {
                backgroundColor: canAdvance && !submitting ? colors.green : colors.muted,
                borderRadius: colors.radius,
                flex: 1,
                opacity: canAdvance && !submitting ? 1 : 0.6,
              },
            ]}
            disabled={!canAdvance || submitting}
            activeOpacity={0.82}
          >
            <Feather name="send" size={16} color={canAdvance ? "#fff" : colors.dim} />
            <Text style={[styles.nextBtnText, { color: canAdvance ? "#fff" : colors.dim, fontFamily: "Inter_700Bold" }]}>
              {submitting ? "Posting..." : "Post Casting"}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

// ─── Reusable sub-components ─────────────────────────────────────────────────

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  const colors = useColors();
  return (
    <View style={fieldStyles.wrap}>
      <Text style={[fieldStyles.label, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
        {label}
      </Text>
      {hint && (
        <Text style={[fieldStyles.hint, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
          {hint}
        </Text>
      )}
      {children}
    </View>
  );
}

const fieldStyles = StyleSheet.create({
  wrap: { gap: 6 },
  label: { fontSize: 14 },
  hint: { fontSize: 11, lineHeight: 16, marginTop: -3 },
});

function Input({
  value,
  onChangeText,
  placeholder,
  colors,
}: {
  value: string;
  onChangeText: (t: string) => void;
  placeholder: string;
  colors: ReturnType<typeof import("@/hooks/useColors").useColors>;
}) {
  return (
    <View
      style={[
        inputStyles.wrap,
        {
          backgroundColor: colors.card,
          borderColor: value.trim() ? colors.primary + "40" : colors.border,
          borderRadius: colors.radius,
        },
      ]}
    >
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.dim}
        style={[inputStyles.input, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}
      />
    </View>
  );
}

const inputStyles = StyleSheet.create({
  wrap: { borderWidth: 1.5, paddingHorizontal: 14, paddingVertical: 13 },
  input: { fontSize: 15 },
});

function Pill({
  label,
  active,
  onPress,
  activeColor,
  colors,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  activeColor: string;
  colors: ReturnType<typeof import("@/hooks/useColors").useColors>;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        pillStyles.pill,
        {
          backgroundColor: active ? activeColor : colors.muted,
          borderColor: active ? activeColor : colors.border,
          borderRadius: 20,
          borderWidth: 1.5,
        },
      ]}
      activeOpacity={0.8}
    >
      {active && <Feather name="check" size={11} color="#fff" />}
      <Text
        style={[
          pillStyles.text,
          {
            color: active ? "#fff" : colors.mutedForeground,
            fontFamily: active ? "Inter_600SemiBold" : "Inter_400Regular",
          },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const pillStyles = StyleSheet.create({
  pill: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 14, paddingVertical: 8 },
  text: { fontSize: 13 },
});

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  headerBtn: { padding: 4 },
  headerCenter: { alignItems: "center", gap: 2 },
  headerTitle: { fontSize: 16, letterSpacing: -0.3 },
  headerSub: { fontSize: 11 },
  progressWrap: { paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, gap: 12 },
  progressTrack: { height: 3, overflow: "hidden" as const },
  progressFill: { height: 3 },
  scroll: { padding: 20, gap: 0 },
  stepContent: { gap: 20 },
  stepHero: {
    padding: 20,
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  stepHeroTitle: { fontSize: 18, letterSpacing: -0.4, textAlign: "center" },
  stepHeroSub: { fontSize: 13, textAlign: "center", lineHeight: 18 },
  pillRow: { flexDirection: "row", flexWrap: "wrap" as const, gap: 8 },
  pillGrid: { flexDirection: "row", flexWrap: "wrap" as const, gap: 8 },
  urgentToggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderWidth: 1.5,
  },
  urgentToggleLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  urgentToggleTitle: { fontSize: 14 },
  urgentToggleSub: { fontSize: 11 },
  toggle: { width: 42, height: 26, padding: 3 },
  toggleThumb: { width: 20, height: 20, borderRadius: 10 },
  rateInputWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1.5,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  ratePrefix: { fontSize: 22 },
  rateInput: { fontSize: 28, letterSpacing: -1, minWidth: 80 },
  rateLabel: { fontSize: 12 },
  textAreaWrap: { borderWidth: 1.5, padding: 14, gap: 8 },
  textArea: { fontSize: 14, lineHeight: 22, minHeight: 110 },
  charCount: { fontSize: 10, textAlign: "right" as const },
  addRow: { flexDirection: "row", gap: 8 },
  addInputWrap: { borderWidth: 1.5, paddingHorizontal: 12, paddingVertical: 12 },
  addInput: { fontSize: 14, flex: 1 },
  addBtn: {
    width: 46,
    alignItems: "center",
    justifyContent: "center",
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
    borderWidth: 1,
    marginTop: 6,
  },
  reqDot: { width: 6, height: 6, borderRadius: 3, flexShrink: 0 },
  listItemText: { flex: 1, fontSize: 13, lineHeight: 18 },
  tagsWrap: { flexDirection: "row", flexWrap: "wrap" as const, gap: 8, marginTop: 6 },
  tagChip: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 6 },
  tagText: { fontSize: 12 },
  reviewCard: { padding: 16, gap: 12 },
  reviewTitle: { fontSize: 14, marginBottom: 4 },
  reviewRow: { flexDirection: "row", gap: 10, alignItems: "flex-start" },
  reviewLabel: { fontSize: 13 },
  reviewSub: { fontSize: 11, marginTop: 1 },
  bottomBar: { flexDirection: "row", gap: 10, borderTopWidth: 1 },
  backBtn: {
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    borderWidth: 1,
  },
  backBtnText: { fontSize: 14 },
  nextBtn: {
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  nextBtnText: { fontSize: 16 },
});
