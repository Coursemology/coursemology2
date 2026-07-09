// `from_tab` is the assessment tab the user came from when they clicked "Import assessments".
// It rides along in the URL through the whole browse flow (index → listing → question preview and
// back via breadcrumbs) so duplication imports into that origin tab no matter how the user
// navigates. Every intra-marketplace link routes its path through `withFromTab` so the param is
// never silently dropped.
//
// The value is a tab id, so it is carried as a `number` end to end: `readFromTab` parses it at the
// URL boundary and drops anything non-numeric, which both saves every consumer from re-parsing and
// makes it impossible for `withFromTab` to interpolate reserved URL characters back into a link.
import { getIdFromUnknown } from 'utilities';

export const FROM_TAB_PARAM = 'from_tab';

export const readFromTab = (search: string): number | null =>
  getIdFromUnknown(new URLSearchParams(search).get(FROM_TAB_PARAM)) ?? null;

export const withFromTab = (path: string, fromTab: number | null): string => {
  if (!fromTab) return path;
  const separator = path.includes('?') ? '&' : '?';
  return `${path}${separator}${FROM_TAB_PARAM}=${fromTab}`;
};
