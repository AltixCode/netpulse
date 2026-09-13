package expo.modules.netdiscovery

import android.content.Context
import android.net.nsd.NsdManager
import android.net.nsd.NsdServiceInfo
import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.io.IOException
import java.net.InetSocketAddress
import java.net.Socket
import java.util.concurrent.ConcurrentHashMap
import kotlin.concurrent.thread

/**
 * Local-network discovery using NsdManager and plain TCP connects.
 *
 * Kept deliberately symmetrical with the iOS implementation so both platforms
 * report the same shape of genuinely observed data, rather than the invented
 * host list the app used to show.
 */
class NetDiscoveryModule : Module() {
  private companion object {
    val SERVICE_TYPES = listOf(
      "_airplay._tcp", "_raop._tcp", "_googlecast._tcp", "_spotify-connect._tcp",
      "_http._tcp", "_https._tcp", "_ipp._tcp", "_ipps._tcp", "_printer._tcp",
      "_smb._tcp", "_afpovertcp._tcp", "_ssh._tcp", "_sftp-ssh._tcp",
      "_hap._tcp", "_companion-link._tcp", "_rfb._tcp", "_workstation._tcp",
    )
  }

  override fun definition() = ModuleDefinition {
    Name("NetDiscovery")

    AsyncFunction("browseServices") { timeoutMs: Int, promise: Promise ->
      val context = appContext.reactContext
        ?: return@AsyncFunction promise.reject("ERR_DISCOVERY", "No React context.", null)

      val nsd = context.getSystemService(Context.NSD_SERVICE) as NsdManager
      val found = ConcurrentHashMap<String, Map<String, Any>>()
      val listeners = mutableListOf<NsdManager.DiscoveryListener>()

      SERVICE_TYPES.forEach { type ->
        val listener = object : NsdManager.DiscoveryListener {
          override fun onDiscoveryStarted(serviceType: String) = Unit
          override fun onDiscoveryStopped(serviceType: String) = Unit
          override fun onStartDiscoveryFailed(serviceType: String, errorCode: Int) = Unit
          override fun onStopDiscoveryFailed(serviceType: String, errorCode: Int) = Unit
          override fun onServiceLost(service: NsdServiceInfo) = Unit

          override fun onServiceFound(service: NsdServiceInfo) {
            val key = "${service.serviceName}|${service.serviceType}"
            found.putIfAbsent(
              key,
              mapOf(
                "name" to service.serviceName,
                "type" to service.serviceType.trimEnd('.'),
                // Resolution requires a second round trip per service; the JS
                // layer probes the hosts it cares about instead.
                "host" to "",
                "addresses" to emptyList<String>(),
                "port" to 0,
              )
            )
          }
        }
        listeners.add(listener)
        runCatching { nsd.discoverServices(type, NsdManager.PROTOCOL_DNS_SD, listener) }
      }

      thread {
        Thread.sleep(timeoutMs.toLong())
        listeners.forEach { runCatching { nsd.stopServiceDiscovery(it) } }
        promise.resolve(found.values.toList())
      }
    }

    AsyncFunction("probePort") { host: String, port: Int, timeoutMs: Int, promise: Promise ->
      thread {
        val started = System.nanoTime()
        var open = false
        try {
          Socket().use { socket ->
            socket.connect(InetSocketAddress(host, port), timeoutMs)
            open = socket.isConnected
          }
        } catch (_: IOException) {
          open = false
        } catch (_: IllegalArgumentException) {
          open = false
        }
        val elapsedMs = (System.nanoTime() - started) / 1_000_000.0

        promise.resolve(
          mapOf(
            "host" to host,
            "port" to port,
            "open" to open,
            "latencyMs" to if (open) elapsedMs else null,
          )
        )
      }
    }
  }
}
