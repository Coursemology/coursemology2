import { fireEvent, render } from 'test-utils';

import AssessmentIndex from '../NewAssessmentFormButton';

describe('<AssessmentIndex />', () => {
  it('renders the index page', async () => {
    const page = render(<AssessmentIndex categoryId={1} tabId={1} />);

    const newButton = await page.findByRole('button');
    fireEvent.click(newButton);

    expect(page.getByRole('heading', { name: 'New Assessment' })).toBeVisible();
    expect(page.getByLabelText('Title', { exact: false })).toBeVisible();
  });
});
