import { fireEvent, render, screen, waitFor } from 'test-utils';
import EditExternalAssessmentPrompt from '../components/manage/EditExternalAssessmentPrompt';
import { editExternalAssessment } from '../operations';

jest.mock('../operations', () => ({
  editExternalAssessment: jest.fn(() => () => Promise.resolve()),
}));

const assessment = {
  id: -3, title: 'Quiz', tabId: -3, maxGrade: 20, external: true,
  floorAtZero: true, capAtMaximum: true,
};

it(
  'saves edited name, max and bound flags',
  async () => {
    render(<EditExternalAssessmentPrompt assessment={assessment} onClose={jest.fn()} open />);
    fireEvent.change(await screen.findByLabelText('Name'), { target: { value: 'Quiz 1' } });
    fireEvent.click(screen.getByRole('checkbox', { name: 'Cap grades at max' }));
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() =>
      expect(editExternalAssessment).toHaveBeenCalledWith(-3, {
        title: 'Quiz 1', maximumGrade: 20, floorAtZero: true, capAtMaximum: false,
      }),
    );
  },
  10000,
);
