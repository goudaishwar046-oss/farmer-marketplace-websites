#!/usr/bin/env node

import fetch from 'node:fetch';

const routes = [
  { name: 'Home', url: 'http://localhost:3000/', expectedText: 'Farmer' },
  { name: 'Auth Page', url: 'http://localhost:3000/auth', expectedText: 'role' },
  { name: 'Consumer Dashboard', url: 'http://localhost:3000/consumer', expectedText: 'Farmer' },
  { name: 'Farmer Dashboard', url: 'http://localhost:3000/farmer/dashboard', expectedText: 'Product' },
  { name: 'Delivery Dashboard', url: 'http://localhost:3000/delivery-boy', expectedText: 'Location' },
  { name: 'Dashboard Redirect', url: 'http://localhost:3000/dashboard-redirect', expectedText: 'Redirect' },
];

console.log('\n🧪 COMPREHENSIVE APPLICATION TEST SUITE\n');
console.log('=' .repeat(60));

let passedTests = 0;
let failedTests = 0;

for (const route of routes) {
  try {
    console.log(`\n📄 Testing: ${route.name}`);
    console.log(`   URL: ${route.url}`);
    
    const response = await fetch(route.url, {
      timeout: 5000,
      headers: { 'User-Agent': 'Test Bot' }
    });

    if (response.status === 200) {
      console.log(`   ✅ HTTP Status: ${response.status} OK`);
      passedTests++;
      
      const html = await response.text();
      const contentSize = html.length;
      console.log(`   ✅ Content Size: ${(contentSize / 1024).toFixed(2)} KB`);
      
      if (html.includes('DOCTYPE') || html.includes('<!doctype')) {
        console.log(`   ✅ Valid HTML structure`);
      }
    } else {
      console.log(`   ❌ HTTP Status: ${response.status}`);
      failedTests++;
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    failedTests++;
  }
}

console.log('\n' + '='.repeat(60));
console.log(`\n📊 TEST SUMMARY`);
console.log(`   ✅ Passed: ${passedTests}/${routes.length}`);
console.log(`   ❌ Failed: ${failedTests}/${routes.length}`);
console.log(`   📈 Success Rate: ${((passedTests / routes.length) * 100).toFixed(1)}%`);

if (failedTests === 0) {
  console.log('\n🎉 ALL TESTS PASSED!\n');
  process.exit(0);
} else {
  console.log('\n⚠️  SOME TESTS FAILED\n');
  process.exit(1);
}
