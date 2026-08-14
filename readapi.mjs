import { readFileSync } from 'node:fs';
const p = 'c:/Users/LEVI/OneDrive/Desktop/EventConnect_Frontend/src/lib/api.ts';
const lines = readFileSync(p, 'utf8').split('\n');
function show(a, b, title) {
  console.log('\n===== ' + title + ' (' + a + '-' + b + ') =====');
  for (let i = a; i <= b; i++) {
    const l = lines[i - 1];
    if (l === undefined) break;
    console.log(i + ': ' + l);
  }
}
show(225, 345, 'apiRequest');
show(377, 470, 'getAuthUser/getCurrentUser/saveAuthUser');
show(555, 660, 'login/getAuthHeaders/saveAuthToken');
show(790, 845, 'createEvent');
