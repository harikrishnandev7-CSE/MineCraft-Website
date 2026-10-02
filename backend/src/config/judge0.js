const dns = require('dns');
const https = require('https');

// Set fallback public DNS servers to prevent Windows local DNS drops
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  // Ignore if custom server setting is not permitted in environment
}

const httpsAgent = new https.Agent({
  keepAlive: true,
  lookup: (hostname, options, callback) => {
    const cb = typeof options === 'function' ? options : callback;
    const opts = typeof options === 'object' ? options : {};
    dns.resolve4(hostname, (err, addresses) => {
      if (err || !addresses || !addresses.length) {
        return dns.lookup(hostname, options, callback);
      }
      if (opts.all) {
        return cb(null, addresses.map((a) => ({ address: a, family: 4 })));
      }
      return cb(null, addresses[0], 4);
    });
  },
});

module.exports = {
  baseURL: process.env.JUDGE0_URL || 'https://judge0.adfuturestack.dev',
  token: process.env.JUDGE0_TOKEN,
  httpsAgent,
  headers: {
    'Content-Type': 'application/json',
    'X-Judge0-Token': process.env.JUDGE0_TOKEN,
  },
  timeoutMs: 15000,
};
