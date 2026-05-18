#!/usr/bin/env node

/**
 * Adam Careers Production Stress Test
 * Tests 20 concurrent users across all critical endpoints
 */

import autocannon from 'autocannon';
import fs from 'fs';
import path from 'path';

const RESULTS_DIR = path.join(__dirname, 'results');
const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';

// Ensure results directory exists
if (!fs.existsSync(RESULTS_DIR)) {
  fs.mkdirSync(RESULTS_DIR, { recursive: true });
}

// Test scenarios
const scenarios = [
  {
    name: 'public-pages',
    title: 'Public Pages (No Auth)',
    connections: 50,
    duration: 60,
    amount: 3000,
    requests: [
      { method: 'GET', path: '/' },
      { method: 'GET', path: '/pricing' },
      { method: 'GET', path: '/legal/privacy' },
      { method: 'GET', path: '/legal/terms' },
      { method: 'GET', path: '/robots.txt' },
      { method: 'GET', path: '/sitemap.xml' }
    ]
  },
  {
    name: 'baseline',
    title: 'Baseline Test (5 concurrent)',
    connections: 5,
    duration: 300,
    amount: 1500,
    requests: [
      { method: 'GET', path: '/' },
      { method: 'GET', path: '/dashboard' },
      { method: 'GET', path: '/pricing' },
      { method: 'GET', path: '/dashboard/jobs' },
      { method: 'GET', path: '/dashboard/chat' }
    ]
  },
  {
    name: 'target-20-users',
    title: 'Target Test (20 concurrent)',
    connections: 20,
    duration: 600,
    amount: 12000,
    requests: [
      { method: 'GET', path: '/' },
      { method: 'GET', path: '/dashboard' },
      { method: 'GET', path: '/dashboard/jobs' },
      { method: 'GET', path: '/dashboard/chat' },
      { method: 'GET', path: '/dashboard/documents' },
      { method: 'GET', path: '/dashboard/profile' }
    ]
  },
  {
    name: 'spike-50-users',
    title: 'Spike Test (50 concurrent)',
    connections: 50,
    duration: 120,
    amount: 10000,
    requests: [
      { method: 'GET', path: '/' },
      { method: 'GET', path: '/dashboard' },
      { method: 'GET', path: '/pricing' },
      { method: 'GET', path: '/login' },
      { method: 'GET', path: '/signup' }
    ]
  },
  {
    name: 'sustained-20-users',
    title: 'Sustained Load (20 users, 30 min)',
    connections: 20,
    duration: 1800,
    amount: 36000,
    requests: [
      { method: 'GET', path: '/' },
      { method: 'GET', path: '/dashboard' },
      { method: 'GET', path: '/dashboard/chat' },
      { method: 'GET', path: '/dashboard/jobs' }
    ]
  }
];

