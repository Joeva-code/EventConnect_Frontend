const https = require('https');
const url = 'https://horizon-circle.onrender.com/';
const req = https.get(url, { timeout: 15000, headers: { 'User-Agent': 'Node' } }, (res) => {
  console.log('STATUS', res.statusCode);
  console.log('HEADERS', JSON.stringify(res.headers, null, 2));
  let body = '';
  res.on('data', (c) => (body += c.toString()));
  res.on('end', () => {
    console.log('BODY_SNIPPET');
    console.log(body.slice(0, 1200).replace(/\n/g, ' '));
  });
});
req.on('error', (e) => console.log('ERROR', e.message));
req.on('timeout', () => { req.destroy(); console.log('ERROR timeout'); });
