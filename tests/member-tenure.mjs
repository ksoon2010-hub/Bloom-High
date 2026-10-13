import assert from 'node:assert/strict';
import {memberTenures} from '../lib/member-tenure.ts';
const r=(id,month,status='유지',tenureOverride=null,memberId='a')=>({id,month,status,tenureOverride,memberId});
const input=[r('old','2026-09','신규'),r('oldnext','2026-10'),r('manual','2026-11','유지',12),r('next','2026-12'),r('stop','2027-01','중단'),r('restart','2027-02','신규'),r('restartnext','2027-03'),r('oct','2026-10','신규',null,'b'),r('nov','2026-11','유지',null,'b'),r('gap','2027-01','유지',null,'b'),r('override','2027-02','신규',6,'b'),r('overrideNext','2027-03','유지',null,'b'),r('transfer','2026-10','전입',null,'c'),r('transManual','2026-11','전입',8,'c'),r('transNext','2026-12','유지',null,'c')];
assert.deepEqual([...memberTenures(input)].map(([id,n])=>[id,n]),[['old',null],['oldnext',null],['manual',12],['next',13],['stop',13],['restart',1],['restartnext',2],['oct',1],['nov',2],['gap',null],['override',6],['overrideNext',7],['transfer',null],['transManual',8],['transNext',9]]);
assert.deepEqual([...memberTenures([])],[]);
assert.equal(memberTenures([r('year','2026-12','신규'),r('yearnext','2027-01')]).get('yearnext'),2);
assert.equal(memberTenures([r('zero','2026-10','유지',0),r('zeroNext','2026-11')]).get('zeroNext'),1);
console.log('Tenure passed: October start, manual precedence, carry, gaps, stop/rejoin, transfers, year boundary, namesake IDs.');
