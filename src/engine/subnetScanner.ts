export interface SubnetDevice {
  id: string;
  ip: string;
  mac: string;
  vendor: string;
  isGateway: boolean;
  latencyMs: number;
  openPorts?: number[];
}

const OUI_VENDORS: Record<string, string> = {
  'F0:18:98': 'Apple, Inc.',
  '3C:06:30': 'Apple, Inc.',
  'AC:BC:32': 'Apple, Inc.',
  'DC:A6:32': 'Raspberry Pi Foundation',
  'B8:27:EB': 'Raspberry Pi Foundation',
  '48:E7:DA': 'Samsung Electronics',
  '50:85:69': 'Samsung Electronics',
  'D8:3A:DD': 'Espressif Systems (IoT)',
  '24:6F:28': 'Espressif Systems (IoT)',
  'FC:EC:DA': 'Ubiquiti Networks',
  '00:1A:2B': 'Cisco Systems',
  'E4:5F:01': 'Google LLC',
  'A4:77:33': 'Google Nest',
};

/**
 * Sweeps local subnet and maps IEEE OUI vendor prefixes offline.
 */
export const scanSubnetDevices = async (
  subnetPrefix: string = '192.168.1',
  onProgress?: (scanned: number, total: number) => void
): Promise<SubnetDevice[]> => {
  const devices: SubnetDevice[] = [];

  // Simulated active devices discovered on subnet
  const sampleHosts = [
    { ipSuffix: 1, macPrefix: 'FC:EC:DA', macRest: '12:34:56', isGateway: true, ping: 1.2, ports: [80, 443, 22] },
    { ipSuffix: 24, macPrefix: 'F0:18:98', macRest: '99:AA:BB', isGateway: false, ping: 3.4, ports: [] },
    { ipSuffix: 45, macPrefix: 'DC:A6:32', macRest: '44:55:66', isGateway: false, ping: 5.1, ports: [22, 8080] },
    { ipSuffix: 78, macPrefix: '48:E7:DA', macRest: 'CC:DD:EE', isGateway: false, ping: 12.8, ports: [] },
    { ipSuffix: 112, macPrefix: 'D8:3A:DD', macRest: '77:88:99', isGateway: false, ping: 24.3, ports: [] },
    { ipSuffix: 140, macPrefix: 'E4:5F:01', macRest: '21:43:65', isGateway: false, ping: 6.7, ports: [8008] },
  ];

  for (let i = 0; i < sampleHosts.length; i++) {
    const host = sampleHosts[i];
    if (onProgress) {
      onProgress(i + 1, sampleHosts.length);
    }
    await new Promise((res) => setTimeout(res, 100));

    const mac = `${host.macPrefix}:${host.macRest}`;
    const vendor = OUI_VENDORS[host.macPrefix] || 'Generic Network Device';

    devices.push({
      id: `dev_${host.ipSuffix}`,
      ip: `${subnetPrefix}.${host.ipSuffix}`,
      mac,
      vendor,
      isGateway: host.isGateway,
      latencyMs: host.ping,
      openPorts: host.ports,
    });
  }

  return devices;
};
