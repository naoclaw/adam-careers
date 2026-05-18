#!/usr/bin/env npx tsx

/**
 * Supabase Seed Script for Stress Testing
 * Creates 20 test users for load testing
 */

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://puxdqxwgwmxwuhuvahdd.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const testUsers = Array.from({ length: 20 }, (_, i) => ({
  email: `test.user.${i + 1}@adamcareers.test`,
  password: 'TestPassword123!',
  userData: {
    full_name: `Test User ${i + 1}`,
    avatar_url: null,
    created_at: new Date().toISOString()
  }
}));

async function createTestUsers() {
  console.log('Creating 20 test users...\n');

  let created = 0;
  let failed = 0;
  const results = [];

  for (const user of testUsers) {
    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: user.email,
        password: user.password,
        options: {
          data: {
            full_name: user.userData.full_name
          }
        }
      });

      if (authError) {
        console.error(`Failed to create ${user.email}: ${authError.message}`);
        failed++;
        results.push({ email: user.email, success: false, error: authError.message });
        continue;
      }

      created++;
      results.push({ email: user.email, success: true, userId: authData.user?.id });
      console.log(`✓ Created: ${user.email}`);

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 200));

    } catch (error) {
      console.error(`Error creating ${user.email}:`, error);
      failed++;
      results.push({ email: user.email, success: false, error: 'Unknown error' });
    }
  }

  console.log(`\nSummary:`);
  console.log(`Created: ${created}`);
  console.log(`Failed: ${failed}`);

  // Save results
  const fs = require('fs');
  const resultsPath = '/opt/adam-careers/tests/test-data/users.json';
  fs.writeFileSync(resultsPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    created,
    failed,
    users: results
  }, null, 2));

  console.log(`\nUser data saved to: ${resultsPath}`);
}

createTestUsers().catch(console.error);
