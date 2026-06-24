/**
 * CityPicker — reusable bottom-sheet style city selector for SA cities.
 *
 * Usage:
 *   <CityPicker
 *     value={city}
 *     onChange={(c) => setCity(c)}
 *     placeholder="Select your city"
 *   />
 */
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  StyleSheet,
} from "react-native";
import Colors from "@/constants/colors";

export const SA_CITIES = [
  "Cape Town",
  "Johannesburg",
  "Durban",
  "Pretoria",
  "Port Elizabeth",
  "Bloemfontein",
  "East London",
  "Nelspruit",
  "Polokwane",
  "Kimberley",
] as const;

export type SaCity = typeof SA_CITIES[number];

interface Props {
  value: string;
  onChange: (city: string) => void;
  placeholder?: string;
}

export function CityPicker({ value, onChange, placeholder = "Select city" }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <TouchableOpacity style={styles.trigger} onPress={() => setOpen(true)}>
        <Text style={value ? styles.triggerValue : styles.triggerPlaceholder}>
          {value || placeholder}
        </Text>
        <Text style={styles.chevron}>▾</Text>
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Choose your city</Text>
              <TouchableOpacity onPress={() => setOpen(false)}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView>
              {SA_CITIES.map((city) => (
                <TouchableOpacity
                  key={city}
                  style={[styles.option, value === city && styles.optionSelected]}
                  onPress={() => {
                    onChange(city);
                    setOpen(false);
                  }}
                >
                  <Text style={[styles.optionText, value === city && styles.optionTextSelected]}>
                    📍 {city}
                  </Text>
                  {value === city && <Text style={styles.checkmark}>✓</Text>}
                </TouchableOpacity>
              ))}
              <View style={{ height: 32 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  triggerValue: { fontSize: 15, color: Colors.foreground, fontFamily: "Inter_400Regular" },
  triggerPlaceholder: { fontSize: 15, color: Colors.mutedForeground, fontFamily: "Inter_400Regular" },
  chevron: { fontSize: 14, color: Colors.mutedForeground },

  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  sheet: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 24,
    maxHeight: "70%",
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  sheetTitle: { fontSize: 18, fontFamily: "Fraunces_700Bold", color: Colors.foreground },
  closeBtn: { fontSize: 18, color: Colors.mutedForeground, fontFamily: "Inter_400Regular" },

  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  optionSelected: { backgroundColor: Colors.accentDim },
  optionText: { fontSize: 15, color: Colors.foreground, fontFamily: "Inter_400Regular" },
  optionTextSelected: { color: Colors.accent, fontFamily: "Inter_600SemiBold" },
  checkmark: { fontSize: 15, color: Colors.accent, fontFamily: "Inter_700Bold" },
});
