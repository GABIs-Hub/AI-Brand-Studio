import { describe, expect, it } from 'vitest';
import { prepareBrandForPersistence } from './brandPayload';

describe('prepareBrandForPersistence', () => {
  it('repairs a valid brand and derives ownership from the session', () => {
    const brand = prepareBrandForPersistence(
      {
        id: 'brand-1',
        brandName: 'Acme',
        userId: 'attacker',
        palette: [{ hex: '#123456', role: 'not-a-role' }, { name: 'missing hex' }],
      },
      'brand-1',
      'session-user'
    );

    expect(brand).toMatchObject({
      id: 'brand-1',
      brandName: 'Acme',
      userId: 'session-user',
      palette: [{ hex: '#123456', role: 'Primary' }],
    });
  });

  it('rejects malformed documents and route/body id mismatches', () => {
    expect(prepareBrandForPersistence({ id: 'brand-1' }, 'brand-1', 'user-1')).toBeNull();
    expect(
      prepareBrandForPersistence({ id: 'brand-2', brandName: 'Acme' }, 'brand-1', 'user-1')
    ).toBeNull();
  });
});
