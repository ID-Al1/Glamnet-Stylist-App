import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useRef, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { useColors } from "@/hooks/useColors";

// ── South African location suggestions ────────────────────────────────────────
const SA_LOCATIONS = [
  // Gauteng
  "Sandton, Johannesburg", "Rosebank, Johannesburg", "Melrose Arch, Johannesburg",
  "Midrand, Johannesburg", "Fourways, Johannesburg", "Randburg, Johannesburg",
  "Parkhurst, Johannesburg", "Maboneng, Johannesburg", "Soweto, Johannesburg",
  "Bryanston, Johannesburg", "Morningside, Johannesburg", "Hyde Park, Johannesburg",
  "Greenside, Johannesburg", "Linden, Johannesburg", "Northcliff, Johannesburg",
  "Pretoria CBD", "Hatfield, Pretoria", "Centurion, Pretoria", "Menlyn, Pretoria",
  "Brooklyn, Pretoria", "Sunnyside, Pretoria", "Waterkloof, Pretoria",
  // Western Cape
  "Cape Town CBD", "V&A Waterfront, Cape Town", "Camps Bay, Cape Town",
  "Sea Point, Cape Town", "Green Point, Cape Town", "De Waterkant, Cape Town",
  "Woodstock, Cape Town", "Observatory, Cape Town", "Kloof Street, Cape Town",
  "Bloubergstrand, Cape Town", "Constantia, Cape Town", "Newlands, Cape Town",
  "Claremont, Cape Town", "Wynberg, Cape Town", "Hout Bay, Cape Town",
  "Stellenbosch", "Franschhoek", "Paarl", "Somerset West", "Hermanus",
  "Knysna", "George, Western Cape", "Mossel Bay",
  // KwaZulu-Natal
  "Durban CBD", "Umhlanga, Durban", "Ballito, KZN", "La Lucia, Durban",
  "Westville, Durban", "Pinetown, Durban", "Berea, Durban", "Morningside, Durban",
  "uMhlanga Ridge, Durban", "Musgrave, Durban", "Pietermaritzburg CBD",
  "Ladysmith, KZN", "Richards Bay",
  // Eastern Cape
  "Gqeberha (Port Elizabeth) CBD", "Summerstrand, Gqeberha",
  "Newton Park, Gqeberha", "East London CBD", "Gonubie, East London",
  "Vincent, East London", "Mthatha", "King William's Town",
  // Free State
  "Bloemfontein CBD", "Westdene, Bloemfontein", "Langenhoven Park, Bloemfontein",
  // Mpumalanga
  "Nelspruit / Mbombela CBD", "White River", "Hazyview", "Komatipoort",
  // Limpopo
  "Polokwane CBD", "Tzaneen", "Louis Trichardt", "Bela-Bela",
  // North West
  "Rustenburg", "Sun City, North West", "Potchefstroom", "Klerksdorp",
  // Northern Cape
  "Kimberley CBD", "Upington", "Springbok",
];

interface LocationInputProps {
  value: string;
  onChange: (v: string) => void;
  error?: string;
  placeholder?: string;
}

export function LocationInput({ value, onChange, error, placeholder = "Studio / venue address" }: LocationInputProps) {
  const colors = useColors();
  const inputRef = useRef<TextInput>(null);
  const [focused, setFocused] = useState(false);

  const suggestions =
    value.trim().length >= 2
      ? SA_LOCATIONS.filter((loc) =>
          loc.toLowerCase().includes(value.toLowerCase())
        ).slice(0, 6)
      : [];

  const showDropdown = focused && suggestions.length > 0;

  function pick(loc: string) {
    Haptics.selectionAsync();
    onChange(loc);
    setFocused(false);
    inputRef.current?.blur();
  }

  return (
    <View>
      {/* Input row */}
      <View
        style={[
          styles.inputWrap,
          {
            borderColor: error
              ? colors.destructive
              : focused
              ? colors.primary
              : colors.border,
            backgroundColor: colors.card,
            borderRadius: showDropdown ? colors.radius : colors.radius,
            borderBottomLeftRadius: showDropdown ? 0 : colors.radius,
            borderBottomRightRadius: showDropdown ? 0 : colors.radius,
          },
        ]}
      >
        <Feather name="map-pin" size={16} color={focused ? colors.primary : colors.mutedForeground} />
        <TextInput
          ref={inputRef}
          value={value}
          onChangeText={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => {
            // short delay so tap on suggestion registers before blur hides it
            setTimeout(() => setFocused(false), 150);
          }}
          placeholder={placeholder}
          placeholderTextColor={colors.dim}
          style={[styles.input, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}
          returnKeyType="done"
          autoCorrect={false}
        />
        {value.length > 0 && (
          <TouchableOpacity
            onPress={() => { onChange(""); inputRef.current?.focus(); }}
            hitSlop={8}
            activeOpacity={0.6}
          >
            <Feather name="x" size={14} color={colors.dim} />
          </TouchableOpacity>
        )}
      </View>

      {/* Predictions dropdown */}
      {showDropdown && (
        <View
          style={[
            styles.dropdown,
            {
              backgroundColor: colors.card,
              borderColor: colors.primary,
              borderBottomLeftRadius: colors.radius,
              borderBottomRightRadius: colors.radius,
            },
          ]}
        >
          {suggestions.map((loc, i) => (
            <TouchableOpacity
              key={loc}
              onPress={() => pick(loc)}
              activeOpacity={0.7}
              style={[
                styles.suggestion,
                {
                  borderTopColor: i === 0 ? "transparent" : colors.border,
                },
              ]}
            >
              <View style={[styles.pinDot, { backgroundColor: colors.primaryDim, borderRadius: 8 }]}>
                <Feather name="map-pin" size={11} color={colors.primary} />
              </View>
              <View style={styles.suggestionText}>
                <SuggestionHighlight
                  text={loc}
                  query={value}
                  foreground={colors.foreground}
                  highlight={colors.primary}
                />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

// Highlight matching part of the suggestion text
function SuggestionHighlight({
  text,
  query,
  foreground,
  highlight,
}: {
  text: string;
  query: string;
  foreground: string;
  highlight: string;
}) {
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1 || !query) {
    return (
      <Text style={{ color: foreground, fontFamily: "Inter_400Regular", fontSize: 13 }}>
        {text}
      </Text>
    );
  }
  return (
    <Text style={{ color: foreground, fontFamily: "Inter_400Regular", fontSize: 13 }}>
      {text.slice(0, idx)}
      <Text style={{ color: highlight, fontFamily: "Inter_600SemiBold" }}>
        {text.slice(idx, idx + query.length)}
      </Text>
      {text.slice(idx + query.length)}
    </Text>
  );
}

const styles = StyleSheet.create({
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderWidth: 1.5,
  },
  input: { flex: 1, fontSize: 15 },
  dropdown: {
    borderWidth: 1.5,
    borderTopWidth: 0,
    overflow: "hidden",
  },
  suggestion: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderTopWidth: 1,
  },
  pinDot: {
    width: 26,
    height: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  suggestionText: { flex: 1 },
});
