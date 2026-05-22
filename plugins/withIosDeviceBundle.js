const { withAppDelegate, withInfoPlist } = require('@expo/config-plugins');

const METRO_HOST_BLOCK = `  private func configurePackagerForPhysicalDevice() {
#if DEBUG && !targetEnvironment(simulator)
    if let host = Bundle.main.object(forInfoDictionaryKey: "MetroBundlerHost") as? String,
       !host.isEmpty,
       host != "localhost" {
      RCTBundleURLProvider.sharedSettings().jsLocation = host
    }
#endif
  }

  override func bundleURL() -> URL? {
#if DEBUG
    configurePackagerForPhysicalDevice()
    return RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: ".expo/.virtual-metro-entry")
#else
    return Bundle.main.url(forResource: "main", withExtension: "jsbundle")
#endif
  }`;

function replaceBundleURLBlock(swift) {
  const patterns = [
    /override func bundleURL\(\) -> URL\? \{[\s\S]*?\n  \}/,
  ];

  for (const pattern of patterns) {
    if (pattern.test(swift)) {
      return swift.replace(pattern, METRO_HOST_BLOCK.trim());
    }
  }

  return swift;
}

function withIosDeviceBundle(config) {
  config = withInfoPlist(config, (config) => {
    config.modResults.MetroBundlerHost = 'localhost';
    return config;
  });

  return withAppDelegate(config, (config) => {
    if (config.modResults.language !== 'swift') {
      return config;
    }

    config.modResults.contents = replaceBundleURLBlock(config.modResults.contents);
    return config;
  });
}

module.exports = withIosDeviceBundle;
