/**
 * Simple concurrency simulation test for Judge0 submissions
 */
const axios = require('axios');

async function runLoadSimulation(concurrency = 10) {
  console.log(`Starting load test with ${concurrency} concurrent requests...`);
  const promises = [];

  for (let i = 0; i < concurrency; i++) {
    promises.push(
      axios.get('http://localhost:5000/health').then((res) => ({ status: res.status, id: i }))
    );
  }

  const results = await Promise.allSettled(promises);
  const passed = results.filter((r) => r.status === 'fulfilled');
  console.log(`Completed ${passed.length}/${concurrency} requests successfully.`);
}

if (require.main === module) {
  runLoadSimulation(10);
}

module.exports = runLoadSimulation;
