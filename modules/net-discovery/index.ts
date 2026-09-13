import { requireNativeModule } from 'expo-modules-core';

export interface DiscoveredService {
  /** Advertised instance name, e.g. "Living Room TV". */
  name: string;
  /** Service type, e.g. "_airplay._tcp". */
  type: string;
  /** Resolved hostname, empty when resolution timed out. */
  host: string;
  /** Resolved IP addresses. */
  addresses: string[];
  port: number;
}

export interface PortProbe {
  host: string;
  port: number;
  open: boolean;
  /** Round-trip time of the TCP handshake in ms, or null when it did not connect. */
  latencyMs: number | null;
}

interface NetDiscoveryModule {
  /** Browses the local network for advertised services for `timeoutMs`. */
  browseServices(timeoutMs: number): Promise<DiscoveredService[]>;
  /** Attempts a TCP connection and times the handshake. */
  probePort(host: string, port: number, timeoutMs: number): Promise<PortProbe>;
}

/**
 * Local-network discovery.
 *
 * iOS forbids raw ICMP and ARP without a special entitlement, so a true ARP
 * sweep is not possible on a stock device — the previous implementation
 * returned six invented hosts with invented MAC addresses and open ports
 * instead. What is genuinely available is Bonjour/mDNS service browsing plus
 * bounded TCP connect probes, and that is what this reports.
 *
 * Implemented with Network.framework on iOS and NsdManager on Android, both
 * built in, so there is no third-party binary to restrict architectures.
 */
export default requireNativeModule<NetDiscoveryModule>('NetDiscovery');
