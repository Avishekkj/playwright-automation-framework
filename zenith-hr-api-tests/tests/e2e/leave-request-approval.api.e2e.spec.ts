// ============================================================================
// E2E [API] — Leave Request & Approval
// The OrangeHRM demo api/v2 exposes leave REFERENCE data (types, requests) but
// NOT the write workflow (employee-leave-entitlements / submit / approve -> 404).
// So: we smoke-test what's available, and keep the full workflow as a documented
// fixme (ready to run against a full OrangeHRM instance, and to drive the UI version).
// ============================================================================
import { test, expect } from '../../fixtures';
import { log } from '../../utils/logger';

const API = '/web/index.php/api/v2';

test.describe('E2E [API] — Leave Request & Approval', () => {
  test('leave reference endpoints are reachable', { tag: ['@e2e', '@smoke'] }, async ({ adminRequest }) => {
    log.step(1, 'GET leave types');
    expect((await adminRequest.get(`${API}/leave/leave-types`)).status()).toBe(200);
    log.step(2, 'GET leave requests');
    expect((await adminRequest.get(`${API}/leave/leave-requests`)).status()).toBe(200);
    log.pass('leave reference data reachable');
  });

  // Not exposed by the demo api/v2 — implement on a full instance / via the UI.
  test.fixme('full workflow: entitlement → submit → approve → balance → cancel', async () => {
    // 1. Create employee + ESS user
    // 2. Assign supervisor (where required)
    // 3. Assign leave entitlement           <-- demo api/v2 returns 404
    // 4. Authenticate as employee
    // 5. Submit leave request
    // 6. Retrieve request, verify status = Pending
    // 7. Authenticate as supervisor/Admin
    // 8. Approve leave request
    // 9. Retrieve request, verify status = Approved
    // 10. Retrieve leave balance, verify it was reduced
    // 11. Cancel leave (if supported), verify balance restored
    // 12. Cleanup
  });
});
