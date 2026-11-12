const assert = require('node:assert/strict');
const { championshipStatus } = require('../championship-status.js');

const start = Date.parse('2026-11-06T00:00:00+07:00');
const end = Date.parse('2026-11-28T23:59:00+07:00');

assert.equal(championshipStatus('2026-11-06T00:00:00+07:00', '2026-11-28T23:59:00+07:00', start - 1), 'upcoming');
assert.equal(championshipStatus('2026-11-06T00:00:00+07:00', '2026-11-28T23:59:00+07:00', start), 'live');
assert.equal(championshipStatus('2026-11-06T00:00:00+07:00', '2026-11-28T23:59:00+07:00', Date.parse('2026-11-12T12:00:00-03:00')), 'live');
assert.equal(championshipStatus('2026-11-06T00:00:00+07:00', '2026-11-28T23:59:00+07:00', end), 'live');
assert.equal(championshipStatus('2026-11-06T00:00:00+07:00', '2026-11-28T23:59:00+07:00', end + 1), 'ended');
assert.equal(championshipStatus('invalid', '2026-11-28T23:59:00+07:00', start), null);
assert.equal(championshipStatus('2026-11-28T23:59:00+07:00', '2026-11-06T00:00:00+07:00', start), null);

console.log('Championship status: upcoming, live, ended and invalid date ranges passed.');
