import assert from 'node:assert/strict';
import {membershipStats,ACTIVE_STATUSES} from '../lib/member-stats.ts';
const records=[...Array(8).fill({status:'유지'}),...Array(2).fill({status:'중단'}),...Array(3).fill({status:'전입'}),...Array(4).fill({status:'전출'}),{status:'신규'}];
assert.deepEqual(membershipStats(records),{kept:8,fresh:1,stopped:2,transferredIn:3,transferredOut:4,base:10,active:12,rate:80});
assert.equal(membershipStats([{status:'전입'},{status:'전출'}]).rate,null);
assert.equal(ACTIVE_STATUSES.includes('전입'),true);
assert.equal(ACTIVE_STATUSES.includes('전출'),false);
console.log('Transfer checks passed: active membership, retention exclusions, carry-forward eligibility.');
