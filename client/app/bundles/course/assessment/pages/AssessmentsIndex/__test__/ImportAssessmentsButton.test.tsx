import { render } from 'test-utils';

import ImportAssessmentsButton from '../ImportAssessmentsButton';

it('links to the marketplace with the given tab as from_tab when the user can import', async () => {
  const page = render(<ImportAssessmentsButton canImport tabId={42} />);
  const link = await page.findByRole('link', { name: 'Import Assessments' });
  expect(link).toHaveAttribute(
    'href',
    expect.stringContaining('/marketplace?from_tab=42'),
  );
});

it('renders nothing when the user cannot import', () => {
  const page = render(<ImportAssessmentsButton canImport={false} tabId={42} />);
  expect(
    page.queryByRole('link', { name: 'Import Assessments' }),
  ).not.toBeInTheDocument();
});
