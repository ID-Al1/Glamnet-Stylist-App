import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useColors } from "@/hooks/useColors";

interface DateTimeInputProps {
  value: Date | null;
  onChange: (date: Date) => void;
  error?: string;
}

const isIOS = Platform.OS === "ios";
const isAndroid = Platform.OS === "android";
const isWeb = Platform.OS === "web";

export function DateTimeInput({ value, onChange, error }: DateTimeInputProps) {
  const colors = useColors();

  // Working copy while the modal/pickers are open
  const [tempDate, setTempDate] = useState<Date>(() => value ?? roundToNextHour());
  const [showModal, setShowModal] = useState(false);

  // Android sequential flow
  const [androidStage, setAndroidStage] = useState<"date" | "time" | "idle">("idle");

  function roundToNextHour() {
    const d = new Date();
    d.setMinutes(0, 0, 0);
    d.setHours(d.getHours() + 1);
    return d;
  }

  function open() {
    Haptics.selectionAsync();
    const base = value ?? roundToNextHour();
    setTempDate(base);
    if (isAndroid) {
      setAndroidStage("date");
    } else {
      setShowModal(true);
    }
  }

  function confirm() {
    onChange(tempDate);
    setShowModal(false);
  }

  const dateLabel = value
    ? value.toLocaleDateString("en-ZA", { weekday: "short", day: "numeric", month: "long", year: "numeric" })
    : null;
  const timeLabel = value
    ? value.toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit", hour12: false })
    : null;

  return (
    <>
      {/* Trigger button */}
      <TouchableOpacity
        onPress={open}
        activeOpacity={0.8}
        style={[
          styles.trigger,
          {
            borderColor: error ? colors.destructive : colors.border,
            backgroundColor: colors.card,
            borderRadius: colors.radius,
          },
        ]}
      >
        <Feather name="calendar" size={16} color={value ? colors.primary : colors.mutedForeground} />
        <View style={styles.triggerText}>
          {value ? (
            <>
              <Text style={[styles.dateText, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
                {dateLabel}
              </Text>
              <View style={styles.timeRow}>
                <Feather name="clock" size={11} color={colors.primary} />
                <Text style={[styles.timeText, { color: colors.primary, fontFamily: "Inter_500Medium" }]}>
                  {timeLabel}
                </Text>
              </View>
            </>
          ) : (
            <Text style={[styles.placeholder, { color: colors.dim, fontFamily: "Inter_400Regular" }]}>
              Select date & time
            </Text>
          )}
        </View>
        <Feather
          name={value ? "check-circle" : "chevron-right"}
          size={15}
          color={value ? colors.green : colors.dim}
        />
      </TouchableOpacity>

      {/* iOS + Web: bottom-sheet modal with inline calendar + time spinner */}
      {(isIOS || isWeb) && (
        <Modal visible={showModal} transparent animationType="slide">
          <View style={styles.overlay}>
            <View style={[styles.sheet, { backgroundColor: colors.card }]}>
              {/* Header */}
              <View style={[styles.sheetHeader, { borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => setShowModal(false)} hitSlop={8}>
                  <Text style={[styles.sheetAction, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                    Cancel
                  </Text>
                </TouchableOpacity>
                <Text style={[styles.sheetTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
                  Date & Time
                </Text>
                <TouchableOpacity onPress={confirm} hitSlop={8}>
                  <Text style={[styles.sheetAction, { color: colors.primary, fontFamily: "Inter_700Bold" }]}>
                    Done
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Date — inline calendar on iOS 14+, spinner on web */}
              <DateTimePicker
                value={tempDate}
                mode="date"
                display={isIOS ? "inline" : "spinner"}
                minimumDate={new Date()}
                onChange={(_, d) => {
                  if (!d) return;
                  setTempDate((prev) => {
                    const next = new Date(d);
                    next.setHours(prev.getHours(), prev.getMinutes(), 0, 0);
                    return next;
                  });
                }}
                style={styles.calendarPicker}
                themeVariant="light"
              />

              {/* Divider */}
              <View style={[styles.divider, { backgroundColor: colors.border }]} />

              {/* Time row */}
              <View style={[styles.timePickerRow, { backgroundColor: colors.background }]}>
                <View style={styles.timePickerLabel}>
                  <Feather name="clock" size={16} color={colors.mutedForeground} />
                  <Text style={[styles.timePickerLabelText, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
                    Time
                  </Text>
                </View>
                <DateTimePicker
                  value={tempDate}
                  mode="time"
                  display={isIOS ? "compact" : "spinner"}
                  onChange={(_, d) => {
                    if (!d) return;
                    setTempDate((prev) => {
                      const next = new Date(prev);
                      next.setHours(d.getHours(), d.getMinutes(), 0, 0);
                      return next;
                    });
                  }}
                />
              </View>

              {/* Preview pill */}
              <View style={[styles.preview, { backgroundColor: colors.primaryDim, borderRadius: colors.radius }]}>
                <Feather name="calendar" size={13} color={colors.primary} />
                <Text style={[styles.previewText, { color: colors.primary, fontFamily: "Inter_600SemiBold" }]}>
                  {tempDate.toLocaleDateString("en-ZA", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}
                  {" · "}
                  {tempDate.toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit", hour12: false })}
                </Text>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* Android: sequential native dialogs */}
      {isAndroid && androidStage === "date" && (
        <DateTimePicker
          value={tempDate}
          mode="date"
          display="calendar"
          minimumDate={new Date()}
          onChange={(_, d) => {
            if (d) {
              const next = new Date(d);
              next.setHours(tempDate.getHours(), tempDate.getMinutes(), 0, 0);
              setTempDate(next);
              setAndroidStage("time");
            } else {
              setAndroidStage("idle");
            }
          }}
        />
      )}
      {isAndroid && androidStage === "time" && (
        <DateTimePicker
          value={tempDate}
          mode="time"
          display="clock"
          onChange={(_, d) => {
            setAndroidStage("idle");
            if (d) {
              const next = new Date(tempDate);
              next.setHours(d.getHours(), d.getMinutes(), 0, 0);
              setTempDate(next);
              onChange(next);
            }
          }}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1.5,
  },
  triggerText: { flex: 1, gap: 2 },
  dateText: { fontSize: 14 },
  timeRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  timeText: { fontSize: 12 },
  placeholder: { fontSize: 15 },
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  sheet: {
    paddingBottom: 32,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: "hidden",
  },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  sheetTitle: { fontSize: 16 },
  sheetAction: { fontSize: 15 },
  calendarPicker: { alignSelf: "center" },
  divider: { height: 1, marginHorizontal: 0 },
  timePickerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  timePickerLabel: { flexDirection: "row", alignItems: "center", gap: 8 },
  timePickerLabelText: { fontSize: 15 },
  preview: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginHorizontal: 20,
    marginTop: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  previewText: { fontSize: 13 },
});
