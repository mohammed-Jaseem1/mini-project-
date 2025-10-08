// Quick test to get user IDs from API
const https = require('http');

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/gas/users',
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
};

console.log('🔍 Testing API endpoint: http://localhost:5000/api/gas/users');

const req = https.request(options, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const result = JSON.parse(data);
      console.log('\n✅ API Response:');
      console.log(JSON.stringify(result, null, 2));
      
      if (result.success && result.users) {
        console.log('\n🔧 ESP32 Configuration Options:');
        result.users.forEach((user, index) => {
          if (index < 3) { // Show first 3 users
            console.log(`${index + 1}. ${user.esp32Config}`);
          }
        });
      }
    } catch (err) {
      console.error('❌ Error parsing response:', err.message);
      console.log('Raw response:', data);
    }
  });
});

req.on('error', (err) => {
  console.error('❌ Request failed:', err.message);
  console.log('💡 Make sure the server is running on port 5000');
});

req.end();