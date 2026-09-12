# NetPulse — Implementation Plan & Technical Blueprint

## 1. Product Summary & Value Proposition
* **Title:** NetPulse: Network Ping & Audit
* **Subtitle:** Clean Wi-Fi & Subnet Scanner
* **Price:** $4.99 Lifetime Non-Consumable IAP
* **Keywords:** ping test, network analyzer, wifi scanner, who is on my wifi, traceroute, latency monitor, isp test, port scan
* **Description:** NetPulse is an ad-free network diagnostic utility that audits network latency, jitter, packet loss, and local subnet devices on-device.

## 2. Target Navigation & Screen Architecture
* `app/_layout.tsx`: Dark theme wrapper, safe area context, purchases initialization.
* `app/index.tsx`: Primary functional interface.
* `app/paywall.tsx`: Pro Lifetime unlock paywall with anti-subscription copy: *"No Subscriptions. No Accounts. 100% On-Device Privacy. Own It Forever."*

## 3. Algorithmic & On-Device Processing
All compute executes strictly locally using on-device modules.

## 4. Phased Roadmap
* Phase 0: Scaffolding, configuration, and boilerplate (Complete)
* Phase 1: Core engine and UI implementation
* Phase 2: RevenueCat and offline persistence integration
* Phase 3: Simulator verification & CI/CD deployment
