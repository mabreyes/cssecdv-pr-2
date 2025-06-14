const http = require('http');

const options = {
  hostname: '127.0.0.1',
  port: 5000,
  path: '/health',
  method: 'GET',
  timeout: 2000,
};

const request = http.request(options, response => {
  console.log(`Health check status: ${response.statusCode}`);
  if (response.statusCode === 200) {
    process.exit(0);
  } else {
    process.exit(1);
  }
});

request.on('error', error => {
  console.error('Health check failed:', error.message);
  process.exit(1);
});

request.on('timeout', () => {
  console.error('Health check timeout');
  request.destroy();
  process.exit(1);
});

request.end();
