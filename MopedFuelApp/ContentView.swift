import SwiftUI
import WebKit
import CoreLocation

struct ContentView: View {
    @StateObject private var locationManager = LocationManager()

    var body: some View {
        WebView(url: URL(string: "https://moped-tracker.vercel.app")!, locationManager: locationManager)
            .edgesIgnoringSafeArea(.all)
            .onAppear {
                locationManager.requestPermission()
            }
    }
}

// Location manager to request native permissions and get actual location
class LocationManager: NSObject, ObservableObject, CLLocationManagerDelegate {
    private let manager = CLLocationManager()
    @Published var location: CLLocation?
    var onLocationUpdate: ((CLLocation) -> Void)?

    override init() {
        super.init()
        manager.delegate = self
        manager.desiredAccuracy = kCLLocationAccuracyBest
    }

    func requestPermission() {
        manager.requestWhenInUseAuthorization()
    }

    func startUpdating() {
        manager.startUpdatingLocation()
    }

    func locationManagerDidChangeAuthorization(_ manager: CLLocationManager) {
        print("Location authorization changed: \(manager.authorizationStatus.rawValue)")
        if manager.authorizationStatus == .authorizedWhenInUse ||
           manager.authorizationStatus == .authorizedAlways {
            startUpdating()
        }
    }

    func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
        guard let location = locations.last else { return }
        self.location = location
        onLocationUpdate?(location)
        print("Location updated: \(location.coordinate.latitude), \(location.coordinate.longitude)")
    }

    func locationManager(_ manager: CLLocationManager, didFailWithError error: Error) {
        print("Location error: \(error.localizedDescription)")
    }
}

struct WebView: UIViewRepresentable {
    let url: URL
    let locationManager: LocationManager

    func makeCoordinator() -> Coordinator {
        Coordinator(self, locationManager: locationManager)
    }

    func makeUIView(context: Context) -> WKWebView {
        let configuration = WKWebViewConfiguration()
        configuration.allowsInlineMediaPlayback = true
        configuration.mediaTypesRequiringUserActionForPlayback = []

        // Enable location services for web content
        let preferences = WKWebpagePreferences()
        preferences.allowsContentJavaScript = true
        configuration.defaultWebpagePreferences = preferences

        let webView = WKWebView(frame: .zero, configuration: configuration)
        webView.scrollView.contentInsetAdjustmentBehavior = .never
        webView.uiDelegate = context.coordinator
        webView.navigationDelegate = context.coordinator

        context.coordinator.webView = webView

        return webView
    }

    func updateUIView(_ webView: WKWebView, context: Context) {
        if webView.url == nil {
            let request = URLRequest(url: url)
            webView.load(request)
        }
    }

    class Coordinator: NSObject, WKUIDelegate, WKNavigationDelegate {
        var parent: WebView
        var webView: WKWebView?
        var locationManager: LocationManager

        init(_ parent: WebView, locationManager: LocationManager) {
            self.parent = parent
            self.locationManager = locationManager
            super.init()

            // Set up location update callback
            locationManager.onLocationUpdate = { [weak self] location in
                self?.injectLocation(location)
            }
        }

        // Inject native location into web page
        func injectLocation(_ location: CLLocation) {
            let lat = location.coordinate.latitude
            let lon = location.coordinate.longitude
            let accuracy = location.horizontalAccuracy

            let script = """
            // Override navigator.geolocation with native location
            if (!navigator.geolocation.__overridden) {
                const nativeGeo = navigator.geolocation;
                navigator.geolocation.__overridden = true;

                navigator.geolocation.getCurrentPosition = function(success, error, options) {
                    success({
                        coords: {
                            latitude: \(lat),
                            longitude: \(lon),
                            accuracy: \(accuracy),
                            altitude: null,
                            altitudeAccuracy: null,
                            heading: null,
                            speed: null
                        },
                        timestamp: Date.now()
                    });
                };

                navigator.geolocation.watchPosition = function(success, error, options) {
                    success({
                        coords: {
                            latitude: \(lat),
                            longitude: \(lon),
                            accuracy: \(accuracy),
                            altitude: null,
                            altitudeAccuracy: null,
                            heading: null,
                            speed: null
                        },
                        timestamp: Date.now()
                    });
                    return 1;
                };
            }
            """

            webView?.evaluateJavaScript(script) { result, error in
                if let error = error {
                    print("Error injecting location: \(error)")
                } else {
                    print("Location injected successfully: \(lat), \(lon)")
                }
            }
        }

        // Handle geolocation permission requests
        func webView(_ webView: WKWebView,
                     requestMediaCapturePermissionFor origin: WKSecurityOrigin,
                     initiatedByFrame frame: WKFrameInfo,
                     type: WKMediaCaptureType,
                     decisionHandler: @escaping (WKPermissionDecision) -> Void) {
            decisionHandler(.grant)
        }

        // Handle JavaScript alerts
        func webView(_ webView: WKWebView,
                     runJavaScriptAlertPanelWithMessage message: String,
                     initiatedByFrame frame: WKFrameInfo,
                     completionHandler: @escaping () -> Void) {
            let alert = UIAlertController(title: nil, message: message, preferredStyle: .alert)
            alert.addAction(UIAlertAction(title: "OK", style: .default) { _ in
                completionHandler()
            })

            if let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
               let rootViewController = windowScene.windows.first?.rootViewController {
                rootViewController.present(alert, animated: true)
            }
        }

        // Handle navigation errors
        func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
            print("Navigation failed: \(error.localizedDescription)")
        }

        func webView(_ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!, withError error: Error) {
            print("Provisional navigation failed: \(error.localizedDescription)")
        }

        func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
            print("Page loaded successfully")
            // Inject location once page is loaded
            if let location = locationManager.location {
                injectLocation(location)
            }
        }
    }
}

#Preview {
    ContentView()
}
