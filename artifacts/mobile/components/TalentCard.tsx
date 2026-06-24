import { Feather } from "@expo/vector-icons";
import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { TIER_COLORS, type Talent } from "@/constants/data";
import { useColors } from "@/hooks/useColors";

interface TalentCardProps {
  talent: Talent;
  onPress: () => void;
  compact?: boolean;
}

export function TalentCard({ talent, onPress, compact = false }: TalentCardProps) {
  const colors = useColors();
  const isModel = talent.type === "model";
  const accentColor = isModel ? colors.purple : colors.primary;
  const tierColor = TIER_COLORS[talent.tier] ?? colors.muted;
  const gold = colors.gold;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderRadius: colors.radius,
        },
      ]}
    >
      <View style={styles.row}>
        {/* Avatar */}
        <View
          style={[
            styles.avatar,
            {
              backgroundColor: accentColor + "22",
              borderRadius: isModel ? 10 : 14,
              width: compact ? 44 : 52,
              height: compact ? 44 : 52,
            },
          ]}
        >
          <Text style={[styles.avatarText, { color: accentColor, fontSize: compact ? 16 : 20 }]}>
            {isModel ? "✦" : talent.name[0]}
          </Text>
          {talent.verified && (
            <View
              style={[
                styles.verifiedBadge,
                { backgroundColor: colors.primary, borderColor: colors.card },
              ]}
            />
          )}
        </View>

        {/* Info */}
        <View style={styles.info}>
          <View style={styles.nameRow}>
            <View style={styles.namePart}>
              <Text
                style={[
                  styles.name,
                  {
                    color: colors.foreground,
                    fontFamily: "Inter_600SemiBold",
                    fontSize: compact ? 14 : 15,
                  },
                ]}
                numberOfLines={1}
              >
                {talent.name}
              </Text>
              <Text
                style={[
                  styles.role,
                  { color: accentColor, fontFamily: "Inter_500Medium", fontSize: compact ? 10 : 11 },
                ]}
                numberOfLines={1}
              >
                {talent.role}
              </Text>
            </View>
            <Text
              style={[
                styles.rate,
                { color: colors.accent, fontFamily: "Inter_700Bold", fontSize: compact ? 11 : 12 },
              ]}
            >
              {talent.rate}
            </Text>
          </View>

          {/* Handle + location */}
          <Text
            style={[
              styles.handle,
              { color: colors.mutedForeground, fontFamily: "Inter_400Regular", fontSize: 11 },
            ]}
            numberOfLines={1}
          >
            {talent.handle} · {talent.location}
          </Text>

          {/* Badges row */}
          {!compact && (
            <View style={styles.badgeRow}>
              {talent.foundingMember && (
                <View style={[styles.badge, { backgroundColor: gold + "18", borderColor: gold + "40" }]}>
                  <Feather name="award" size={9} color={gold} />
                  <Text style={[styles.badgeText, { color: gold, fontFamily: "Inter_700Bold" }]}>
                    Founding
                  </Text>
                </View>
              )}
              <View
                style={[
                  styles.badge,
                  { backgroundColor: tierColor + "18", borderColor: tierColor + "40" },
                ]}
              >
                <Text style={[styles.badgeText, { color: tierColor, fontFamily: "Inter_600SemiBold" }]}>
                  {talent.tier}
                </Text>
              </View>

              <View
                style={[
                  styles.badge,
                  {
                    backgroundColor: talent.available ? colors.greenDim : colors.muted,
                    borderColor: talent.available ? colors.green + "40" : colors.border,
                  },
                ]}
              >
                <View
                  style={[
                    styles.dot,
                    { backgroundColor: talent.available ? colors.green : colors.dim },
                  ]}
                />
                <Text
                  style={[
                    styles.badgeText,
                    {
                      color: talent.available ? colors.green : colors.mutedForeground,
                      fontFamily: "Inter_500Medium",
                    },
                  ]}
                >
                  {talent.available ? "Available" : "Booked"}
                </Text>
              </View>

              <View style={[styles.badge, { backgroundColor: colors.muted, borderColor: colors.border }]}>
                <Feather name="star" size={9} color={colors.accent} />
                <Text
                  style={[
                    styles.badgeText,
                    { color: colors.foreground, fontFamily: "Inter_600SemiBold" },
                  ]}
                >
                  {talent.repScore}
                </Text>
              </View>
            </View>
          )}

          {/* Model stats pills */}
          {isModel && talent.modelStats && !compact && (
            <View style={styles.statPills}>
              <View
                style={[
                  styles.statPill,
                  { backgroundColor: colors.purpleDim, borderColor: colors.purple + "30" },
                ]}
              >
                <Text style={[styles.statPillText, { color: colors.purple, fontFamily: "Inter_500Medium" }]}>
                  {talent.modelStats.height}
                </Text>
              </View>
              {talent.modelStats.aesthetic.slice(0, 2).map((a) => (
                <View
                  key={a}
                  style={[
                    styles.statPill,
                    { backgroundColor: colors.muted, borderColor: colors.border },
                  ]}
                >
                  <Text
                    style={[
                      styles.statPillText,
                      { color: colors.mutedForeground, fontFamily: "Inter_400Regular" },
                    ]}
                  >
                    {a}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
  },
  avatar: {
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  avatarText: {
    fontWeight: "700" as const,
  },
  verifiedBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1.5,
  },
  info: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },
  nameRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 8,
  },
  namePart: {
    flex: 1,
    gap: 1,
  },
  name: {
    letterSpacing: -0.3,
  },
  role: {
    letterSpacing: 0.2,
    textTransform: "uppercase" as const,
  },
  rate: {
    letterSpacing: -0.2,
  },
  handle: {
    marginTop: 1,
  },
  badgeRow: {
    flexDirection: "row",
    gap: 6,
    marginTop: 6,
    flexWrap: "wrap" as const,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 10,
    letterSpacing: 0.2,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  statPills: {
    flexDirection: "row",
    gap: 5,
    marginTop: 4,
    flexWrap: "wrap" as const,
  },
  statPill: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 5,
    borderWidth: 1,
  },
  statPillText: {
    fontSize: 10,
  },
});
