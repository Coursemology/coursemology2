import { fireEvent, render, waitFor } from 'test-utils';

import CourseAPI from 'api/course';
import QuestionFormDialogue from 'course/survey/containers/QuestionFormDialogue';

import NewQuestionButton from '../NewQuestionButton';

const questionText = 'Question: Is it true?';
const optionText = 'Yes';

describe('<NewQuestionButton />', () => {
  it('injects handlers that allow survey questions to be created', async () => {
    const spyCreate = jest.spyOn(CourseAPI.survey.questions, 'create');
    const sectionId = 7;

    const page = render(
      <>
        <NewQuestionButton sectionId={sectionId} />
        <QuestionFormDialogue />
      </>,
    );

    fireEvent.click(await page.findByRole('button'));

    fireEvent.change(page.getByLabelText('Question Text', { exact: false }), {
      target: { value: questionText },
    });

    fireEvent.change(page.getByPlaceholderText('Option 1'), {
      target: { value: optionText },
    });

    fireEvent.click(page.getByRole('button', { name: 'Submit' }));

    await waitFor(() => {
      expect(spyCreate).toHaveBeenCalled();
    });

    const formData = spyCreate.mock.calls[0][0];

    // formData is an instance of FormData. To enumerate all the items, we should be able to use
    // `#entries` or `#keys`, but jsdom doesn't seem to support these methods yet.
    // See https://github.com/tmpvar/jsdom/issues/1671
    expect(formData.get('question[question_type]')).toBe('multiple_response');
    expect(formData.get('question[required]')).toBe('false');
    expect(formData.get('question[description]')).toBe(questionText);
    expect(formData.get('question[options_attributes][0][option]')).toBe(
      optionText,
    );
  });
});
