// ============================================================================
// E2E [API] — Timesheet Submission & Approval
// The demo api/v2 exposes some time REFERENCE data (customers) but NOT the
// timesheet workflow (employee-timesheets / project-activities -> 404). Smoke-test
// what's available; keep the workflow as a documented fixme (full instance / UI).
// ============================================================================
import { test, expect } from '../../fixtures';
import { log } from '../../utils/logger';

const API = '/web/index.php/api/v2';

test.describe('E2E [API] — Timesheet Submission & Approval', () => {
  test('time reference endpoint is reachable', { tag: ['@e2e', '@smoke'] }, async ({ adminRequest }) => {
    log.step(1, 'GET customers (time reference data)');
    expect((await adminRequest.get(`${API}/time/customers`)).status()).toBe(200);
    log.pass('time reference data reachable');
  });

  // Not exposed by the demo api/v2 — implement on a full instance / via the UI.
  test.fixme('create timesheet → add entries → submit → approve → edit-after-approval', async () => {
    // 1. Create employee + user
    // 2. Create project / activity (if required)   <-- demo api/v2 returns 404
    // 3. Create timesheet
    // 4. Add timesheet entries
    // 5. Submit timesheet, verify status = Submitted
    // 6. Authenticate as supervisor
    // 7. Approve timesheet, verify status = Approved
    // 8. Attempt to edit after approval
    // 9. Validate expected behaviour (edit blocked / re-open flow)
    // 10. Cleanup
  });
});
