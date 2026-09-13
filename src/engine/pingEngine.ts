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

  // Jitter is the variation between consecutive probes to the *same* endpoint.
  // Measuring it across a concatenation of two hosts reports the difference
  // between those hosts instead: with Cloudflare at 35 ms and Google at 92 ms
  // the mixed series gave 66.8 ms jitter on a stable connection.
  const perEndpointJitter = ENDPOINTS
    .map((endpoint) => calculateJitter(perEndpoint[endpoint.key]))
    .filter((value): value is number => value !== null);
  const jitter =
    perEndpointJitter.length === 0
      ? null
      : Math.round((perEndpointJitter.reduce((a, b) => a + b, 0) / perEndpointJitter.length) * 10) / 10;

  // Only append a real measurement; a gap in history is better than a
  // fabricated point that flatters the graph.
  const history =
    currentPing === null
      ? existingHistory
      : [...existingHistory.slice(-19), currentPing];

  return {
    currentPing,
    averagePing: mean(history),
    jitter,
    packetLoss: sent === 0 ? 0 : Math.round(((sent - received) / sent) * 100),
    cloudflarePing,
    googlePing,
    history,
    samplesSent: sent,
    samplesReceived: received,
  };
};
