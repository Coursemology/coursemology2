// `from_tab` is the assessment tab the user came from when they clicked "Import assessments".
// It rides along in the URL through the whole browse flow (index → listing → question preview and
// back via breadcrumbs) so duplication imports into that origin tab no matter how the user
// navigates. Every intra-marketplace link routes its path through `withFromTab` so the param is
// never silently dropped.
export const FROM_TAB_PARAM = 'from_tab';

export const readFromTab = (search: string): string | null =>
  new URLSearchParams(search).get(FROM_TAB_PARAM);

export const withFromTab = (path: string, fromTab: string | null): string => {
  if (!fromTab) return path;
  const separator = path.includes('?') ? '&' : '?';
  return `${path}${separator}${FROM_TAB_PARAM}=${fromTab}`;
};
