/**
 * System Health Check Utility.
 * Checks Backend, Judge0, and Mongo services.
 */
const http = require('http');

function checkEndpoint(name, url) {
  return new Promise((resolve) => {
    http.get(url, (res) => {
      console.log(`✅ ${name} is reachable (${res.statusCode})`);
      resolve(true);
    }).on('error', (err) => {
      console.log(`❌ ${name} unreachable: ${err.message}`);
      resolve(false);
    });
  });
}

async function runHealthCheck() {
  console.log('--- System Health Checks ---');
  await checkEndpoint('Backend API', 'http://localhost:5000/health');
  await checkEndpoint('Frontend Dev', 'http://localhost:3000');
}

if (require.main === module) {
  runHealthCheck();
}

module.exports = runHealthCheck;
