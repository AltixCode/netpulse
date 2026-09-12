import * as FileSystem from 'expo-file-system/legacy';
import { NetworkBenchmark } from './pingEngine';

export interface AuditReportData {
  benchmark: NetworkBenchmark;
  timestamp: string;
  localIp: string;
  gatewayIp: string;
}

export const generateCsvReport = (data: AuditReportData): string => {
  let csv = 'Timestamp,TargetHost,LatencyMs,JitterMs,PacketLossPct\n';
  const now = new Date().toISOString();

  data.benchmark.history.forEach((ping, idx) => {
    const timeOffset = new Date(Date.now() - (data.benchmark.history.length - idx) * 1000).toISOString();
    csv += `${timeOffset},1.1.1.1,${ping},${data.benchmark.jitter},${data.benchmark.packetLoss}\n`;
  });

  csv += `${now},8.8.8.8,${data.benchmark.googlePing},${data.benchmark.jitter},${data.benchmark.packetLoss}\n`;
  return csv;
};

export const generateTextSummary = (data: AuditReportData): string => {
  const { benchmark, timestamp, localIp, gatewayIp } = data;
  return `========================================
NETPULSE ISP DIAGNOSTIC AUDIT REPORT
========================================
Audit Generated: ${timestamp}
Local Subnet IP: ${localIp}
Default Gateway: ${gatewayIp}

SUMMARY METRICS:
----------------------------------------
- Average Latency: ${benchmark.averagePing} ms
- Current Latency: ${benchmark.currentPing} ms
- Jitter Variance: ${benchmark.jitter} ms
- Packet Loss:     ${benchmark.packetLoss}%
- Cloudflare DNS:  ${benchmark.cloudflarePing} ms (1.1.1.1)
- Google DNS:      ${benchmark.googlePing} ms (8.8.8.8)

STABILITY RATING:
----------------------------------------
${
  benchmark.packetLoss > 0
    ? 'CRITICAL: Packet loss detected. Severe upstream degradation.'
    : benchmark.jitter > 15
    ? 'WARNING: High jitter detected. Bufferbloat impacting live gaming/calls.'
    : 'OPTIMAL: Clean latency curve. Zero packet loss.'
}

AUDIT TRAIL SAMPLES:
----------------------------------------
${benchmark.history.map((p, i) => `Sample #${i + 1}: ${p} ms`).join('\n')}

========================================
Generated 100% On-Device by NetPulse Pro
No Cloud Telemetry. Certified Privacy.
========================================
`;
};

export const saveReportFile = async (filename: string, content: string): Promise<string> => {
  const baseCache = FileSystem.cacheDirectory || `${FileSystem.documentDirectory}cache/`;
  const exportPath = `${baseCache}${filename}`;

  await FileSystem.writeAsStringAsync(exportPath, content, {
    encoding: FileSystem.EncodingType.UTF8,
  });

  return exportPath;
};
