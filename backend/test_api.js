const axios = require('axios');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });
dotenv.config({ path: path.join(__dirname, '.env') });

const BASE_URL = process.env.API_URL || 'http://localhost:5000/api';

async function runTests() {
  console.log("=================================================");
  console.log("⚡ RUNNING WATTWISE BACKEND INTEGRATION TEST SUITE");
  console.log("=================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName}`);
      failed++;
    }
  }

  try {
    // Test 1: Health Check
    console.log("--- 1. Health Check Test ---");
    const healthRes = await axios.get(`${BASE_URL}/health`);
    assert(healthRes.status === 200 && healthRes.data.status === 'online', "Backend /api/health responds with status online");

    // Test 2: CEB 2024 Bill Tariff Calculations
    console.log("\n--- 2. CEB Tariff Slab Engine Tests ---");
    
    // Slab 1: 25 units (0-30 slab @ Rs. 2.50 + Rs. 180 fixed)
    const bill25 = await axios.post(`${BASE_URL}/bill/calculate`, { monthlyKWh: 25 });
    assert(bill25.data.totalBillLKR === 242.50, "CEB Slab 1 (25 kWh) expected Rs. 242.50");

    // Slab 2: 50 units (30 @ 2.50 + 20 @ 4.85 + Rs. 240 fixed)
    const bill50 = await axios.post(`${BASE_URL}/bill/calculate`, { monthlyKWh: 50 });
    assert(bill50.data.totalBillLKR === 412.00, "CEB Slab 2 (50 kWh) expected Rs. 412.00");

    // Slab 3: 80 units (30 @ 2.50 + 30 @ 4.85 + 20 @ 7.85 + Rs. 360 fixed)
    const bill80 = await axios.post(`${BASE_URL}/bill/calculate`, { monthlyKWh: 80 });
    assert(bill80.data.totalBillLKR === 737.50, "CEB Slab 3 (80 kWh) expected Rs. 737.50");

    // Slab 4: 110 units (30 @ 2.50 + 30 @ 4.85 + 30 @ 7.85 + 20 @ 10.00 + Rs. 960 fixed)
    const bill110 = await axios.post(`${BASE_URL}/bill/calculate`, { monthlyKWh: 110 });
    assert(bill110.data.totalBillLKR === 1616.00, "CEB Slab 4 (110 kWh) expected Rs. 1616.00");

    // Slab 5: 150 units (30 @ 2.50 + 30 @ 4.85 + 30 @ 7.85 + 30 @ 10.00 + 30 @ 27.75 + Rs. 1500 fixed = 3088.50)
    const bill150 = await axios.post(`${BASE_URL}/bill/calculate`, { monthlyKWh: 150 });
    assert(bill150.data.totalBillLKR === 3088.50, "CEB Slab 5 (150 kWh) expected Rs. 3088.50");

    // Slab 6: 200 units (30 @ 2.50 + 30 @ 4.85 + 30 @ 7.85 + 30 @ 10.00 + 60 @ 27.75 + 20 @ 45.00 + Rs. 2000 fixed)
    const bill200 = await axios.post(`${BASE_URL}/bill/calculate`, { monthlyKWh: 200 });
    assert(bill200.data.totalBillLKR === 5321.00, "CEB Slab 6 (200 kWh) expected Rs. 5321.00");

    // Test 3: Authentication & JWT Flow
    console.log("\n--- 3. Authentication & Role Tests ---");
    
    // User login
    const userLogin = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'user@wattwise.lk',
      password: 'User@123456'
    });
    assert(userLogin.status === 200 && userLogin.data.token && userLogin.data.user.role === 'user', "Regular User login successful and returns JWT token");
    const userToken = userLogin.data.token;

    // Admin login
    const adminLogin = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@wattwise.lk',
      password: 'Admin@123456'
    });
    assert(adminLogin.status === 200 && adminLogin.data.token && adminLogin.data.user.role === 'admin', "Admin login successful and returns JWT token with admin role");
    const adminToken = adminLogin.data.token;

    // Test 4: Role Authorization Security Guard
    console.log("\n--- 4. Role Authorization Security Tests ---");
    let regularUserBlocked = false;
    try {
      await axios.get(`${BASE_URL}/admin/users`, {
        headers: { Authorization: `Bearer ${userToken}` }
      });
    } catch (err) {
      if (err.response && err.response.status === 403) {
        regularUserBlocked = true;
      }
    }
    assert(regularUserBlocked, "Regular user is correctly blocked (403 Forbidden) from accessing Admin routes");

    const adminAccess = await axios.get(`${BASE_URL}/admin/users`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert(adminAccess.status === 200 && Array.isArray(adminAccess.data.users), "Admin user successfully accesses Admin User Management");

    // Test 5: ML Prediction Engine
    console.log("\n--- 5. ML Energy Prediction Tests ---");
    const predRes = await axios.post(`${BASE_URL}/predict`, {
      indoorTemp: 23.5,
      outdoorTemp: 29.0,
      indoorHumidity: 62,
      occupants: 4,
      appliancesActive: 3,
      hour: 15,
      dayOfWeek: 'Monday'
    }, {
      headers: { Authorization: `Bearer ${userToken}` }
    });

    const pred = predRes.data.prediction;
    assert(predRes.status === 200 && pred && typeof pred.predictedWh === 'number' && pred.predictedWh > 0, "Prediction returns valid positive Wh forecast");
    assert(['Low', 'Normal', 'High', 'Very High'].includes(pred.usageCategory), `Prediction category assigned: ${pred.usageCategory}`);
    assert(typeof pred.estimatedCostLKR === 'number', `Prediction estimated LKR cost: Rs. ${pred.estimatedCostLKR}`);

    // Test 6: Tips Library
    console.log("\n--- 6. Energy Saving Tips Library Tests ---");
    const tipsRes = await axios.get(`${BASE_URL}/tips`);
    assert(tipsRes.status === 200 && tipsRes.data.tips && tipsRes.data.tips.length > 0, `Tips fetched successfully (${tipsRes.data.tips.length} tips loaded)`);

    console.log("\n=================================================");
    console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log("=================================================\n");

    if (failed > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }

  } catch (error) {
    console.error("Test Suite Execution Error:", error.response?.data || error.message);
    process.exit(1);
  }
}

runTests();
