import { createMockAdapter } from 'mocks/axiosMock';
import {
  AttachmentType,
  SolutionEntity,
  TextResponseEditableFormData,
} from 'types/course/assessment/question/text-responses';

import CourseAPI from 'api/course';

import { create, update } from '../operations';

const mock = createMockAdapter(
  CourseAPI.assessment.question.textResponse.client,
);

const assessmentId = '2';
const questionId = 5;

const redirectUrl = `/courses/${global.courseId}/assessments/${assessmentId}`;

const baseQuestion = {
  title: 'Test',
  description: '',
  staffOnlyComments: '',
  maximumGrade: '10',
  skillIds: [],
  hideText: false,
  templateText: null,
  attachmentType: AttachmentType.NO_ATTACHMENT,
  maxAttachments: 3,
  maxAttachmentSize: 10,
  isAttachmentRequired: false,
};

const makeData = (
  solutions: SolutionEntity[],
): TextResponseEditableFormData => ({
  solutions,
  question: { ...baseQuestion },
});

beforeEach(() => {
  mock.reset();
  window.history.pushState(
    {},
    '',
    `/courses/${global.courseId}/assessments/${assessmentId}/question/text_responses/${questionId}/edit`,
  );
});

describe('solutions_attributes request payload', () => {
  it('sends solution fields for a normal saved solution', async () => {
    const spy = jest.spyOn(
      CourseAPI.assessment.question.textResponse,
      'create',
    );
    mock.onPost().reply(200, { redirectUrl });

    await create(
      makeData([
        {
          id: 1,
          solution: 'exact answer',
          solutionType: 'exact_match',
          grade: 5,
          explanation: 'well done',
        },
      ]),
    );

    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({
        question_text_response: expect.objectContaining({
          solutions_attributes: [
            expect.objectContaining({
              id: 1,
              solution: 'exact answer',
              solution_type: 'exact_match',
              grade: 5,
              explanation: 'well done',
              _destroy: undefined,
            }),
          ],
        }),
      }),
    );
  });

  it('omits id for draft (unsaved) solutions', async () => {
    const spy = jest.spyOn(
      CourseAPI.assessment.question.textResponse,
      'create',
    );
    mock.onPost().reply(200, { redirectUrl });

    await create(
      makeData([
        {
          id: 'new-solution-0',
          solution: 'new answer',
          solutionType: 'keyword',
          grade: 3,
          explanation: '',
          draft: true,
        },
      ]),
    );

    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({
        question_text_response: expect.objectContaining({
          solutions_attributes: [
            expect.objectContaining({ id: undefined, solution: 'new answer' }),
          ],
        }),
      }),
    );
  });

  it('sends _destroy: true for solutions marked toBeDeleted', async () => {
    const spy = jest.spyOn(
      CourseAPI.assessment.question.textResponse,
      'update',
    );
    mock.onPatch().reply(200, { redirectUrl });

    await update(
      questionId,
      makeData([
        {
          id: 2,
          solution: 'old answer',
          solutionType: 'exact_match',
          grade: 5,
          explanation: '',
          toBeDeleted: true,
        },
      ]),
    );

    expect(spy).toHaveBeenCalledWith(
      questionId,
      expect.objectContaining({
        question_text_response: expect.objectContaining({
          solutions_attributes: [
            expect.objectContaining({ id: 2, _destroy: true }),
          ],
        }),
      }),
    );
  });
});
