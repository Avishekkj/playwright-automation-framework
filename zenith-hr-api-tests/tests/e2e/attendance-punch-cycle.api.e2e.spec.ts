// ============================================================================
// E2E [API] — Attendance Punch Cycle
// The demo api/v2 exposes attendance RECORDS (GET) but NOT punch in/out writes
// (time/punches -> 404). Smoke-test what's available; keep the punch cycle as a
// documented fixme (ready for a full instance / the UI version).
// ============================================================================
import { test, expect } from '../../fixtures';
import { log } from '../../utils/logger';

const API = '/web/index.php/api/v2';

test.describe('E2E [API] — Attendance Punch Cycle', () => {
  test('attendance records endpoint is reachable', { tag: ['@e2e', '@smoke'] }, async ({ adminRequest }) => {
    log.step(1, 'GET attendance records');
    expect((await adminRequest.get(`${API}/attendance/records`)).status()).toBe(200);
    log.pass('attendance records reachable');
  });

  // Not exposed by the demo api/v2 — implement on a full instance / via the UI.
  test.fixme('punch in → verify → punch out → verify duration → admin summary', async () => {
    // 1. Create employee + user
    // 2. Authenticate as employee
    // 3. Punch in (create attendance record)   <-- demo api/v2 returns 404
    // 4. Retrieve active record, verify punch-in time
    // 5. Punch out (update record)
    // 6. Retrieve completed record, verify punch-out time
    // 7. Verify calculated duration
    // 8. Authenticate as Admin
    // 9. Retrieve employee attendance summary
    // 10. Cleanup records + employee
  });
});
