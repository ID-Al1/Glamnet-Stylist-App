import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Colors from "@/constants/colors";

type BadgeSize = "sm" | "md";

interface Props {
  /**
   * Which verification types this talent has earned.
   * Pass the list you fetched from GET /api/trust/verifications/mine
   * filtered to status === "approved".
   */
  types: Array<"identity" | "portfolio" | "skill" | "agency">;
  size?: BadgeSize;
}

const ICONS: Record<string, string> = {
  identity: "🪪",
  portfolio: "🖼",
  skill: "✂️",
  agency: "🏢",
};

/**
 * Renders a compact row of verified-type badges.
 * Show up to 3; if more, collapse with "+N".
 *
 * Usage:
 *   <VerifiedBadge types={["identity", "portfolio"]} />
 */
export function VerifiedBadge({ types, size = "sm" }: Props) {
  if (!types || types.length === 0) return null;

  const MAX_SHOW = 3;
  const visible = types.slice(0, MAX_SHOW);
  const overflow = types.length - MAX_SHOW;

  return (
    <View style={styles.row}>
      <Text style={[styles.tick, size === "md" && styles.tickMd]}>✓</Text>
      {visible.map((t) => (
        <View key={t} style={[styles.chip, size === "md" && styles.chipMd]}>
          <Text style={styles.chipIcon}>{ICONS[t]}</Text>
          <Text style={[styles.chipLabel, size === "md" && styles.chipLabelMd]}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </Text>
        </View>
      ))}
      {overflow > 0 && (
        <View style={[styles.chip, size === "md" && styles.chipMd]}>
          <Text style={[styles.chipLabel, size === "md" && styles.chipLabelMd]}>+{overflow}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 4 },

  tick: { fontSize: 11, color: Colors.green, fontFamily: "Inter_700Bold", marginRight: 2 },
  tickMd: { fontSize: 14 },

  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: Colors.greenDim ?? Colors.card,
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  chipMd: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },

  chipIcon: { fontSize: 10 },
  chipLabel: { fontSize: 10, color: Colors.green, fontFamily: "Inter_600SemiBold" },
  chipLabelMd: { fontSize: 13 },
});
