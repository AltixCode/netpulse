const {
  withInfoPlist,
  withAndroidManifest,
  createRunOncePlugin,
} = require("@expo/config-plugins");

/**
 * Declares local-network access.
 *
 * iOS 14+ gates Bonjour browsing and any connection to a local address behind a
 * user prompt. Without NSLocalNetworkUsageDescription the app is terminated the
 * moment it browses, and without NSBonjourServices the browse silently returns
 * nothing for any type not listed — a failure that looks exactly like "no
 * devices on this network".
 *
 * The list must stay in step with the service types in NetDiscoveryModule.
 */
const BONJOUR_SERVICES = [
  "_airplay._tcp",
  "_raop._tcp",
  "_googlecast._tcp",
  "_spotify-connect._tcp",
  "_http._tcp",
  "_https._tcp",
  "_ipp._tcp",
  "_ipps._tcp",
  "_printer._tcp",
  "_smb._tcp",
  "_afpovertcp._tcp",
  "_ssh._tcp",
  "_sftp-ssh._tcp",
  "_homekit._tcp",
  "_hap._tcp",
  "_companion-link._tcp",
  "_rfb._tcp",
  "_workstation._tcp",
  "_device-info._tcp",
];

const withLocalNetwork = (config, props = {}) => {
  config = withInfoPlist(config, (cfg) => {
    cfg.modResults.NSLocalNetworkUsageDescription =
      props.localNetworkPermission ||
      "NetPulse looks for devices advertising services on the network you are connected to. Nothing about your network leaves this device.";
    cfg.modResults.NSBonjourServices = BONJOUR_SERVICES;
    return cfg;
  });

  config = withAndroidManifest(config, (cfg) => {
    const manifest = cfg.modResults.manifest;
    manifest["uses-permission"] = manifest["uses-permission"] || [];

    // NsdManager needs multicast to receive mDNS responses; ACCESS_NETWORK_STATE
    // and ACCESS_WIFI_STATE let the app tell the user which network it scanned.
    const required = [
      "android.permission.INTERNET",
      "android.permission.ACCESS_NETWORK_STATE",
      "android.permission.ACCESS_WIFI_STATE",
      "android.permission.CHANGE_WIFI_MULTICAST_STATE",
    ];

    for (const name of required) {
      const present = manifest["uses-permission"].some(
        (entry) => entry.$?.["android:name"] === name,
      );
      if (!present) {
        manifest["uses-permission"].push({ $: { "android:name": name } });
      }
    }

    return cfg;
  });

  return config;
};

module.exports = createRunOncePlugin(
  withLocalNetwork,
  "with-local-network",
  "1.0.0",
);
