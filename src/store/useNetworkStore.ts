import { create } from 'zustand';
import { NetworkBenchmark } from '../engine/pingEngine';
import { SubnetDevice } from '../engine/subnetScanner';

interface NetworkState {
  benchmark: NetworkBenchmark;
  devices: SubnetDevice[];
  isScanningSubnet: boolean;
  isBenchmarking: boolean;
  isPro: boolean;
  localIp: string;
  gatewayIp: string;

  // Actions
  setBenchmark: (benchmark: NetworkBenchmark) => void;
  setDevices: (devices: SubnetDevice[]) => void;
  setIsScanningSubnet: (isScanning: boolean) => void;
  setIsBenchmarking: (isBenchmarking: boolean) => void;
  setIsPro: (isPro: boolean) => void;
  setLocalIp: (ip: string, gateway: string) => void;
  reset: () => void;
}

export const useNetworkStore = create<NetworkState>((set) => ({
  benchmark: {
    currentPing: 18,
    averagePing: 21,
    jitter: 3.2,
    packetLoss: 0,
    cloudflarePing: 16,
    googlePing: 22,
    history: [24, 22, 19, 18, 20, 25, 18, 17, 19, 21],
  },
  devices: [],
  isScanningSubnet: false,
  isBenchmarking: false,
  isPro: false,
  localIp: '192.168.1.104',
  gatewayIp: '192.168.1.1',

  setBenchmark: (benchmark) => set({ benchmark }),
  setDevices: (devices) => set({ devices }),
  setIsScanningSubnet: (isScanningSubnet) => set({ isScanningSubnet }),
  setIsBenchmarking: (isBenchmarking) => set({ isBenchmarking }),
  setIsPro: (isPro) => set({ isPro }),
  setLocalIp: (localIp, gatewayIp) => set({ localIp, gatewayIp }),
  reset: () =>
    set({
      isScanningSubnet: false,
      isBenchmarking: false,
    }),
}));