function runScenario(scenario) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Running: ${scenario.title}`);
  console.log(`URL: ${BASE_URL}`);
  console.log(`Connections: ${scenario.connections}`);
  console.log(`Duration: ${scenario.duration}s`);
  console.log(`Target Requests: ${scenario.amount}`);
  console.log(`${'='.repeat(60)}\n`);

  return new Promise((resolve) => {
    const instance = autocannon({
      url: BASE_URL,
      connections: scenario.connections,
      duration: scenario.duration,
      amount: scenario.amount,
      title: scenario.title,
      pipelining: 1,
      headers: {
        'User-Agent': 'Autocannon-AdamCareers-StressTest/1.0'
      },
      requests: scenario.requests
    }, (err, result) => {
      if (err) {
        console.error(`Error in ${scenario.name}:`, err);
        resolve({ name: scenario.name, error: err });
        return;
      }

      const summary = {
        scenario: scenario.name,
        timestamp: new Date().toISOString(),
        config: {
          connections: scenario.connections,
          duration: scenario.duration,
          targetRequests: scenario.amount
        },
        metrics: {
          requests: {
            total: result.requests.total,
            mean: result.requests.mean,
            stddev: result.requests.stddev,
            min: result.requests.min,
            max: result.requests.max,
            percentiles: result.requests.percents
          },
          latency: {
            mean: result.latency?.mean,
            stddev: result.latency?.stddev,
            min: result.latency?.min,
            max: result.latency?.max,
            p50: result.latency?.p50,
            p75: result.latency?.p75,
            p90: result.latency?.p90,
            p95: result.latency?.p95,
            p99: result.latency?.p99,
            p999: result.latency?.p999
          },
          throughput: {
            mean: result.throughput.mean,
            stddev: result.throughput.stddev,
            min: result.throughput.min,
            max: result.throughput.max
          },
          errors: result.errors,
          timeouts: result.timeouts,
          misses: result.misses,
          resets: result.resets,
          non2: result.non2xx,
          success: result.success,
          failure: result.failures
        }
      };

      // Save detailed results
      const resultFile = path.join(RESULTS_DIR, `${scenario.name}-detailed.json`);
      fs.writeFileSync(resultFile, JSON.stringify(result, null, 2));

      // Save summary
      const summaryFile = path.join(RESULTS_DIR, `${scenario.name}-summary.json`);
      fs.writeFileSync(summaryFile, JSON.stringify(summary, null, 2));

      console.log(`\n${'-'.repeat(60)}`);
      console.log(`Results for: ${scenario.title}`);
      console.log(`${'-'.repeat(60)}`);
      console.log(`Requests: ${result.requests.total} (target: ${scenario.amount})`);
      console.log(`Throughput: ${(result.throughput?.mean || 0).toFixed(2)} req/sec`);
      console.log(`Latency: p50=${(result.latency?.p50 || 0).toFixed(2)}ms, p95=${(result.latency?.p95 || 0).toFixed(2)}ms, p99=${(result.latency?.p99 || 0).toFixed(2)}ms`);
      console.log(`Errors: ${result.errors} (${((result.errors / result.requests.total) * 100).toFixed(2)}%)`);
      console.log(`Timeouts: ${result.timeouts}`);
      console.log(`2xx Success: ${result.success} (${((result.success / result.requests.total) * 100).toFixed(2)}%)`);
      console.log(`Non-2xx: ${result.non2xx}`);

      resolve(summary);
    });

    // Progress updates
    instance.on('tick', () => {
      // Optional: print progress every 10 seconds
    });

    instance.on('done', () => {
      console.log(`\nScenario ${scenario.name} completed.\n`);
    });
  });
}

// Main execution
async function runAllScenarios() {
  const results = [];

  for (const scenario of scenarios) {
    const result = await runScenario(scenario);
    results.push(result);

    // Small delay between scenarios
    await new Promise(resolve => setTimeout(resolve, 3000));
  }

  // Generate final report
  const report = {
    timestamp: new Date().toISOString(),
    baseUrl: BASE_URL,
    results: results
  };

  const reportFile = path.join(RESULTS_DIR, 'final-report.json');
  fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));

  console.log(`\n${'='.repeat(60)}`);
  console.log('All scenarios completed!');
  console.log(`Results saved to: ${RESULTS_DIR}`);
  console.log(`${'='.repeat(60)}\n`);

  // Print summary table
  console.log('\nSummary:');
  console.log('| Scenario | Total Requests | Throughput | p95 Latency | Error Rate |');
  console.log('|----------|----------------|------------|-------------|------------|');
  for (const r of results) {
    if (r.error) {
      console.log(`| ${r.scenario} | ERROR | - | - | 100% |`);
      continue;
    }
    const metrics = r.metrics;
    const throughput = metrics.throughput.mean.toFixed(2);
    const p95 = metrics.latency.p95.toFixed(0);
    const errorRate = ((metrics.errors / metrics.requests.total) * 100).toFixed(2);
    console.log(`| ${r.scenario} | ${metrics.requests.total} | ${throughput} | ${p95}ms | ${errorRate}% |`);
  }
}

// CLI args
const args = process.argv.slice(2);
const scenarioName = args[0];

if (scenarioName) {
  // Run specific scenario
  const scenario = scenarios.find(s => s.name === scenarioName);
  if (scenario) {
    runScenario(scenario);
  } else {
    console.error(`Scenario not found: ${scenarioName}`);
    console.error('Available scenarios:', scenarios.map(s => s.name).join(', '));
    process.exit(1);
  }
} else {
  // Run all scenarios
  runAllScenarios().catch(console.error);
}
