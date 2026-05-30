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

afterEach(() => {
  jest.restoreAllMocks();
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

    expect(spy).toHaveBeenCalledWith(expect.any(FormData));
    const fd = spy.mock.calls[0][0] as FormData;
    const base = 'question_text_response[solutions_attributes][]';
    expect(fd.get(`${base}[id]`)).toBe('1');
    expect(fd.get(`${base}[solution]`)).toBe('exact answer');
    expect(fd.get(`${base}[solution_type]`)).toBe('exact_match');
    expect(fd.get(`${base}[grade]`)).toBe('5');
    expect(fd.get(`${base}[explanation]`)).toBe('well done');
    // spreadsheet fields should be set to explicit null to preserve alignment
    // not deleted — _destroy absent
    expect(fd.get(`${base}[_destroy]`)).toBeNull();
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

    expect(spy).toHaveBeenCalledWith(expect.any(FormData));
    const fd = spy.mock.calls[0][0] as FormData;
    const base = 'question_text_response[solutions_attributes][]';
    // draft: true causes id to be omitted (undefined → not appended)
    expect(fd.get(`${base}[id]`)).toBeNull();
    expect(fd.get(`${base}[solution]`)).toBe('new answer');
  });

  it('sends _destroy for solutions marked toBeDeleted', async () => {
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

    expect(spy).toHaveBeenCalledWith(questionId, expect.any(FormData));
    const fd = spy.mock.calls[0][1] as FormData;
    const base = 'question_text_response[solutions_attributes][]';
    expect(fd.get(`${base}[id]`)).toBe('2');
    // booleans are encoded as '1' (true) / '0' (false)
    expect(fd.get(`${base}[_destroy]`)).toBe('1');
  });

  it('sends spreadsheet attributes for spreadsheet_formula solutions', async () => {
    const spy = jest.spyOn(
      CourseAPI.assessment.question.textResponse,
      'create',
    );
    mock.onPost().reply(200, { redirectUrl });

    await create(
      makeData([
        {
          id: 1,
          solution: '',
          solutionType: 'spreadsheet_formula',
          grade: 10,
          explanation: '',
          spreadsheet: {
            isRandomizationEnabled: false,
            isRandomSeedFixed: true,
            randomSeed: 42,
            isTimestampFixed: false,
            testTimestamp: new Date().toISOString(),
            numRandomTests: 4,
            variables: [],
            file: { name: 'sheet.xlsx', url: '' },
          },
        },
      ]),
    );

    expect(spy).toHaveBeenCalledWith(expect.any(FormData));
    const fd = spy.mock.calls[0][0] as FormData;
    const ss =
      'question_text_response[solutions_attributes][][test_spreadsheet_attributes]';
    expect(fd.get(`${ss}[is_randomization_enabled]`)).toBe('0');
    expect(fd.get(`${ss}[is_random_seed_fixed]`)).toBe('1');
    expect(fd.get(`${ss}[test_random_seed]`)).toBe('42');
    expect(fd.get(`${ss}[is_timestamp_fixed]`)).toBe('0');
    expect(fd.get(`${ss}[test_timestamp]`)).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(fd.get(`${ss}[num_random_tests]`)).toBe('4');
    // variables serialised as JSON string
    expect(fd.get(`${ss}[variables]`)).toBe('[]');
  });
});
