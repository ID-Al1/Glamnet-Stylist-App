/**
 * Paystack service — thin wrapper around the Paystack REST API.
 *
 * Env required:
 *   PAYSTACK_SECRET_KEY   — your live/test secret key from Paystack dashboard
 *
 * Amounts are always in the SMALLEST unit of the currency:
 *   ZAR → cents  (R 100.00 = 10000)
 *   NGN → kobo   (₦ 100.00 = 10000)
 *   KES → cents  (KSh 100.00 = 10000)
 */

const PAYSTACK_BASE = "https://api.paystack.co";

function headers() {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key) throw new Error("PAYSTACK_SECRET_KEY is not set");
  return {
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
  };
}

export interface PaystackInitResult {
  authorizationUrl: string;
  accessCode: string;
  reference: string;
}

/**
 * Initialise a Paystack transaction.
 * Returns the hosted checkout URL to redirect / open in WebView.
 */
export async function initializePayment(opts: {
  email: string;
  amountSmallestUnit: number;
  currency: string;
  reference: string;
  metadata?: Record<string, unknown>;
}): Promise<PaystackInitResult> {
  const body = {
    email: opts.email,
    amount: opts.amountSmallestUnit,
    currency: opts.currency,
    reference: opts.reference,
    metadata: opts.metadata ?? {},
  };

  const res = await fetch(`${PAYSTACK_BASE}/transaction/initialize`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(body),
  });

  const json = await res.json() as any;
  if (!res.ok || !json.status) {
    throw new Error(json.message ?? "Paystack initialization failed");
  }

  return {
    authorizationUrl: json.data.authorization_url,
    accessCode: json.data.access_code,
    reference: json.data.reference,
  };
}

export interface PaystackVerifyResult {
  status: "success" | "failed" | "abandoned" | "pending";
  amount: number;         // in smallest unit
  currency: string;
  paidAt: string | null;
  reference: string;
}

/**
 * Verify a Paystack transaction by reference.
 * Call this in the webhook handler or after user returns from checkout.
 */
export async function verifyPayment(reference: string): Promise<PaystackVerifyResult> {
  const res = await fetch(`${PAYSTACK_BASE}/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: headers(),
  });

  const json = await res.json() as any;
  if (!res.ok || !json.status) {
    throw new Error(json.message ?? "Paystack verification failed");
  }

  return {
    status: json.data.status,
    amount: json.data.amount,
    currency: json.data.currency,
    paidAt: json.data.paid_at ?? null,
    reference: json.data.reference,
  };
}
