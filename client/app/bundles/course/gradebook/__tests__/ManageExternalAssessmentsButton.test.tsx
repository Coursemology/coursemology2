import { fireEvent, render, screen } from 'test-utils';

import ManageExternalAssessmentsButton from '../components/manage/ManageExternalAssessmentsButton';

const state = {
  gradebook: {
    categories: [],
    tabs: [],
    students: [],
    submissions: [],
    assessments: [],
    gamificationEnabled: false,
    weightedViewEnabled: false,
    canManageWeights: true,
  },
};

it('opens the panel on click', async () => {
  render(<ManageExternalAssessmentsButton />, { state });
  fireEvent.click(
    await screen.findByRole('button', { name: 'Manage external assessments' }),
  );
  expect(await screen.findByText('External assessments')).toBeVisible();
});

it('does not open the external assessments panel by default', () => {
  render(<ManageExternalAssessmentsButton />, { state });
  expect(screen.queryByText('External assessments')).not.toBeInTheDocument();
});
