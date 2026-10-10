const assert=require('node:assert/strict');const {eventPeriod}=require('../event-period.js');
const start='2026-10-03',end='2026-10-11';
assert.equal(eventPeriod(start,end,Date.parse('2026-10-03T02:59:59Z')).state,'upcoming');
assert.equal(eventPeriod(start,end,Date.parse('2026-10-03T03:00:00Z')).state,'scheduled');
assert.equal(eventPeriod(start,end,Date.parse('2026-10-12T02:59:59Z')).state,'scheduled');
assert.equal(eventPeriod(start,end,Date.parse('2026-10-12T03:00:00Z')).state,'ended');
assert.equal(eventPeriod(end,start),null);assert.equal(eventPeriod('invalid',end),null);
console.log('Event periods: Brasília midnight boundaries and invalid ranges passed.');
