# AGENT WORK TRACKING & HANDOFF STATE

## Current Status: CORE_VERIFIED_IOS — device discovery and Android pass outstanding

## Last Updated: 2026-09-13T16:35:00+03:00

## What was wrong

* `scanSubnetDevices` returned six hard-coded hosts with invented MAC addresses,
  vendors, latencies and open ports — identical on every run and every network.
* `measureEndpointLatency` returned `18 + Math.random() * 12` from its catch
  block, so a device with no connectivity displayed a healthy latency.
* Packet loss was `jitter > 40 ? 2 : 0` — never measured. A dead connection
  reported 0% loss.
* The store was seeded with `currentPing: 18, averagePing: 21, jitter: 3.2` and
  a hard-coded `localIp`, so the app showed a healthy connection and a plausible
  network before measuring anything.

## What is now true

* Discovery is Bonjour/mDNS browsing plus bounded TCP connect probes, in
  `modules/net-discovery` (Network.framework on iOS, NsdManager on Android).
  iOS forbids raw ICMP and ARP without a special entitlement, so the ARP sweep
  the app advertised was never achievable; neither is reading a neighbour's MAC
  address, which is why the vendor column was fiction.
* Latency is `null` when nothing answered; packet loss is the measured share of
  unanswered probes; the UI renders an explicit unmeasured state.

## Verification performed (iPhone 18 Pro, iOS 27, Release build)

| Check | Result |
| --- | --- |
| `npx tsc --noEmit` | PASS |
| Release build, install, launch | PASS |
| Unmeasured state before any test | PASS — "Not tested", no numbers |
| **Benchmark produces real measurements** | **PASS — 35 ms average, Cloudflare 31 ms, Google 98 ms** |
| Jitter plausible for a stable link | PASS — 4.3 ms |

The two resolvers reporting different latencies is itself evidence the figures
are measured rather than generated.

## Defects found and fixed during verification

1. **Jitter measured the wrong thing.** It was computed across a concatenation
   of probes to two different resolvers, so it reported the gap between those
   hosts rather than variation within either: 66.8 ms on a stable link. Now
   averaged from per-endpoint series.
2. **Connection setup counted as latency.** The first request to an endpoint
   pays DNS and the TLS handshake; including it left jitter at 47.5 ms. A
   warm-up probe is now excluded from latency and jitter, but still counted
   towards packet loss, since a connection that cannot be opened is a real
   failure.
3. The sparkline rendered a single sample as a full-width solid block.
4. The status badge read "Active" in green before any probe had been sent, and
   the DNS cards printed a bare "ms" with no value.

## Outstanding

* **Device discovery not yet exercised on device.** A real Bonjour service
  ("NetPulse Verification Target", `_http._tcp`, port 9321) is published by
  `scratchpad/advertise-service.swift` for this purpose; the devices screen has
  not yet been driven against it.
* Android emulator pass: NOT RUN.
* Store listing, screenshots, icon, keywords: NOT DONE. Copy is written and
  validated in `../scripts/store-metadata.json`.
* IAP `netpulse_pro_lifetime` exists, priced $4.99, `MISSING_METADATA` pending
  the App Review paywall screenshot.
