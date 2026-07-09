import { render, screen } from 'test-utils';

import { QuestionPreviewData } from '../../../../types';
import MultipleResponse from '../MultipleResponse';

const question: QuestionPreviewData = {
  id: 3,
  title: 'Capital of France',
  defaultTitle: 'Question 1',
  description: '<p>Pick one</p>',
  staffOnlyComments: '',
  maximumGrade: 1,
  type: 'MultipleResponse',
  displayType: 'Multiple Choice',
  detail: {
    gradingScheme: 'any_correct', // MCQ → single-select (Radio)
    options: [
      {
        id: 1,
        option: '<p>Paris</p>',
        correct: true,
        explanation: '<p>Correct!</p>',
        weight: 1,
      },
      {
        id: 2,
        option: '<p>London</p>',
        correct: false,
        explanation: '<p>Wrong city</p>',
        weight: 0,
      },
    ],
  },
};

it('renders each choice, marks the correct one, and shows explanations', async () => {
  render(<MultipleResponse question={question} />);

  expect(await screen.findByText('Paris')).toBeVisible();
  expect(screen.getByText('London')).toBeVisible();
  expect(screen.getByText('Correct!')).toBeVisible();
  // Options now live under the reused "Choices" section.
  expect(screen.getByTestId('renderer-MultipleResponse')).toBeInTheDocument();
  expect(screen.getByText('Choices')).toBeVisible();

  // gradingScheme 'any_correct' → MCQ → Radio inputs, correct option checked.
  const radios = screen.getAllByRole('radio');
  expect(radios[0]).toBeChecked();
  expect(radios[1]).not.toBeChecked();
});
