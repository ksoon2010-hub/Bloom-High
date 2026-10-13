import assert from 'node:assert/strict';
import {monthlySummary} from '../lib/monthly-summary.ts';
assert.deepEqual(monthlySummary([]),[]);
assert.deepEqual(monthlySummary([{month:'2026-01',status:'신규'},{month:'2026-01',status:'유지'},{month:'2026-01',status:'중단'},{month:'2026-02',status:'신규'},{month:'2026-02',status:'신규'},{month:'2025-12',status:'유지'}]),[{month:'2026-02',activeCount:2,keptCount:0,newCount:2,stoppedCount:0,transferredInCount:0,transferredOutCount:0},{month:'2026-01',activeCount:2,keptCount:1,newCount:1,stoppedCount:1,transferredInCount:0,transferredOutCount:0},{month:'2025-12',activeCount:1,keptCount:1,newCount:0,stoppedCount:0,transferredInCount:0,transferredOutCount:0}]);
console.log('Monthly counts passed: cross-month grouping, maintained members excluded, empty months, sorting.');

assert.deepEqual(monthlySummary([{month:'2026-02',status:'전입'},{month:'2026-02',status:'전출'},{month:'2026-02',status:'중단'}]),[{month:'2026-02',activeCount:1,keptCount:0,newCount:0,stoppedCount:1,transferredInCount:1,transferredOutCount:1}]);
