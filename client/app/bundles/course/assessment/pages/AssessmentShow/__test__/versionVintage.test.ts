import { formatVintagePair } from '../versionVintage';

// Tests run under TZ=Asia/Singapore, so a UTC instant renders +8h.
describe('formatVintagePair', () => {
  it('renders dates only when the two vintages fall on different days', () => {
    expect(
      formatVintagePair('2026-06-12T00:00:00Z', '2026-07-24T00:00:00Z'),
    ).toEqual({ adopted: '12 Jun 2026', latest: '24 Jul 2026' });
  });

  // A listing republished twice in one day would otherwise render "updated on 24 Jul 2026, your
  // copy is from 24 Jul 2026" — self-contradicting, and the adopter cannot resolve it.
  it('escalates BOTH vintages to include the time when they share a calendar day', () => {
    expect(
      formatVintagePair('2026-07-24T01:00:00Z', '2026-07-24T07:04:00Z'),
    ).toEqual({ adopted: '24 Jul 2026, 9:00am', latest: '24 Jul 2026, 3:04pm' });
  });

  // Same calendar day is judged in the VIEWER's zone, which is what they read on screen. These two
  // instants are different UTC days but the same Singapore day.
  it('judges the shared day in the viewer timezone, not UTC', () => {
    expect(
      formatVintagePair('2026-07-23T17:00:00Z', '2026-07-24T02:00:00Z'),
    ).toEqual({ adopted: '24 Jul 2026, 1:00am', latest: '24 Jul 2026, 10:00am' });
  });

  it('escalates when the two vintages are the identical instant', () => {
    expect(
      formatVintagePair('2026-07-24T07:04:00Z', '2026-07-24T07:04:00Z'),
    ).toEqual({ adopted: '24 Jul 2026, 3:04pm', latest: '24 Jul 2026, 3:04pm' });
  });
});
