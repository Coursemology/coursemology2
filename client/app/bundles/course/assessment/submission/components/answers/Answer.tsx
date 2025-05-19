import { lazy, Suspense } from 'react';
import { Alert } from '@mui/material';
import { QuestionType } from 'types/course/assessment/question';

import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import useTranslation from 'lib/hooks/useTranslation';

import type { AnswerPropsMap } from './types';

const AnswerNotImplemented = lazy(
  () =>
    import(
      /* webpackChunkName: "AnswerNotImplemented" */
      './AnswerNotImplemented'
    ),
);

export const AnswerComponentMapper = {
  MultipleChoice: lazy(
    () =>
      import(
        /* webpackChunkName: "MultipleChoiceAdapter" */
        './adapters/MultipleChoiceAdapter'
      ),
  ),
  MultipleResponse: lazy(
    () =>
      import(
        /* webpackChunkName: "MultipleResponseAdapter" */
        './adapters/MultipleResponseAdapter'
      ),
  ),
  Programming: lazy(
    () =>
      import(
        /* webpackChunkName: "ProgrammingAdapter" */
        './adapters/ProgrammingAdapter'
      ),
  ),
  TextResponse: lazy(
    () =>
      import(
        /* webpackChunkName: "TextResponseAdapter" */
        './adapters/TextResponseAdapter'
      ),
  ),
  FileUpload: lazy(
    () =>
      import(
        /* webpackChunkName: "FileUploadAdapter" */
        './adapters/FileUploadAdapter'
      ),
  ),
  RubricBasedResponse: lazy(
    () =>
      import(
        /* webpackChunkName: "RubricBasedResponseAdapter" */
        './adapters/RubricBasedResponseAdapter'
      ),
  ),
  Scribing: lazy(
    () =>
      import(
        /* webpackChunkName: "ScribingAdapter" */
        './adapters/ScribingAdapter'
      ),
  ),
  VoiceResponse: lazy(
    () =>
      import(
        /* webpackChunkName: "VoiceResponseAdapter" */
        './adapters/VoiceResponseAdapter'
      ),
  ),
  ForumPostResponse: lazy(
    () =>
      import(
        /* webpackChunkName: "ForumPostResponseAdapter" */
        './adapters/ForumPostResponseAdapter'
      ),
  ),
};

interface AnswerComponentProps<T extends keyof typeof QuestionType> {
  answerId: number | null;
  questionType: T;
  answerProps: AnswerPropsMap[T];
}

const SuspensefulAnswer = <T extends keyof typeof QuestionType>({
  answerId,
  questionType,
  answerProps,
}: AnswerComponentProps<T>): JSX.Element => {
  const { t } = useTranslation();

  if (!answerId)
    return (
      <Alert severity="warning">
        {t({
          id: 'course.assessment.submission.Answer.missingAnswer',
          defaultMessage:
            'There is no answer submitted for this question - this might be caused by the addition of this question after the submission is submitted.',
        })}
      </Alert>
    );

  // @ts-expect-error
  const Adapter = AnswerComponentMapper[questionType];
  if (!Adapter) return <AnswerNotImplemented />;

  return <Adapter {...answerProps} />;
};

const Answer: typeof SuspensefulAnswer = (props) => (
  <Suspense fallback={<LoadingIndicator />}>
    <SuspensefulAnswer {...props} />
  </Suspense>
);

export default Answer;
