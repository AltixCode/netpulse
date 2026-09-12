import React from 'react';
import { View, Text } from 'react-native';
import { Router, Smartphone, Laptop, Cpu, Wifi } from 'lucide-react-native';
import { SubnetDevice } from '../engine/subnetScanner';

interface DeviceItemCardProps {
  device: SubnetDevice;
}

export const DeviceItemCard: React.FC<DeviceItemCardProps> = ({ device }) => {
  const getDeviceIcon = () => {
    if (device.isGateway) return <Router size={20} color="#60A5FA" />;
    if (device.vendor.includes('Apple') || device.vendor.includes('Samsung')) {
      return <Smartphone size={20} color="#34D399" />;
    }
    if (device.vendor.includes('Raspberry') || device.vendor.includes('Espressif')) {
      return <Cpu size={20} color="#FBBF24" />;
    }
    return <Laptop size={20} color="#94A3B8" />;
  };

  return (
    <View className="bg-slate-900 border border-slate-800 p-4 rounded-2xl mb-3 flex-row items-center justify-between">
      <View className="flex-row items-center flex-1 mr-3">
        <View className="bg-slate-800 p-2.5 rounded-xl mr-3">{getDeviceIcon()}</View>

        <View className="flex-1">
          <View className="flex-row items-center">
            <Text className="text-white font-mono font-bold text-sm mr-2">{device.ip}</Text>
            {device.isGateway && (
              <View className="bg-blue-500/20 px-1.5 py-0.5 rounded">
                <Text className="text-blue-400 text-[10px] font-bold uppercase">Router</Text>
              </View>
            )}
          </View>

          <Text className="text-slate-400 text-xs font-semibold mt-0.5" numberOfLines={1}>
            {device.vendor}
          </Text>
          <Text className="text-slate-500 font-mono text-[10px] mt-0.5">MAC: {device.mac}</Text>
        </View>
      </View>

      <View className="items-end">
        <Text className="text-emerald-400 font-mono text-xs font-bold">
          {device.latencyMs} ms
        </Text>
        {device.openPorts && device.openPorts.length > 0 && (
          <Text className="text-slate-500 font-mono text-[9px] mt-0.5">
            Ports: {device.openPorts.join(', ')}
          </Text>
        )}
      </View>
    </View>
  );
};
