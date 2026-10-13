import assert from 'node:assert/strict';
import {resolveIdentity} from '../app/auth-identity.ts';
assert.deepEqual(resolveIdentity(null,'MEMBER@EXAMPLE.COM'),{userId:'email:member@example.com',email:'member@example.com'});
assert.deepEqual(resolveIdentity('site-user','member@example.com'),{userId:'site-user',email:'member@example.com'});
assert.equal(resolveIdentity(null,null),null);
assert.equal(resolveIdentity(null,'  '),null);
assert.equal(resolveIdentity('site-user',null),null);
console.log('Authentication regression checks passed (email-only, ID+email, anonymous).');
