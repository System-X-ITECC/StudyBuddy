import test from 'node:test';
import assert from 'node:assert/strict';
import { createRateLimiter } from '../src/rate-limit.js';

test('login throttle rejects bursts and releases on the next window', () => {
  let time = 1_000;
  const limiter = createRateLimiter({max:2, windowMs:1000, now:()=>time});
  const calls = [];
  const request = { ip: '127.0.0.1' };
  const response = {
    set: (k,v)=>calls.push([k,v]),
    status: s=>({json: body=>calls.push([s,body])}),
  };
  let allowed = 0;
  limiter(request,response,()=>allowed++);
  limiter(request,response,()=>allowed++);
  limiter(request,response,()=>allowed++);
  assert.equal(allowed,2);
  assert.equal(calls.at(-1)[0],429);
  time += 1001;
  limiter(request,response,()=>allowed++);
  assert.equal(allowed,3);
});
