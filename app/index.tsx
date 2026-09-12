import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import {
  Activity,
  Sparkles,
  Wifi,
  Router,
  FileSpreadsheet,
  ArrowRight,
  RefreshCw,
  Globe,
  ShieldCheck,
} from 'lucide-react-native';
import { useNetworkStore } from '../src/store/useNetworkStore';
import { runNetworkBenchmark } from '../src/engine/pingEngine';
import { LatencyGauge } from '../src/components/LatencyGauge';

export default function HomeScreen() {
  const router = useRouter();
  const {
    benchmark,
    localIp,
    isBenchmarking,
    setBenchmark,
    setIsBenchmarking,
  } = useNetworkStore();

  const handleRunTest = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setIsBenchmarking(true);

      const result = await runNetworkBenchmark(benchmark.history);
      setBenchmark(result);

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } finally {
      setIsBenchmarking(false);
    }
  };

  return (
    <SafeAreaView edges={['bottom']} className="flex-1 bg-slate-950 px-5">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        {/* Header Hero */}
        <View className="mt-4 mb-5">
          <View className="inline-flex self-start bg-blue-500/10 border border-blue-500/30 px-3 py-1 rounded-full mb-3 flex-row items-center">
            <Sparkles size={12} color="#60A5FA" />
            <Text className="text-blue-400 text-xs font-semibold ml-1.5">
              100% Ad-Free Network Suite
            </Text>
          </View>
          <Text className="text-3xl font-extrabold text-white tracking-tight">
            Network Ping & Audit
          </Text>
          <Text className="text-slate-400 text-sm mt-1.5 leading-relaxed">
            Audit latency, measure jitter variance, and scan subnet devices without commercial ads
            or cloud tracking.
          </Text>
        </View>

        {/* Latency Gauge & Sparkline Component */}
        <LatencyGauge
          currentPing={benchmark.currentPing}
          averagePing={benchmark.averagePing}
          jitter={benchmark.jitter}
          history={benchmark.history}
        />

        {/* Retest CTA */}
        <TouchableOpacity
          onPress={handleRunTest}
          disabled={isBenchmarking}
          activeOpacity={0.85}
          className="bg-blue-600 active:bg-blue-500 py-3.5 px-4 rounded-2xl flex-row items-center justify-center shadow-lg shadow-blue-500/20 mb-5"
        >
          {isBenchmarking ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <RefreshCw size={16} color="#FFFFFF" />
              <Text className="text-white font-bold text-base ml-2">Benchmark Latency Now</Text>
            </>
          )}
        </TouchableOpacity>

        {/* DNS Comparison Grid */}
        <View className="bg-slate-900 border border-slate-800 rounded-3xl p-5 mb-5">
          <View className="flex-row items-center mb-3">
            <Globe size={18} color="#60A5FA" />
            <Text className="text-white font-bold text-sm ml-2">DNS Backbone Latency</Text>
          </View>

          <View className="flex-row space-x-3">
            <View className="flex-1 bg-slate-950 border border-slate-800 p-3.5 rounded-2xl mr-2">
              <Text className="text-slate-400 text-xs font-semibold">Cloudflare 1.1.1.1</Text>
              <Text className="text-white font-mono font-bold text-lg mt-1">
                {benchmark.cloudflarePing} ms
              </Text>
              <Text className="text-emerald-400 text-[10px] mt-0.5">Primary Resolver</Text>
            </View>

            <View className="flex-1 bg-slate-950 border border-slate-800 p-3.5 rounded-2xl ml-2">
              <Text className="text-slate-400 text-xs font-semibold">Google 8.8.8.8</Text>
              <Text className="text-white font-mono font-bold text-lg mt-1">
                {benchmark.googlePing} ms
              </Text>
              <Text className="text-slate-500 text-[10px] mt-0.5">Secondary Fallback</Text>
            </View>
          </View>
        </View>

        {/* Navigation Action Cards */}
        <View className="space-y-3 mb-5">
          {/* Subnet Scanner Card */}
          <TouchableOpacity
            onPress={() => router.push('/devices')}
            activeOpacity={0.8}
            className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex-row items-center justify-between mb-3"
          >
            <View className="flex-row items-center flex-1 mr-3">
              <View className="bg-emerald-500/15 p-3 rounded-2xl mr-3">
                <Router size={22} color="#34D399" />
              </View>
              <View className="flex-1">
                <Text className="text-white font-bold text-base">Subnet Device Inventory</Text>
                <Text className="text-slate-400 text-xs mt-0.5">
                  Scan local /24 subnet & identify vendor MAC prefixes
                </Text>
              </View>
            </View>
            <ArrowRight size={18} color="#94A3B8" />
          </TouchableOpacity>

          {/* ISP Audit Report Card */}
          <TouchableOpacity
            onPress={() => router.push('/report')}
            activeOpacity={0.8}
            className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex-row items-center justify-between"
          >
            <View className="flex-row items-center flex-1 mr-3">
              <View className="bg-amber-500/15 p-3 rounded-2xl mr-3">
                <FileSpreadsheet size={22} color="#FBBF24" />
              </View>
              <View className="flex-1">
                <Text className="text-white font-bold text-base">ISP Diagnostic Report</Text>
                <Text className="text-slate-400 text-xs mt-0.5">
                  Export timestamped CSV logs and proof of connection drops
                </Text>
              </View>
            </View>
            <ArrowRight size={18} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        {/* Architectural Guarantees */}
        <View className="space-y-3">
          <Text className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
            Audit Guarantees
          </Text>

          <View className="bg-slate-900/60 border border-slate-800/80 p-4 rounded-2xl flex-row items-start">
            <View className="bg-blue-500/10 p-2 rounded-xl mr-3">
              <ShieldCheck size={18} color="#60A5FA" />
            </View>
            <View className="flex-1">
              <Text className="text-white font-bold text-sm">Offline IEEE OUI Database</Text>
              <Text className="text-slate-400 text-xs mt-0.5 leading-relaxed">
                Manufacturer MAC lookups resolve from a pre-bundled local database. Zero telemetry
                or device signatures sent to third parties.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
