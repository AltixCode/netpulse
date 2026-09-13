import { create } from 'zustand';
import { NetworkBenchmark } from '../engine/pingEngine';
import { SubnetDevice } from '../engine/subnetScanner';

interface NetworkState {
  benchmark: NetworkBenchmark;
  devices: SubnetDevice[];
  isScanningSubnet: boolean;
  isBenchmarking: boolean;
  isPro: boolean;
  localIp: string | null;
  gatewayIp: string | null;

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
    // Nothing has been measured yet, so nothing is claimed.
    currentPing: null,
    averagePing: null,
    jitter: null,
    packetLoss: 0,
    samplesSent: 0,
    samplesReceived: 0,
    cloudflarePing: null,
    googlePing: null,
    history: [],
  },
  devices: [],
  isScanningSubnet: false,
  isBenchmarking: false,
  isPro: false,
  localIp: null,
  gatewayIp: null,

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
