import { canContain, isAllowedAtTopLevel, ALLOWED_CHILDREN } from './containmentRules';

// PUBLIC_INTERFACE
describe('containmentRules', () => {
  test('site allows building', () => {
    expect(ALLOWED_CHILDREN.site).toContain('building');
    expect(canContain('site', 'building')).toBe(true);
  });

  test('top-level only allows site', () => {
    expect(isAllowedAtTopLevel('site')).toBe(true);
    expect(isAllowedAtTopLevel('building')).toBe(false);
    expect(isAllowedAtTopLevel('room')).toBe(false);
  });

  test('normalization allows mixed case', () => {
    expect(canContain('Site'.toLowerCase(), 'Building'.toLowerCase())).toBe(true);
    // simulate accidental caps in UI payload
    expect(canContain('site', 'BUILDING'.toLowerCase())).toBe(true);
  });
});
