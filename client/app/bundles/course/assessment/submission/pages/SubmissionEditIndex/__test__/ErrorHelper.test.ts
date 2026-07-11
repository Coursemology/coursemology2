import { QuestionType } from 'types/course/assessment/question';

import { errorResolver } from '../ErrorHelper';

// A Comprehension answer has no answer field, so convertAnswerDataToInitialValue returns null for
// it (the UI renders AnswerNotImplemented). The resolver runs over every form value on finalise, so
// it must tolerate that null instead of destructuring it.
it('skips answers with no answer field instead of throwing', async () => {
  const resolve = errorResolver({}, {});

  const data = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    99: null as any,
  };

  const result = await resolve(data, undefined, {
    fields: {},
    shouldUseNativeValidation: false,
  });

  expect(result.errors).toEqual({});
  expect(result.values).toBe(data);
});

it('still validates answers that do have a field', async () => {
  const question = {
    id: 7,
    type: QuestionType.TextResponse,
    maximumAttachments: 0,
  };

  const resolve = errorResolver(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    { 7: question } as any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    {} as any,
  );

  const data = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    1: { questionId: 7, questionType: QuestionType.TextResponse } as any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    2: null as any,
  };

  const result = await resolve(data, undefined, {
    fields: {},
    shouldUseNativeValidation: false,
  });

  expect(result.values).toBe(data);
});
