const https = require('https');
const base = 'https://horizon-circle.onrender.com';
const paths = [
  '/api/user','/api/users','/api/profile','/api/auth/user','/api/auth/profile','/user','/users','/profile',
  '/api/user/avatar','/api/avatar','/api/uploads/avatar','/api/profile/avatar','/api/upload/avatar','/api/users/avatar',
  '/api/auth/avatar','/api/avatar/upload','/api/v1/user','/api/v1/users','/api/v1/profile',
];
const methods = ['GET','POST','PUT'];
function probe(path, method) {
  return new Promise((resolve) => {
    const url = new URL(path, base);
    const opts = { method, headers: { 'User-Agent': 'Node', 'Content-Type': 'application/json' } };
    const req = https.request(url, opts, (res) => {
      let data = '';
      res.on('data', (c) => (data += c.toString()));
      res.on('end', () => resolve({ path, method, status: res.statusCode, body: data.slice(0, 300) }));
    });
    req.on('error', (e) => resolve({ path, method, error: e.message }));
    if (method === 'POST' || method === 'PUT') { req.write(JSON.stringify({})); }
    req.end();
  });
}
(async () => {
  for (const path of paths) {
    for (const method of methods) {
      const out = await probe(path, method);
      process.stdout.write(`${method} ${path} -> ${out.status ?? out.error}\n`);
      if (out.body) process.stdout.write(out.body.replace(/\n/g, ' ') + '\n');
      process.stdout.write('---\n');
    }
  }
})();
