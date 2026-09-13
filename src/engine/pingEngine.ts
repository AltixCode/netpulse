export interface PingResult {
  host: string;
  latencyMs: number;
  timestamp: number;
}

export interface NetworkBenchmark {
  /** Null when no probe in the round succeeded. */
  currentPing: number | null;
  averagePing: number | null;
  jitter: number | null;
  /** Percentage of probes that did not answer, measured — not inferred. */
  packetLoss: number;
  cloudflarePing: number | null;
  googlePing: number | null;
  history: number[];
  /** Probes attempted and answered this round, so the UI can be honest. */
  samplesSent: number;
  samplesReceived: number;
}

/**
 * Mean absolute difference between consecutive delays (RFC 3550 style).
 * J = (1 / (M - 1)) * Sum(|D_k - D_{k+1}|)
 */
export const calculateJitter = (delays: number[]): number | null => {
  if (delays.length < 2) return null;
  let diffSum = 0;
  for (let k = 0; k < delays.length - 1; k++) {
    diffSum += Math.abs(delays[k] - delays[k + 1]);
  }
  return Math.round((diffSum / (delays.length - 1)) * 10) / 10;
};

/**
 * Times a single request against an endpoint.
 *
 * Returns null on failure. The previous implementation returned
 * `18 + Math.random() * 12` from its catch block, so a device with no
 * connectivity at all displayed a healthy latency between 18 and 30 ms.
 */
export const measureEndpointLatency = async (
  url: string,
  timeoutMs: number = 2500,
): Promise<number | null> => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  const start = Date.now();

  try {
    await fetch(url, {
      method: "HEAD",
      signal: controller.signal,
      cache: "no-store",
      headers: { "Cache-Control": "no-cache" },
    });
    return Date.now() - start;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
};

const ENDPOINTS = [
  { key: "cloudflare", url: "https://cloudflare-dns.com/dns-query" },
  { key: "google", url: "https://dns.google/resolve?name=example.com" },
] as const;

/** Probes per endpoint per round; enough to see loss without being a burden. */
const PROBES_PER_ENDPOINT = 3;

/**
 * Runs a benchmark round against two public resolvers.
 *
 * Packet loss is the share of probes that genuinely did not answer. It used to
 * be derived from jitter (`jitter > 40 ? 2 : 0`), which meant the figure was
 * never measured and a fully broken connection reported 0% loss.
 */
export const runNetworkBenchmark = async (
  existingHistory: number[] = [],
): Promise<NetworkBenchmark> => {
  const perEndpoint: Record<string, number[]> = {};
  let sent = 0;
  let received = 0;

  for (const endpoint of ENDPOINTS) {
    perEndpoint[endpoint.key] = [];
    for (let i = 0; i < PROBES_PER_ENDPOINT; i++) {
      sent += 1;
      const latency = await measureEndpointLatency(endpoint.url);
      if (latency !== null) {
        received += 1;
        perEndpoint[endpoint.key].push(latency);
      }
    }
  }

  const mean = (values: number[]): number | null =>
    values.length === 0
      ? null
      : Math.round(values.reduce((a, b) => a + b, 0) / values.length);

  const cloudflarePing = mean(perEndpoint.cloudflare);
  const googlePing = mean(perEndpoint.google);

  const answered = [...perEndpoint.cloudflare, ...perEndpoint.google];
  const currentPing = mean(answered);

  // Only append a real measurement; a gap in history is better than a
  // fabricated point that flatters the graph.
  const history =
    currentPing === null
      ? existingHistory
      : [...existingHistory.slice(-19), currentPing];

  return {
    currentPing,
    averagePing: mean(history),
    jitter: calculateJitter(answered),
    packetLoss: sent === 0 ? 0 : Math.round(((sent - received) / sent) * 100),
    cloudflarePing,
    googlePing,
    history,
    samplesSent: sent,
    samplesReceived: received,
  };
};
