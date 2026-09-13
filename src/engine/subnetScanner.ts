import NetDiscovery, {
  type DiscoveredService,
} from "../../modules/net-discovery";

export interface SubnetDevice {
  id: string;
  /** Advertised instance name. */
  name: string;
  /** Service type the device advertises, e.g. "_airplay._tcp". */
  service: string;
  /** Human-readable category inferred from the service type. */
  category: string;
  /** Ports confirmed open by a TCP connect, never guessed. */
  openPorts: number[];
  /** TCP handshake round-trip in ms, or null when nothing answered. */
  latencyMs: number | null;
}

/**
 * Maps a Bonjour service type to something a person recognises.
 *
 * This is the honest replacement for the MAC-prefix vendor lookup the app used
 * to show: iOS cannot read a neighbour's MAC address without an entitlement, so
 * the old vendor names were invented alongside the invented hosts.
 */
const CATEGORIES: { match: string[]; category: string }[] = [
  { match: ["_airplay._tcp", "_raop._tcp"], category: "AirPlay receiver" },
  { match: ["_googlecast._tcp"], category: "Chromecast" },
  { match: ["_spotify-connect._tcp"], category: "Speaker" },
  { match: ["_ipp._tcp", "_ipps._tcp", "_printer._tcp"], category: "Printer" },
  { match: ["_smb._tcp", "_afpovertcp._tcp"], category: "File share" },
  { match: ["_ssh._tcp", "_sftp-ssh._tcp"], category: "SSH host" },
  { match: ["_hap._tcp", "_homekit._tcp"], category: "HomeKit accessory" },
  { match: ["_rfb._tcp"], category: "Screen sharing" },
  {
    match: ["_companion-link._tcp", "_device-info._tcp"],
    category: "Apple device",
  },
  { match: ["_http._tcp", "_https._tcp"], category: "Web service" },
  { match: ["_workstation._tcp"], category: "Computer" },
];

const categorise = (serviceType: string): string => {
  const normalised = serviceType.replace(/\.$/, "").toLowerCase();
  const entry = CATEGORIES.find((c) =>
    c.match.some((m) => normalised.includes(m)),
  );
  return entry?.category ?? "Network service";
};

/** Ports worth probing on a host that already announced itself. */
const COMMON_PORTS = [80, 443, 22, 445, 548, 631, 5000, 7000, 8008, 8080, 8443];

export interface ScanProgress {
  (discovered: number, phase: "browsing" | "probing"): void;
}

/**
 * Discovers devices on the network the user is attached to.
 *
 * Returns only what was genuinely observed. The previous implementation
 * returned six hard-coded hosts with fabricated MAC addresses, latencies and
 * open ports, identical on every run and on every network.
 */
export const scanSubnetDevices = async (
  timeoutMs: number = 5000,
  onProgress?: ScanProgress,
): Promise<SubnetDevice[]> => {
  onProgress?.(0, "browsing");

  const services: DiscoveredService[] =
    await NetDiscovery.browseServices(timeoutMs);

  // Collapse the same device advertising several services into one row.
  const byName = new Map<string, DiscoveredService[]>();
  for (const service of services) {
    const existing = byName.get(service.name) ?? [];
    existing.push(service);
    byName.set(service.name, existing);
  }

  onProgress?.(byName.size, "probing");

  const devices: SubnetDevice[] = [];
  for (const [name, entries] of byName) {
    const primary = entries[0];
    const host =
      entries.find((e) => e.host)?.host ||
      entries.find((e) => e.addresses[0])?.addresses[0];

    let openPorts: number[] = [];
    let latencyMs: number | null = null;

    if (host) {
      // Probe sequentially and bounded: a parallel sweep of every port on every
      // host is indistinguishable from a port scan and trips defensive gear.
      for (const port of COMMON_PORTS) {
        const probe = await NetDiscovery.probePort(host, port, 400);
        if (probe.open) {
          openPorts.push(port);
          if (latencyMs === null) latencyMs = probe.latencyMs;
        }
      }
    }

    devices.push({
      id: `svc_${name}_${primary.type}`,
      name,
      service: entries.map((e) => e.type).join(", "),
      category: categorise(primary.type),
      openPorts,
      latencyMs,
    });
  }

  return devices.sort((a, b) => a.name.localeCompare(b.name));
};
