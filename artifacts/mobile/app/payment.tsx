/**
 * Payment screen — embedded Paystack WebView checkout.
 *
 * Navigate here with:
 *   router.push({ pathname: "/payment", params: { amountZar: "500", bookingId: "..." } })
 *
 * After payment the user is redirected back. We then verify with our API
 * and show a success or failure state.
 */
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from "react-native";
import { WebView, type WebViewNavigation } from "react-native-webview";
import { router, useLocalSearchParams } from "expo-router";
import { usePayment, CURRENCY_SYMBOLS, SUPPORTED_CURRENCIES, type SupportedCurrency } from "@/context/PaymentContext";
import Colors from "@/constants/colors";

type Step = "currency-select" | "loading" | "checkout" | "verifying" | "done" | "error";

export default function PaymentScreen() {
  const params = useLocalSearchParams<{ amountZar: string; bookingId?: string }>();
  const amountZar = parseFloat(params.amountZar ?? "0");
  const bookingId = params.bookingId;

  const { initializePayment, verifyPayment, preferredCurrency, setPreferredCurrency, convertFromZar, loadFxRates } =
    usePayment();

  const [step, setStep] = useState<Step>("currency-select");
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [paystackRef, setPaystackRef] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => { loadFxRates(); }, [loadFxRates]);

  const { amount, symbol, currency } = convertFromZar(amountZar);

  const startCheckout = async (selectedCurrency: SupportedCurrency) => {
    setPreferredCurrency(selectedCurrency);
    setStep("loading");
    try {
      const result = await initializePayment({ amountZar, currency: selectedCurrency, bookingId });
      setCheckoutUrl(result.checkoutUrl);
      setPaystackRef(result.payment.paystackReference);
      setStep("checkout");
    } catch (e: any) {
      setErrorMessage(e.message ?? "Could not start payment");
      setStep("error");
    }
  };

  const handleWebViewNav = async (nav: WebViewNavigation) => {
    // Paystack redirects to a callback URL after payment
    if (nav.url.includes("paystack.com/close") || nav.url.includes("callback")) {
      setStep("verifying");
      try {
        if (!paystackRef) throw new Error("Missing reference");
        const payment = await verifyPayment(paystackRef);
        if (payment.status === "success") {
          setStep("done");
        } else {
          setErrorMessage("Payment was not successful. Status: " + payment.status);
          setStep("error");
        }
      } catch (e: any) {
        setErrorMessage(e.message ?? "Verification failed");
        setStep("error");
      }
    }
  };

  // ─── Currency picker ──────────────────────────────────────────────────────
  if (step === "currency-select") {
    return (
      <View style={styles.screen}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Pay for booking</Text>
        <Text style={styles.amountLabel}>
          Amount: <Text style={styles.amountValue}>R {amountZar.toFixed(2)}</Text>
        </Text>
        <Text style={styles.currencyHint}>Choose your payment currency:</Text>
        {SUPPORTED_CURRENCIES.map((c) => (
          <TouchableOpacity key={c} style={styles.currencyBtn} onPress={() => startCheckout(c)}>
            <Text style={styles.currencyBtnSymbol}>{CURRENCY_SYMBOLS[c]}</Text>
            <Text style={styles.currencyBtnLabel}>{c}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  }

  // ─── Loading spinner ──────────────────────────────────────────────────────
  if (step === "loading" || step === "verifying") {
    return (
      <View style={[styles.screen, styles.center]}>
        <ActivityIndicator color={Colors.accent} size="large" />
        <Text style={styles.loadingText}>
          {step === "verifying" ? "Confirming your payment..." : "Opening checkout..."}
        </Text>
      </View>
    );
  }

  // ─── WebView checkout ─────────────────────────────────────────────────────
  if (step === "checkout" && checkoutUrl) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.background }}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>✕ Cancel</Text>
        </TouchableOpacity>
        <WebView
          source={{ uri: checkoutUrl }}
          onNavigationStateChange={handleWebViewNav}
          startInLoadingState
          renderLoading={() => (
            <View style={[styles.screen, styles.center]}>
              <ActivityIndicator color={Colors.accent} size="large" />
            </View>
          )}
        />
      </View>
    );
  }

  // ─── Success ──────────────────────────────────────────────────────────────
  if (step === "done") {
    return (
      <View style={[styles.screen, styles.center]}>
        <Text style={styles.successIcon}>✅</Text>
        <Text style={styles.successTitle}>Payment confirmed</Text>
        <Text style={styles.successDesc}>Your booking is now confirmed. You'll receive a notification shortly.</Text>
        <TouchableOpacity style={styles.doneBtn} onPress={() => router.replace("/(tabs)")}>
          <Text style={styles.doneBtnText}>Back to Home</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ─── Error ────────────────────────────────────────────────────────────────
  return (
    <View style={[styles.screen, styles.center]}>
      <Text style={styles.errorIcon}>⚠️</Text>
      <Text style={styles.errorTitle}>Payment failed</Text>
      <Text style={styles.errorDesc}>{errorMessage}</Text>
      <TouchableOpacity style={styles.doneBtn} onPress={() => setStep("currency-select")}>
        <Text style={styles.doneBtnText}>Try Again</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 12 }}>
        <Text style={[styles.backText, { textAlign: "center" }]}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background, padding: 20 },
  center: { alignItems: "center", justifyContent: "center" },

  backBtn: { marginBottom: 12 },
  backText: { color: Colors.accent, fontSize: 15, fontFamily: "Inter_500Medium" },

  title: { fontSize: 24, fontFamily: "Fraunces_700Bold", color: Colors.foreground, marginBottom: 8 },
  amountLabel: { fontSize: 15, color: Colors.mutedForeground, fontFamily: "Inter_400Regular", marginBottom: 4 },
  amountValue: { color: Colors.foreground, fontFamily: "Inter_600SemiBold" },
  currencyHint: { fontSize: 14, color: Colors.mutedForeground, fontFamily: "Inter_400Regular", marginTop: 20, marginBottom: 12 },

  currencyBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
  },
  currencyBtnSymbol: { fontSize: 22, fontFamily: "Inter_700Bold", color: Colors.accent, width: 36, textAlign: "center" },
  currencyBtnLabel: { fontSize: 16, fontFamily: "Inter_600SemiBold", color: Colors.foreground },

  loadingText: { marginTop: 16, fontSize: 15, color: Colors.mutedForeground, fontFamily: "Inter_400Regular" },

  successIcon: { fontSize: 56, marginBottom: 16 },
  successTitle: { fontSize: 22, fontFamily: "Fraunces_700Bold", color: Colors.foreground, marginBottom: 8 },
  successDesc: { fontSize: 14, color: Colors.mutedForeground, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 20, marginBottom: 28 },

  errorIcon: { fontSize: 56, marginBottom: 16 },
  errorTitle: { fontSize: 22, fontFamily: "Fraunces_700Bold", color: Colors.foreground, marginBottom: 8 },
  errorDesc: { fontSize: 14, color: Colors.mutedForeground, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 20, marginBottom: 28 },

  doneBtn: { backgroundColor: Colors.accent, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 40, alignItems: "center" },
  doneBtnText: { color: "#fff", fontSize: 16, fontFamily: "Inter_600SemiBold" },
});
