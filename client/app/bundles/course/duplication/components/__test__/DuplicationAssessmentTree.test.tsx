import { render } from 'test-utils';

import DuplicationAssessmentTree from '../DuplicationAssessmentTree';

it('renders category, tab and assessment rows with badges', async () => {
  const page = render(
    <DuplicationAssessmentTree
      nodes={[
        {
          category: { id: 1, title: 'Missions' },
          tabs: [
            {
              tab: { id: 2, title: 'Assignments' },
              assessments: [{ id: 3, title: 'Mission 1' }],
            },
          ],
        },
      ]}
    />,
  );

  // I18nProvider shows a LoadingIndicator until locale messages async-load;
  // await the first query to render past it, then the rest are synchronous.
  expect(await page.findByText('Missions')).toBeVisible();
  expect(page.getByText('Assignments')).toBeVisible();
  expect(page.getByText('Mission 1')).toBeVisible();
  expect(page.getByText('Category')).toBeVisible();
  expect(page.getByText('Tab')).toBeVisible();
  expect(page.getByText('Assessment')).toBeVisible();
});

it('renders disabled default placeholders when category/tab are null', async () => {
  const page = render(
    <DuplicationAssessmentTree
      nodes={[
        {
          category: null,
          tabs: [{ tab: null, assessments: [{ id: 3, title: 'Mission 1' }] }],
        },
      ]}
    />,
  );

  expect(await page.findByText('Default Category')).toBeVisible();
  expect(page.getByText('Default Tab')).toBeVisible();
  expect(page.getByText('Mission 1')).toBeVisible();
});
