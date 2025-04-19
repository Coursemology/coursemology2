/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { fireEvent, render, waitFor, within } from 'test-utils';

import ResultsQuestion from '../ResultsQuestion';

const surveyId = '6';

const getTextResponseData = (answerCount) => {
  const answers: unknown[] = [];
  for (let i = 0; i < answerCount; i++) {
    answers.push({
      id: i,
      course_user_name: `S${i}`,
      text_response: `A${i}`,
      response_path: `/courses/${global.courseId}/surveys/${surveyId}/responses/${i}`,
    });
  }

  return {
    id: 5,
    question_type: 'text',
    description: 'Why?',
    answers,
  };
};

const getMultipleChoiceData = (optionCount) => {
  const options: unknown[] =
    optionCount < 1
      ? []
      : [
          {
            id: 0,
            image_url: 'a.png',
            image_name: 'a.png',
          },
        ];
  for (let i = 1; i < optionCount; i++) {
    options.push({ id: i, option: `O${i}` });
  }

  return {
    id: 6,
    question_type: 'multiple_choice',
    description: 'Which?',
    options,
    answers: [
      {
        id: 22,
        course_user_id: 122,
        course_user_name: 'Lee',
        response_path: `/courses/${global.courseId}/surveys/${surveyId}/responses/222`,
        phantom: false,
        question_option_ids: [optionCount > 0 ? optionCount - 1 : 0],
      },
    ],
  };
};

const testExpandLongQuestion = async (question) => {
  const page = render(
    <ResultsQuestion
      {...{ question }}
      anonymous={false}
      answerFilter={(_) => true}
      index={1}
    />,
  );

  await waitFor(() =>
    expect(page.queryByRole('table')).not.toBeInTheDocument(),
  );

  const expandButton = (await page.findAllByRole('button'))[0];
  fireEvent.click(expandButton);

  expect(await page.findByRole('table')).toBeVisible();
};

describe('<ResultsQuestion />', () => {
  it('collapses long text response question results', () => {
    const question = getTextResponseData(11);
    testExpandLongQuestion(question);
  });

  it('collapses long multiple response question results', () => {
    const question = getMultipleChoiceData(11);
    testExpandLongQuestion(question);
  });

  it('allows sorting by percentage', async () => {
    const question = getMultipleChoiceData(2);

    const page = render(
      <ResultsQuestion
        {...{ question }}
        anonymous={false}
        answerFilter={(answer) => !answer.phantom}
        index={1}
      />,
    );

    let lastRow = (await page.findAllByRole('row')).at(-1)!;
    expect(within(lastRow).getByText('1')).toBeVisible();

    const sortToggle = page.getByRole('checkbox');
    fireEvent.click(sortToggle);

    lastRow = page.getAllByRole('row').at(-1)!;
    expect(within(lastRow).getByText('0')).toBeVisible();
  });
});
