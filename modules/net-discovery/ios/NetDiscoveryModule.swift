import ExpoModulesCore
import Network

/// Local-network discovery using Network.framework.
///
/// iOS does not permit raw ICMP or ARP without a special entitlement, so the
/// LAN sweep this app used to claim is not achievable on a stock device. The
/// previous implementation returned six hard-coded hosts with invented MAC
/// addresses, latencies and open ports. Bonjour browsing and TCP connect probes
/// are what the platform genuinely offers, and they report only what is real.
public class NetDiscoveryModule: Module {
  /// Service types worth browsing on a home or office network. Bonjour has no
  /// "list everything" query, so discovery is necessarily a known-types sweep.
  private static let serviceTypes = [
    "_airplay._tcp", "_raop._tcp", "_googlecast._tcp", "_spotify-connect._tcp",
    "_http._tcp", "_https._tcp", "_ipp._tcp", "_ipps._tcp", "_printer._tcp",
    "_smb._tcp", "_afpovertcp._tcp", "_ssh._tcp", "_sftp-ssh._tcp",
    "_homekit._tcp", "_hap._tcp", "_companion-link._tcp", "_rfb._tcp",
    "_workstation._tcp", "_device-info._tcp",
  ]

  public func definition() -> ModuleDefinition {
    Name("NetDiscovery")

    AsyncFunction("browseServices") { (timeoutMs: Int, promise: Promise) in
      let collector = ServiceCollector()
      let group = DispatchGroup()

      for type in Self.serviceTypes {
        group.enter()
        let browser = NWBrowser(
          for: .bonjour(type: type, domain: nil),
          using: NWParameters()
        )

        browser.browseResultsChangedHandler = { results, _ in
          for result in results {
            guard case let .service(name, serviceType, domain, _) = result.endpoint else { continue }
            collector.add(name: name, type: serviceType, domain: domain)
          }
        }

        browser.start(queue: .global(qos: .userInitiated))

        DispatchQueue.global().asyncAfter(deadline: .now() + .milliseconds(timeoutMs)) {
          browser.cancel()
          group.leave()
        }
      }

      group.notify(queue: .global()) {
        promise.resolve(collector.snapshot())
      }
    }

    AsyncFunction("probePort") {
      (host: String, port: Int, timeoutMs: Int, promise: Promise) in
      guard let nwPort = NWEndpoint.Port(rawValue: UInt16(truncatingIfNeeded: port)) else {
        promise.reject("ERR_PROBE", "Port \(port) is out of range.")
        return
      }

      let connection = NWConnection(
        host: NWEndpoint.Host(host),
        port: nwPort,
        using: .tcp
      )
      let started = DispatchTime.now()
      // Guards against resolving twice: the state handler and the timeout can
      // both fire, and a Promise may only be settled once.
      let settled = Settled()

      func finish(open: Bool) {
        guard settled.claim() else { return }
        let elapsed = Double(DispatchTime.now().uptimeNanoseconds - started.uptimeNanoseconds) / 1_000_000
        connection.cancel()
        promise.resolve([
          "host": host,
          "port": port,
          "open": open,
          "latencyMs": open ? elapsed : nil,
        ] as [String: Any?])
      }

      connection.stateUpdateHandler = { state in
        switch state {
        case .ready: finish(open: true)
        case .failed, .cancelled: finish(open: false)
        default: break
        }
      }

      connection.start(queue: .global(qos: .userInitiated))
      DispatchQueue.global().asyncAfter(deadline: .now() + .milliseconds(timeoutMs)) {
        finish(open: false)
      }
    }
  }
}

/// Thread-safe set of discovered services; browse handlers fire concurrently
/// across one browser per service type.
private final class ServiceCollector {
  private var services: [String: [String: Any]] = [:]
  private let lock = NSLock()

  func add(name: String, type: String, domain: String) {
    lock.lock()
    defer { lock.unlock() }
    let key = "\(name)|\(type)"
    guard services[key] == nil else { return }
    services[key] = [
      "name": name,
      "type": type,
      // Endpoint resolution needs a live connection; the JS layer probes the
      // hosts it cares about rather than resolving every advertisement here.
      "host": "",
      "addresses": [String](),
      "port": 0,
    ]
  }

  func snapshot() -> [[String: Any]] {
    lock.lock()
    defer { lock.unlock() }
    return Array(services.values)
  }
}

private final class Settled {
  private var done = false
  private let lock = NSLock()

  func claim() -> Bool {
    lock.lock()
    defer { lock.unlock() }
    if done { return false }
    done = true
    return true
  }
}
