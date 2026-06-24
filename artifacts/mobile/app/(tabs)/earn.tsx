import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ProfileDrawer } from "@/components/ProfileDrawer";
import { JOB_TYPES, type Job } from "@/constants/jobs";
import { SA_PROVINCES } from "@/constants/data";
import { useAuth } from "@/context/AuthContext";
import { useApplications } from "@/context/ApplicationsContext";
import { useBookings, type Booking } from "@/context/BookingContext";
import { useJobs } from "@/context/JobsContext";
import { useColors } from "@/hooks/useColors";
import { apiFetch } from "@/lib/api";

const TYPE_COLORS: Record<string, string> = {
  Editorial: "#7A5AB8",
  Commercial: "#4A7AB8",
  "TV/Film": "#C4526E",
  Events: "#3A9E6A",
  Bridal: "#B8893A",
  "Social Media": "#C4526E",
};

// ── Booking request card (stylist sees incoming client requests) ──────────────

function BookingRequestCard({ booking, onAccept, onDecline, isActing }: {
  booking: Booking;
  onAccept: () => void;
  onDecline: () => void;
  isActing: boolean;
}) {
  const colors = useColors();
  const isPending = booking.status === "pending";
  const isAccepted = booking.status === "accepted";
  const isDeclined = booking.status === "declined";

  const statusColor = isPending
    ? colors.accent
    : isAccepted
    ? colors.green
    : colors.dim;

  const statusLabel = isPending ? "New Request" : isAccepted ? "Accepted" : "Declined";

  return (
    <View
      style={[
        styles.bookingCard,
        {
          backgroundColor: colors.card,
          borderColor: isPending ? colors.accent + "50" : colors.border,
          borderRadius: colors.radius,
          borderWidth: isPending ? 1.5 : 1,
        },
      ]}
    >
      {/* Header */}
      <View style={styles.bookingCardHeader}>
        <View style={styles.bookingClientRow}>
          <View style={[styles.bookingAvatar, { backgroundColor: colors.primaryDim, borderRadius: 20 }]}>
            <Text style={[styles.bookingAvatarText, { color: colors.primary, fontFamily: "Inter_700Bold" }]}>
              {(booking.clientName ?? "?")[0].toUpperCase()}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.bookingClientName, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
              {booking.clientName ?? "Client"}
            </Text>
            <Text style={[styles.bookingClientHandle, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              {booking.clientHandle ?? ""}
            </Text>
          </View>
          <View style={[styles.bookingStatusChip, { backgroundColor: statusColor + "20", borderRadius: 6 }]}>
            <Text style={[styles.bookingStatusText, { color: statusColor, fontFamily: "Inter_600SemiBold" }]}>
              {statusLabel}
            </Text>
          </View>
        </View>
      </View>

      {/* Details */}
      <View style={[styles.bookingDetails, { borderTopColor: colors.borderLight, borderBottomColor: colors.borderLight }]}>
        {[
          { icon: "scissors" as const, value: booking.jobType },
          { icon: "calendar" as const, value: booking.date },
          { icon: "map-pin" as const, value: booking.location + (booking.isHouseCall ? " (House Call)" : "") },
        ].map((d) => (
          <View key={d.icon} style={styles.bookingDetailRow}>
            <Feather name={d.icon} size={12} color={colors.mutedForeground} />
            <Text style={[styles.bookingDetailText, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}>
              {d.value}
            </Text>
          </View>
        ))}
        {booking.notes ? (
          <View style={styles.bookingDetailRow}>
            <Feather name="message-square" size={12} color={colors.mutedForeground} />
            <Text style={[styles.bookingDetailText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]} numberOfLines={2}>
              {booking.notes}
            </Text>
          </View>
        ) : null}
      </View>

      {/* Footer */}
      <View style={styles.bookingCardFooter}>
        <Text style={[styles.bookingTotal, { color: colors.accent, fontFamily: "Inter_700Bold" }]}>
          R{booking.totalCost.toLocaleString()}
        </Text>
        {isPending && (
          <View style={styles.bookingActions}>
            {isActing ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <>
                <TouchableOpacity
                  onPress={() => { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning); onDecline(); }}
                  style={[styles.declineBtn, { borderColor: colors.border, borderRadius: colors.radius }]}
                  activeOpacity={0.75}
                >
                  <Feather name="x" size={14} color={colors.mutedForeground} />
                  <Text style={[styles.declineBtnText, { color: colors.mutedForeground, fontFamily: "Inter_600SemiBold" }]}>
                    Decline
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); onAccept(); }}
                  style={[styles.acceptBtn, { backgroundColor: colors.green, borderRadius: colors.radius }]}
                  activeOpacity={0.82}
                >
                  <Feather name="check" size={14} color="#fff" />
                  <Text style={[styles.acceptBtnText, { color: "#fff", fontFamily: "Inter_700Bold" }]}>
                    Accept
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}
      </View>
    </View>
  );
}

// ── Castings job card ─────────────────────────────────────────────────────────

function JobCard({ job, applied }: { job: Job; applied: boolean }) {
  const colors = useColors();
  const typeColor = TYPE_COLORS[job.type] ?? colors.primary;
  const spotsLeft = job.spotsTotal - job.spotsFilled;

  return (
    <TouchableOpacity
      onPress={() => { Haptics.selectionAsync(); router.push(`/jobs/${job.id}`); }}
      activeOpacity={0.82}
      style={[
        styles.jobCard,
        {
          backgroundColor: colors.card,
          borderColor: job.featured
            ? colors.accent + "50"
            : job.urgent
            ? colors.primary + "50"
            : colors.border,
          borderRadius: colors.radius,
          borderWidth: job.featured || job.urgent ? 1.5 : 1,
        },
      ]}
    >
      <View style={styles.cardTopRow}>
        <View style={styles.cardBadges}>
          {job.featured && (
            <View style={[styles.badge, { backgroundColor: colors.accentDim, borderRadius: 6, borderColor: colors.accent + "40", borderWidth: 1 }]}>
              <Feather name="star" size={9} color={colors.accent} />
              <Text style={[styles.badgeText, { color: colors.accent, fontFamily: "Inter_700Bold" }]}>Featured</Text>
            </View>
          )}
          {job.urgent && (
            <View style={[styles.badge, { backgroundColor: colors.primaryDim, borderRadius: 6, borderColor: colors.primary + "40", borderWidth: 1 }]}>
              <Feather name="zap" size={9} color={colors.primary} />
              <Text style={[styles.badgeText, { color: colors.primary, fontFamily: "Inter_700Bold" }]}>Urgent</Text>
            </View>
          )}
          {applied && (
            <View style={[styles.badge, { backgroundColor: colors.greenDim, borderRadius: 6, borderColor: colors.green + "40", borderWidth: 1 }]}>
              <Feather name="check-circle" size={9} color={colors.green} />
              <Text style={[styles.badgeText, { color: colors.green, fontFamily: "Inter_600SemiBold" }]}>Applied</Text>
            </View>
          )}
        </View>
        <View style={[styles.typePill, { backgroundColor: typeColor + "18", borderRadius: 7, borderColor: typeColor + "30", borderWidth: 1 }]}>
          <Text style={[styles.typeText, { color: typeColor, fontFamily: "Inter_600SemiBold" }]}>{job.type}</Text>
        </View>
      </View>

      <Text style={[styles.jobTitle, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
        {job.title}
      </Text>
      <Text style={[styles.jobClient, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
        {job.client}
      </Text>

      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <Feather name="map-pin" size={11} color={colors.mutedForeground} />
          <Text style={[styles.metaText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>{job.city}</Text>
        </View>
        <View style={styles.metaItem}>
          <Feather name="calendar" size={11} color={colors.mutedForeground} />
          <Text style={[styles.metaText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>{job.date}</Text>
        </View>
        <View style={styles.metaItem}>
          <Feather name="users" size={11} color={spotsLeft <= 1 ? colors.primary : colors.green} />
          <Text style={[styles.metaText, { color: spotsLeft <= 1 ? colors.primary : colors.green, fontFamily: "Inter_500Medium" }]}>
            {spotsLeft} spot{spotsLeft !== 1 ? "s" : ""} left
          </Text>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <View style={styles.rolesRow}>
          {job.roles.slice(0, 3).map((r) => (
            <View key={r} style={[styles.roleTag, { backgroundColor: colors.muted, borderRadius: 5 }]}>
              <Text style={[styles.roleTagText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>{r}</Text>
            </View>
          ))}
          {job.roles.length > 3 && (
            <View style={[styles.roleTag, { backgroundColor: colors.muted, borderRadius: 5 }]}>
              <Text style={[styles.roleTagText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                +{job.roles.length - 3}
              </Text>
            </View>
          )}
        </View>
        <Text style={[styles.jobRate, { color: colors.accent, fontFamily: "Inter_700Bold" }]}>{job.rate}</Text>
      </View>

      <View style={[styles.deadlineRow, { borderTopColor: colors.borderLight }]}>
        <Feather name="clock" size={10} color={colors.dim} />
        <Text style={[styles.deadlineText, { color: colors.dim, fontFamily: "Inter_400Regular" }]}>
          Apply by {job.deadline}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────

export default function EarnScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, updateUser } = useAuth();
  const { hasApplied, totalApplied } = useApplications();
  const { bookings, isLoading: bookingsLoading, updateBookingStatus } = useBookings();
  const { jobs: allJobs, isLoading: jobsLoading } = useJobs();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"bookings" | "castings" | "referrals" | "payments">("bookings");
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedProvince, setSelectedProvince] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<"recent" | "rate" | "deadline">("recent");
  const [actingOnId, setActingOnId] = useState<string | null>(null);
  const [isTogglingAvailability, setIsTogglingAvailability] = useState(false);

  const paddingTop = insets.top + (Platform.OS === "web" ? 67 : 0);

  // Separate incoming booking requests (as talent) from outgoing (as client)
  const incomingBookings = useMemo(
    () => bookings.filter((b) => b.talentId === user?.id),
    [bookings, user?.id],
  );
  const pendingRequests = incomingBookings.filter((b) => b.status === "pending");
  const upcomingBookings = incomingBookings.filter((b) => b.status === "accepted");

  // Earnings this month from completed bookings
  const now = new Date();
  const monthLabel = now.toLocaleString("default", { month: "long", year: "numeric" });
  const earnedThisMonth = incomingBookings
    .filter((b) => b.status === "completed" && new Date(b.updatedAt).getMonth() === now.getMonth())
    .reduce((sum, b) => sum + b.totalCost, 0);

  const handleToggleAvailability = async () => {
    if (!user || isTogglingAvailability) return;
    const next = !user.available;
    setIsTogglingAvailability(true);
    try {
      await apiFetch("/auth/me/availability", { method: "PATCH", body: { available: next } });
      updateUser({ available: next });
      Haptics.selectionAsync();
    } catch {
      // silently fail — the toggle will revert to its previous state visually
    } finally {
      setIsTogglingAvailability(false);
    }
  };

  const handleBookingAction = async (id: string, status: "accepted" | "declined") => {
    setActingOnId(id);
    try {
      await updateBookingStatus(id, status);
    } finally {
      setActingOnId(null);
    }
  };

  const filteredJobs = useMemo(() => {
    let jobs = [...allJobs];
    if (search.trim()) {
      const q = search.toLowerCase();
      jobs = jobs.filter(
        (j) =>
          j.title.toLowerCase().includes(q) ||
          j.client.toLowerCase().includes(q) ||
          j.roles.some((r) => r.toLowerCase().includes(q)) ||
          j.city.toLowerCase().includes(q),
      );
    }
    if (selectedType !== "all") jobs = jobs.filter((j) => j.type === selectedType);
    if (selectedProvince !== "all") jobs = jobs.filter((j) => j.province === selectedProvince);

    if (sortBy === "rate") jobs.sort((a, b) => b.rateNum - a.rateNum);
    else if (sortBy === "deadline") jobs.sort((a, b) => a.deadline.localeCompare(b.deadline));
    else jobs.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));

    return jobs;
  }, [allJobs, search, selectedType, selectedProvince, sortBy]);

  const activeFilterCount =
    (selectedType !== "all" ? 1 : 0) + (selectedProvince !== "all" ? 1 : 0);

  const isAvailable = user?.available ?? false;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: paddingTop + 10, backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => setDrawerOpen(true)} style={styles.menuBtn} activeOpacity={0.7}>
          <Feather name="menu" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.screenTitle, { color: colors.foreground, fontFamily: "Fraunces_700Bold" }]}>Appointments</Text>
        <View style={{ width: 30 }} />
      </View>

      {/* Tabs */}
      <View style={[styles.tabRow, { borderBottomColor: colors.border }]}>
        {(["bookings", "castings", "referrals", "payments"] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => { Haptics.selectionAsync(); setActiveTab(tab); }}
            style={[styles.tabBtn, { borderBottomColor: activeTab === tab ? colors.accent : "transparent" }]}
            activeOpacity={0.75}
          >
            <View style={styles.tabBtnInner}>
              <Text style={[styles.tabBtnText, { color: activeTab === tab ? colors.accent : colors.mutedForeground, fontFamily: activeTab === tab ? "Inter_600SemiBold" : "Inter_400Regular" }]}>
                {tab === "bookings" ? "Bookings" : tab === "castings" ? "Castings" : tab === "referrals" ? "Referrals" : "Payments"}
              </Text>
              {tab === "bookings" && pendingRequests.length > 0 && (
                <View style={[styles.tabBadge, { backgroundColor: colors.accent }]}>
                  <Text style={[styles.tabBadgeText, { color: "#fff", fontFamily: "Inter_700Bold" }]}>{pendingRequests.length}</Text>
                </View>
              )}
              {tab === "castings" && totalApplied > 0 && (
                <View style={[styles.tabBadge, { backgroundColor: colors.green }]}>
                  <Text style={[styles.tabBadgeText, { color: "#fff", fontFamily: "Inter_700Bold" }]}>{totalApplied}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── BOOKINGS TAB ─────────────────────────────────────────────────────── */}
      {activeTab === "bookings" && (
        <ScrollView
          contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 0) + 100 }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Availability toggle */}
          <TouchableOpacity
            onPress={handleToggleAvailability}
            activeOpacity={0.82}
            style={[
              styles.availabilityCard,
              {
                backgroundColor: isAvailable ? colors.greenDim : colors.card,
                borderColor: isAvailable ? colors.green + "50" : colors.border,
                borderRadius: colors.radius + 2,
              },
            ]}
          >
            <View style={styles.availabilityLeft}>
              <View style={[styles.availabilityDot, { backgroundColor: isAvailable ? colors.green : colors.dim }]} />
              <View style={{ gap: 2 }}>
                <Text style={[styles.availabilityTitle, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
                  {isAvailable ? "Available for bookings" : "Not accepting bookings"}
                </Text>
                <Text style={[styles.availabilitySub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                  {isAvailable
                    ? "Clients can send you direct booking requests"
                    : "Turn on to receive direct client bookings"}
                </Text>
              </View>
            </View>
            {isTogglingAvailability ? (
              <ActivityIndicator size="small" color={colors.green} />
            ) : (
              <View
                style={[
                  styles.toggle,
                  { backgroundColor: isAvailable ? colors.green : colors.muted },
                ]}
              >
                <View
                  style={[
                    styles.toggleThumb,
                    {
                      backgroundColor: "#fff",
                      transform: [{ translateX: isAvailable ? 20 : 2 }],
                    },
                  ]}
                />
              </View>
            )}
          </TouchableOpacity>

          {/* Earnings this month */}
          <View style={[styles.earningsCard, { backgroundColor: colors.primary, borderRadius: colors.radius + 2 }]}>
            <View>
              <Text style={[styles.earningsLabel, { color: "rgba(255,255,255,0.75)", fontFamily: "Inter_400Regular" }]}>
                {monthLabel.toUpperCase()}
              </Text>
              <Text style={[styles.earningsAmount, { color: "#fff", fontFamily: "Inter_700Bold" }]}>
                R{earnedThisMonth.toLocaleString()}
              </Text>
            </View>
            <View style={styles.earningsStats}>
              <View style={styles.earningStat}>
                <Text style={[styles.earningStatNum, { color: "#fff", fontFamily: "Inter_700Bold" }]}>{pendingRequests.length}</Text>
                <Text style={[styles.earningStatLabel, { color: "rgba(255,255,255,0.65)", fontFamily: "Inter_400Regular" }]}>Pending</Text>
              </View>
              <View style={[styles.earningStatDivider, { backgroundColor: "rgba(255,255,255,0.25)" }]} />
              <View style={styles.earningStat}>
                <Text style={[styles.earningStatNum, { color: "#fff", fontFamily: "Inter_700Bold" }]}>{upcomingBookings.length}</Text>
                <Text style={[styles.earningStatLabel, { color: "rgba(255,255,255,0.65)", fontFamily: "Inter_400Regular" }]}>Upcoming</Text>
              </View>
              <View style={[styles.earningStatDivider, { backgroundColor: "rgba(255,255,255,0.25)" }]} />
              <View style={styles.earningStat}>
                <Text style={[styles.earningStatNum, { color: "#fff", fontFamily: "Inter_700Bold" }]}>{user?.jobsCount ?? 0}</Text>
                <Text style={[styles.earningStatLabel, { color: "rgba(255,255,255,0.65)", fontFamily: "Inter_400Regular" }]}>Done</Text>
              </View>
            </View>
          </View>

          {bookingsLoading ? (
            <View style={styles.emptyState}>
              <ActivityIndicator color={colors.primary} />
              <Text style={[styles.emptySub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                Loading bookings…
              </Text>
            </View>
          ) : (
            <>
              {/* Pending requests */}
              {pendingRequests.length > 0 && (
                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
                    New Requests
                  </Text>
                  {pendingRequests.map((b) => (
                    <BookingRequestCard
                      key={b.id}
                      booking={b}
                      onAccept={() => handleBookingAction(b.id, "accepted")}
                      onDecline={() => handleBookingAction(b.id, "declined")}
                      isActing={actingOnId === b.id}
                    />
                  ))}
                </View>
              )}

              {/* Upcoming accepted bookings */}
              {upcomingBookings.length > 0 && (
                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
                    Upcoming
                  </Text>
                  {upcomingBookings.map((b) => (
                    <BookingRequestCard
                      key={b.id}
                      booking={b}
                      onAccept={() => {}}
                      onDecline={() => {}}
                      isActing={false}
                    />
                  ))}
                </View>
              )}

              {/* Empty state */}
              {incomingBookings.length === 0 && (
                <View style={styles.emptyState}>
                  <Feather name="calendar" size={28} color={colors.dim} />
                  <Text style={[styles.emptyTitle, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
                    No booking requests yet
                  </Text>
                  <Text style={[styles.emptySub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                    {isAvailable
                      ? "When clients book you directly, requests will appear here."
                      : "Turn on availability so clients can send you booking requests."}
                  </Text>
                </View>
              )}
            </>
          )}
        </ScrollView>
      )}

      {/* ── CASTINGS TAB ─────────────────────────────────────────────────────── */}
      {activeTab === "castings" && (
        <>
          <View style={[styles.searchBar, { paddingHorizontal: 12, paddingVertical: 10, borderBottomColor: colors.borderLight, borderBottomWidth: 1 }]}>
            <View style={[styles.searchInputWrap, { backgroundColor: colors.muted, borderRadius: colors.radius, flex: 1 }]}>
              <Feather name="search" size={14} color={colors.mutedForeground} />
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Search castings, clients, roles..."
                placeholderTextColor={colors.dim}
                style={[styles.searchText, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}
              />
              {search ? (
                <TouchableOpacity onPress={() => setSearch("")} activeOpacity={0.7}>
                  <Feather name="x" size={13} color={colors.mutedForeground} />
                </TouchableOpacity>
              ) : null}
            </View>
            <TouchableOpacity
              onPress={() => { Haptics.selectionAsync(); setShowFilters((v) => !v); }}
              style={[styles.filterBtn, { backgroundColor: showFilters || activeFilterCount > 0 ? colors.primaryDim : colors.muted, borderRadius: colors.radius, borderColor: showFilters || activeFilterCount > 0 ? colors.primary + "50" : colors.border, borderWidth: 1 }]}
              activeOpacity={0.75}
            >
              <Feather name="sliders" size={15} color={showFilters || activeFilterCount > 0 ? colors.primary : colors.mutedForeground} />
              {activeFilterCount > 0 && (
                <View style={[styles.filterDot, { backgroundColor: colors.primary }]}>
                  <Text style={[styles.filterDotText, { color: "#fff", fontFamily: "Inter_700Bold" }]}>{activeFilterCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {showFilters && (
            <View style={[styles.filterPanel, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterChips}>
                {JOB_TYPES.map((t) => (
                  <TouchableOpacity
                    key={t.id}
                    onPress={() => { Haptics.selectionAsync(); setSelectedType(t.id); }}
                    style={[styles.filterChip, { backgroundColor: selectedType === t.id ? colors.primary : colors.muted, borderRadius: 20, borderColor: selectedType === t.id ? colors.primary : colors.border, borderWidth: 1 }]}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.filterChipText, { color: selectedType === t.id ? "#fff" : colors.mutedForeground, fontFamily: selectedType === t.id ? "Inter_600SemiBold" : "Inter_400Regular" }]}>{t.label}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterChips}>
                {SA_PROVINCES.map((p) => (
                  <TouchableOpacity
                    key={p.id}
                    onPress={() => { Haptics.selectionAsync(); setSelectedProvince(p.id); }}
                    style={[styles.filterChip, { backgroundColor: selectedProvince === p.id ? colors.purple : colors.muted, borderRadius: 20, borderColor: selectedProvince === p.id ? colors.purple : colors.border, borderWidth: 1 }]}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.filterChipText, { color: selectedProvince === p.id ? "#fff" : colors.mutedForeground, fontFamily: selectedProvince === p.id ? "Inter_600SemiBold" : "Inter_400Regular" }]}>
                      {p.id === "all" ? "All Provinces" : p.id}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <View style={styles.sortRow}>
                <Text style={[styles.sortLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>Sort:</Text>
                {(["recent", "rate", "deadline"] as const).map((s) => (
                  <TouchableOpacity
                    key={s}
                    onPress={() => { Haptics.selectionAsync(); setSortBy(s); }}
                    style={[styles.sortChip, { backgroundColor: sortBy === s ? colors.accentDim : "transparent", borderRadius: 8, borderColor: sortBy === s ? colors.accent + "60" : colors.border, borderWidth: 1 }]}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.sortChipText, { color: sortBy === s ? colors.accent : colors.mutedForeground, fontFamily: sortBy === s ? "Inter_600SemiBold" : "Inter_400Regular" }]}>
                      {s === "recent" ? "Latest" : s === "rate" ? "Highest Rate" : "Deadline"}
                    </Text>
                  </TouchableOpacity>
                ))}
                {activeFilterCount > 0 && (
                  <TouchableOpacity onPress={() => { setSelectedType("all"); setSelectedProvince("all"); }} style={styles.clearBtn} activeOpacity={0.75}>
                    <Text style={[styles.clearText, { color: colors.primary, fontFamily: "Inter_600SemiBold" }]}>Clear</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}

          <FlatList
            data={filteredJobs}
            keyExtractor={(item) => item.id}
            contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 0) + 100 }]}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={
              <View style={styles.listHeader}>
                <Text style={[styles.resultsCount, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
                  {filteredJobs.length} casting{filteredJobs.length !== 1 ? "s" : ""}
                  {search || activeFilterCount > 0 ? " found" : " available"}
                </Text>
              </View>
            }
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Feather name="search" size={28} color={colors.dim} />
                <Text style={[styles.emptyTitle, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
                  {jobsLoading ? "Loading castings..." : "No castings found"}
                </Text>
                <Text style={[styles.emptySub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                  {jobsLoading ? "Fetching the latest castings." : "Try different filters or check back later."}
                </Text>
                {!jobsLoading && (
                  <TouchableOpacity
                    onPress={() => { setSearch(""); setSelectedType("all"); setSelectedProvince("all"); }}
                    style={[styles.clearAllBtn, { borderColor: colors.border, borderRadius: colors.radius }]}
                    activeOpacity={0.75}
                  >
                    <Text style={[styles.clearAllText, { color: colors.primary, fontFamily: "Inter_600SemiBold" }]}>Clear All Filters</Text>
                  </TouchableOpacity>
                )}
              </View>
            }
            renderItem={({ item }) => (
              <View style={styles.cardWrap}>
                <JobCard job={item} applied={hasApplied(item.id)} />
              </View>
            )}
          />
        </>
      )}

      {/* ── REFERRALS TAB ────────────────────────────────────────────────────── */}
      {activeTab === "referrals" && (
        <ScrollView contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 0) + 100 }]} showsVerticalScrollIndicator={false}>
          <View style={[styles.referralCard, { backgroundColor: colors.accentDim, borderRadius: colors.radius + 4, borderColor: colors.accent + "40", borderWidth: 1 }]}>
            <Feather name="gift" size={28} color={colors.accent} />
            <Text style={[styles.referralTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>Earn R500 per referral</Text>
            <Text style={[styles.referralSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              Invite friends to join GlamNet. When they complete their first job, you both earn a bonus.
            </Text>
            <TouchableOpacity style={[styles.referralBtn, { backgroundColor: colors.accent, borderRadius: colors.radius }]} onPress={() => Haptics.selectionAsync()} activeOpacity={0.82}>
              <Feather name="share-2" size={14} color="#fff" />
              <Text style={[styles.referralBtnText, { color: "#fff", fontFamily: "Inter_600SemiBold" }]}>Share Referral Link</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.referralStats}>
            {[
              { label: "Total Referrals", value: String(user?.referrals ?? 0), color: colors.purple },
              { label: "Earned", value: `R${((user?.referrals ?? 0) * 500).toLocaleString()}`, color: colors.green },
            ].map((s) => (
              <View key={s.label} style={[styles.referralStat, { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1, borderRadius: colors.radius }]}>
                <Text style={[styles.referralStatNum, { color: s.color, fontFamily: "Inter_700Bold" }]}>{s.value}</Text>
                <Text style={[styles.referralStatLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>{s.label}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      )}

      {/* ── PAYMENTS TAB ─────────────────────────────────────────────────────── */}
      {activeTab === "payments" && (
        <ScrollView contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 0) + 100 }]} showsVerticalScrollIndicator={false}>
          <View style={[styles.paymentSummary, { backgroundColor: colors.warm, borderRadius: colors.radius }]}>
            <Text style={[styles.paymentSummaryLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>Total Earned</Text>
            <Text style={[styles.paymentSummaryAmount, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
              R{(user?.earnings ?? 0).toLocaleString()}
            </Text>
            <Text style={[styles.paymentSummaryNote, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              Across {user?.jobsCount ?? 0} {(user?.jobsCount ?? 0) !== 1 ? "appointments" : "appointment"}
            </Text>
          </View>
          <View style={styles.emptyState}>
            <Feather name="credit-card" size={28} color={colors.dim} />
            <Text style={[styles.emptyTitle, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
              No payment history yet
            </Text>
            <Text style={[styles.emptySub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              Complete bookings to see your payment history here.
            </Text>
          </View>
        </ScrollView>
      )}

      <ProfileDrawer visible={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1 },
  menuBtn: { padding: 4 },
  screenTitle: { fontSize: 18, letterSpacing: -0.5 },
  tabRow: { flexDirection: "row", borderBottomWidth: 1 },
  tabBtn: { flex: 1, paddingVertical: 12, alignItems: "center", borderBottomWidth: 2 },
  tabBtnInner: { flexDirection: "row", alignItems: "center", gap: 5 },
  tabBtnText: { fontSize: 12 },
  tabBadge: { minWidth: 16, height: 16, borderRadius: 8, alignItems: "center", justifyContent: "center", paddingHorizontal: 3 },
  tabBadgeText: { fontSize: 9 },

  // Availability card
  availabilityCard: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 16, borderWidth: 1.5, gap: 12 },
  availabilityLeft: { flex: 1, flexDirection: "row", alignItems: "center", gap: 10 },
  availabilityDot: { width: 10, height: 10, borderRadius: 5 },
  availabilityTitle: { fontSize: 14 },
  availabilitySub: { fontSize: 11, lineHeight: 15 },
  toggle: { width: 44, height: 24, borderRadius: 12, justifyContent: "center", position: "relative" },
  toggleThumb: { position: "absolute", width: 20, height: 20, borderRadius: 10, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.15, shadowRadius: 2, elevation: 2 },

  // Earnings card
  earningsCard: { padding: 16, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  earningsLabel: { fontSize: 9, letterSpacing: 1.5, marginBottom: 4 },
  earningsAmount: { fontSize: 26, letterSpacing: -0.8 },
  earningsStats: { flexDirection: "row", gap: 14, alignItems: "center" },
  earningStat: { alignItems: "center", gap: 2 },
  earningStatNum: { fontSize: 18, letterSpacing: -0.4 },
  earningStatLabel: { fontSize: 10 },
  earningStatDivider: { width: 1, height: 24 },

  // Sections
  section: { gap: 10 },
  sectionTitle: { fontSize: 15, letterSpacing: -0.3 },

  // Booking card
  bookingCard: { padding: 14, gap: 12 },
  bookingCardHeader: {},
  bookingClientRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  bookingAvatar: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  bookingAvatarText: { fontSize: 16 },
  bookingClientName: { fontSize: 14 },
  bookingClientHandle: { fontSize: 11, marginTop: 1 },
  bookingStatusChip: { paddingHorizontal: 8, paddingVertical: 4 },
  bookingStatusText: { fontSize: 10 },
  bookingDetails: { gap: 7, paddingVertical: 12, borderTopWidth: 1, borderBottomWidth: 1 },
  bookingDetailRow: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  bookingDetailText: { fontSize: 13, flex: 1 },
  bookingCardFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  bookingTotal: { fontSize: 16, letterSpacing: -0.3 },
  bookingActions: { flexDirection: "row", gap: 8, alignItems: "center" },
  declineBtn: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1 },
  declineBtnText: { fontSize: 13 },
  acceptBtn: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 16, paddingVertical: 8 },
  acceptBtnText: { fontSize: 13 },

  // Castings / job card
  searchBar: { flexDirection: "row", gap: 8, alignItems: "center" },
  searchInputWrap: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 12, paddingVertical: 10 },
  searchText: { flex: 1, fontSize: 14 },
  filterBtn: { width: 42, height: 42, alignItems: "center", justifyContent: "center", position: "relative" },
  filterDot: { position: "absolute", top: 6, right: 6, width: 14, height: 14, borderRadius: 7, alignItems: "center", justifyContent: "center" },
  filterDotText: { fontSize: 9 },
  filterPanel: { paddingVertical: 8, gap: 6, borderBottomWidth: 1 },
  filterChips: { paddingHorizontal: 12, gap: 8, flexDirection: "row" },
  filterChip: { paddingHorizontal: 14, paddingVertical: 7 },
  filterChipText: { fontSize: 12 },
  sortRow: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12 },
  sortLabel: { fontSize: 12 },
  sortChip: { paddingHorizontal: 10, paddingVertical: 5 },
  sortChipText: { fontSize: 11 },
  clearBtn: {},
  clearText: { fontSize: 12 },
  listContent: { padding: 14, gap: 12 },
  listHeader: { marginBottom: 4 },
  resultsCount: { fontSize: 15, letterSpacing: -0.3 },
  cardWrap: { marginBottom: 0 },
  jobCard: { padding: 14, gap: 8 },
  cardTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  cardBadges: { flexDirection: "row", gap: 6, flexWrap: "wrap" as const },
  badge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 7, paddingVertical: 3 },
  badgeText: { fontSize: 9 },
  typePill: { paddingHorizontal: 9, paddingVertical: 4 },
  typeText: { fontSize: 10 },
  jobTitle: { fontSize: 14, letterSpacing: -0.2, lineHeight: 20 },
  jobClient: { fontSize: 12, marginTop: -2 },
  metaRow: { flexDirection: "row", gap: 12, flexWrap: "wrap" as const },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: { fontSize: 11 },
  cardFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  rolesRow: { flexDirection: "row", gap: 5, flexWrap: "wrap" as const },
  roleTag: { paddingHorizontal: 7, paddingVertical: 3 },
  roleTagText: { fontSize: 10 },
  jobRate: { fontSize: 14, letterSpacing: -0.3 },
  deadlineRow: { flexDirection: "row", alignItems: "center", gap: 5, borderTopWidth: 1, paddingTop: 8 },
  deadlineText: { fontSize: 10, flex: 1 },

  // Shared empty state
  emptyState: { alignItems: "center", paddingTop: 60, gap: 10 },
  emptyTitle: { fontSize: 16 },
  emptySub: { fontSize: 13, textAlign: "center", paddingHorizontal: 24 },
  clearAllBtn: { paddingHorizontal: 20, paddingVertical: 10, borderWidth: 1, marginTop: 8 },
  clearAllText: { fontSize: 13 },

  // Referrals
  referralCard: { padding: 24, alignItems: "center", gap: 12, marginBottom: 16 },
  referralTitle: { fontSize: 18, textAlign: "center" },
  referralSub: { fontSize: 13, textAlign: "center", lineHeight: 18, paddingHorizontal: 8 },
  referralBtn: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 24, paddingVertical: 12 },
  referralBtnText: { fontSize: 14 },
  referralStats: { flexDirection: "row", gap: 10 },
  referralStat: { flex: 1, padding: 14, alignItems: "center", gap: 4 },
  referralStatNum: { fontSize: 20, letterSpacing: -0.5 },
  referralStatLabel: { fontSize: 11, textAlign: "center" },

  // Payments
  paymentSummary: { padding: 20, alignItems: "center", marginBottom: 16, gap: 4 },
  paymentSummaryLabel: { fontSize: 10, textTransform: "uppercase" as const, letterSpacing: 1 },
  paymentSummaryAmount: { fontSize: 28, letterSpacing: -0.8 },
  paymentSummaryNote: { fontSize: 12 },
});
