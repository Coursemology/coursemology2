import { render, screen } from 'test-utils';

import { QuestionPreviewData } from '../../../../types';
import RubricBasedResponse from '../RubricBasedResponse';

const question: QuestionPreviewData = {
  id: 3,
  title: 'Essay',
  defaultTitle: 'Question 1',
  description: '<p>Write an essay</p>',
  staffOnlyComments: '',
  maximumGrade: 7,
  type: 'RubricBasedResponse',
  displayType: 'Rubric-Based Response',
  detail: {
    categories: [
      {
        name: 'Clarity',
        isBonus: false,
        criteria: [{ grade: 5, explanation: '<p>Very clear</p>' }],
      },
      {
        name: 'Extra credit',
        isBonus: true,
        criteria: [{ grade: 2, explanation: '<p>Nice touch</p>' }],
      },
    ],
  },
};

it('renders each category, its criteria, and a bonus marker', async () => {
  render(<RubricBasedResponse question={question} />);

  expect(await screen.findByText('Clarity')).toBeVisible();
  expect(screen.getByText('Extra credit')).toBeVisible();
  expect(screen.getByText('Very clear')).toBeVisible();
  expect(screen.getByText('Nice touch')).toBeVisible();
  // isBonus category → a "Bonus" chip/label (match the chosen `bonus` translation).
  expect(screen.getByText(/bonus/i)).toBeVisible();
  // Categories now live under the reused "Rubric" section.
  expect(screen.getByText('Rubric')).toBeVisible();
});
