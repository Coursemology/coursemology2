import moment, { formatLongDate, formatLongDateTime } from 'lib/moment';

/**
 * Formats an adopted vintage and the served vintage AS A PAIR.
 *
 * A version is identified by when it was published, and adopters read that as a date — a time is
 * false precision for a concept this coarse. But a listing republished twice in one day would then
 * render "updated on 24 Jul 2026. Your copy is from 24 Jul 2026.", which is self-contradicting and
 * which the adopter has no way to resolve. So precision is CONDITIONAL: coarse by default,
 * escalating to include the time exactly when the two vintages would otherwise be indistinguishable.
 *
 * Both sides escalate together — one dated and one timestamped would read as a different kind of
 * thing rather than as two points on one scale.
 *
 * The shared-day test is made in the viewer's timezone, because that is the rendering they compare.
 */
export const formatVintagePair = (
  adopted: string,
  latest: string,
): { adopted: string; latest: string } => {
  const sameDay = moment(adopted).isSame(moment(latest), 'day');
  const format = sameDay ? formatLongDateTime : formatLongDate;

  return { adopted: format(adopted), latest: format(latest) };
};
