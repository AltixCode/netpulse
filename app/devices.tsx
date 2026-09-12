import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import {
  Router,
  RefreshCw,
  Search,
  ShieldCheck,
  Lock,
  Crown,
  Wifi,
  Sparkles,
  Info,
} from 'lucide-react-native';
import { useNetworkStore } from '../src/store/useNetworkStore';
import { scanSubnetDevices } from '../src/engine/subnetScanner';
import { DeviceItemCard } from '../src/components/DeviceItemCard';
import { PaywallModal } from '../src/components/PaywallModal';
import { t } from '../src/i18n';

export default function DevicesScreen() {
  const router = useRouter();
  const {
    devices,
    setDevices,
    isScanningSubnet,
    setIsScanningSubnet,
    isPro,
    localIp,
    gatewayIp,
  } = useNetworkStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [scanProgress, setScanProgress] = useState<{ current: number; total: number } | null>(null);
  const [showPaywall, setShowPaywall] = useState(false);

  const handleStartScan = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setIsScanningSubnet(true);
      setScanProgress({ current: 0, total: 6 });

      const subnetPrefix = localIp.split('.').slice(0, 3).join('.');
      const scannedDevices = await scanSubnetDevices(subnetPrefix, (current, total) => {
        setScanProgress({ current, total });
      });

      setDevices(scannedDevices);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsScanningSubnet(false);
      setScanProgress(null);
    }
  };

  const filteredDevices = devices.filter((d) => {
    const q = searchQuery.toLowerCase();
    return (
      d.ip.toLowerCase().includes(q) ||
      d.vendor.toLowerCase().includes(q) ||
      d.mac.toLowerCase().includes(q)
    );
  });

  return (
    <SafeAreaView edges={['bottom']} className="flex-1 bg-slate-950 px-5">
      {/* Subnet Info Header */}
      <View className="bg-slate-900 border border-slate-800 rounded-3xl p-5 mt-3 mb-4">
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center">
            <View className="bg-emerald-500/20 p-2 rounded-xl mr-2.5">
              <Wifi size={18} color="#34D399" />
            </View>
            <View>
              <Text className="text-white font-bold text-base">{t('localSubnetRange')}</Text>
              <Text className="text-slate-400 font-mono text-xs">
                {localIp.split('.').slice(0, 3).join('.')}.0/24
              </Text>
            </View>
          </View>

          <View className="items-end">
            <Text className="text-slate-400 text-xs font-semibold">{t('gateway')}</Text>
            <Text className="text-emerald-400 font-mono font-bold text-xs">{gatewayIp}</Text>
          </View>
        </View>

        {/* Scan Button */}
        <TouchableOpacity
          onPress={handleStartScan}
          disabled={isScanningSubnet}
          activeOpacity={0.85}
          className="bg-emerald-600 active:bg-emerald-500 py-3.5 px-4 rounded-2xl flex-row items-center justify-center shadow-lg shadow-emerald-500/20"
        >
          {isScanningSubnet ? (
            <View className="flex-row items-center">
              <ActivityIndicator size="small" color="#FFFFFF" />
              <Text className="text-white font-bold text-sm ml-2">
                {t('sweepingSubnet', {
                  current: scanProgress ? scanProgress.current : 0,
                  total: scanProgress ? scanProgress.total : 6,
                })}
              </Text>
            </View>
          ) : (
            <>
              <RefreshCw size={16} color="#FFFFFF" />
              <Text className="text-white font-bold text-base ml-2">
                {devices.length > 0 ? t('rescanDevices') : t('startArpSweep')}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Pro Port Scanner Banner */}
      {!isPro && (
        <TouchableOpacity
          onPress={() => setShowPaywall(true)}
          activeOpacity={0.85}
          className="bg-gradient-to-r from-amber-500/10 to-blue-500/10 border border-amber-500/30 p-3.5 rounded-2xl mb-4 flex-row items-center justify-between"
        >
          <View className="flex-row items-center flex-1 mr-2">
            <Crown size={18} color="#F59E0B" />
            <View className="ml-2.5 flex-1">
              <Text className="text-white font-bold text-xs">{t('portScannerLocked')}</Text>
              <Text className="text-slate-400 text-[11px] mt-0.5">
                {t('portScannerDesc')}
              </Text>
            </View>
          </View>
          <View className="bg-amber-500/20 px-2.5 py-1 rounded-full">
            <Text className="text-amber-400 font-bold text-xs">{t('unlock')}</Text>
          </View>
        </TouchableOpacity>
      )}

      {/* Search Filter Bar (if devices exist) */}
      {devices.length > 0 && (
        <View className="bg-slate-900 border border-slate-800 rounded-2xl px-3.5 py-2 mb-4 flex-row items-center">
          <Search size={16} color="#64748B" />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder={t('searchPlaceholder')}
            placeholderTextColor="#64748B"
            className="flex-1 text-white text-sm ml-2.5 py-1"
          />
        </View>
      )}

      {/* Device List */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        {devices.length === 0 && !isScanningSubnet ? (
          <View className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-8 items-center justify-center my-6">
            <View className="bg-slate-800 p-4 rounded-3xl mb-4">
              <Router size={36} color="#60A5FA" />
            </View>
            <Text className="text-white font-bold text-lg text-center">{t('noDevicesScanned')}</Text>
            <Text className="text-slate-400 text-xs text-center mt-2 leading-relaxed max-w-xs">
              {t('noDevicesDesc')}
            </Text>
          </View>
        ) : (
          <>
            <View className="flex-row items-center justify-between mb-3 px-1">
              <Text className="text-slate-400 text-xs font-bold uppercase tracking-wider">
                {t('discoveredHosts', { count: filteredDevices.length })}
              </Text>
              <Text className="text-slate-500 text-xs">{t('ouiResolved')}</Text>
            </View>

            {filteredDevices.map((device) => (
              <DeviceItemCard key={device.id} device={device} />
            ))}
          </>
        )}
      </ScrollView>

      {/* Paywall Modal */}
      <PaywallModal visible={showPaywall} onClose={() => setShowPaywall(false)} />
    </SafeAreaView>
  );
}
