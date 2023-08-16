module.exports = function override(config, env) {
  //do stuff with the webpack config...
  let loaders = config.resolve;
  loaders.fallback = {
    fs: false,
    tls: false,
    net: false,
    http: require.resolve("stream-http"),
    stream: require.resolve("stream-browserify"),
    https: false,
    crypto: require.resolve("crypto-browserify"),
    url: require.resolve("url/"),
  };

  return config;
};
