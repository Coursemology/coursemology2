import { defineMessages } from 'react-intl';
import { Alert, Card, CardContent } from '@mui/material';
import { QuestionType } from 'types/course/assessment/question';
import { SubmissionQuestionData } from 'types/course/assessment/submission/question/types';

import useTranslation from 'lib/hooks/useTranslation';

import ScribingView from '../../containers/ScribingView';
import VoiceResponseAnswer from '../../containers/VoiceResponseAnswer';

import FileUploadAnswer from './FileUpload';
import ForumPostResponseAnswer from './ForumPostResponse';
import MultipleChoiceAnswer from './MultipleChoice';
import MultipleResponseAnswer from './MultipleResponse';
import ProgrammingAnswer from './Programming';
import RubricBasedResponseAnswer from './RubricBasedResponse';
import TextResponseAnswer from './TextResponse';
import {
  AnswerPropsMap,
  FileUploadAnswerProps,
  ForumPostResponseAnswerProps,
  McqAnswerProps,
  MrqAnswerProps,
  ProgrammingAnswerProps,
  RubricBasedResponseAnswerProps,
  ScribingAnswerProps,
  TextResponseAnswerProps,
  VoiceResponseAnswerProps,
} from './types';

const translations = defineMessages({
  rendererNotImplemented: {
    id: 'course.assessment.submission.Answer.rendererNotImplemented',
    defaultMessage:
      'The display for this question type has not been implemented yet.',
  },
  missingAnswer: {
    id: 'course.assessment.submission.Answer.missingAnswer',
    defaultMessage:
      'There is no answer submitted for this question - this might be caused by \
                    the addition of this question after the submission is submitted.',
  },
});

const MultipleChoice = (props: McqAnswerProps): JSX.Element => {
  const {
    question,
    answerId,
    readOnly,
    graderView,
    showMcqMrqSolution,
    saveAnswerAndUpdateClientVersion,
  } = props;
  return (
    <MultipleChoiceAnswer
      key={`question_${question.id}`}
      answerId={answerId!}
      graderView={graderView}
      question={question}
      readOnly={readOnly}
      saveAnswerAndUpdateClientVersion={saveAnswerAndUpdateClientVersion}
      showMcqMrqSolution={showMcqMrqSolution}
    />
  );
};

const MultipleResponse = (props: MrqAnswerProps): JSX.Element => {
  const {
    question,
    answerId,
    readOnly,
    graderView,
    showMcqMrqSolution,
    saveAnswerAndUpdateClientVersion,
  } = props;
  return (
    <MultipleResponseAnswer
      key={`question_${question.id}`}
      answerId={answerId!}
      graderView={graderView}
      question={question}
      readOnly={readOnly}
      saveAnswerAndUpdateClientVersion={saveAnswerAndUpdateClientVersion}
      showMcqMrqSolution={showMcqMrqSolution}
    />
  );
};

const Programming = (props: ProgrammingAnswerProps): JSX.Element => {
  const { question, answerId, readOnly, saveAnswerAndUpdateClientVersion } =
    props;
  return (
    <ProgrammingAnswer
      key={`question_${question.id}`}
      answerId={answerId!}
      question={question}
      readOnly={readOnly}
      saveAnswerAndUpdateClientVersion={saveAnswerAndUpdateClientVersion}
    />
  );
};

const TextResponse = (props: TextResponseAnswerProps): JSX.Element => {
  const {
    question,
    answerId,
    readOnly,
    graderView,
    saveAnswerAndUpdateClientVersion,
    handleUploadTextResponseFiles,
  } = props;
  return (
    <TextResponseAnswer
      key={`question_${question.id}`}
      answerId={answerId!}
      graderView={graderView}
      handleUploadTextResponseFiles={handleUploadTextResponseFiles}
      question={question}
      readOnly={readOnly}
      saveAnswerAndUpdateClientVersion={saveAnswerAndUpdateClientVersion}
    />
  );
};

const RubricBasedResponse = (
  props: RubricBasedResponseAnswerProps,
): JSX.Element => {
  const { question, answerId, readOnly, saveAnswerAndUpdateClientVersion } =
    props;
  return (
    <RubricBasedResponseAnswer
      key={`question_${question.id}`}
      answerId={answerId!}
      question={question}
      readOnly={readOnly}
      saveAnswerAndUpdateClientVersion={saveAnswerAndUpdateClientVersion}
    />
  );
};

const FileUpload = (props: FileUploadAnswerProps): JSX.Element => {
  const { question, answerId, readOnly, handleUploadTextResponseFiles } = props;
  return (
    <FileUploadAnswer
      key={`question_${question.id}`}
      answerId={answerId!}
      handleUploadTextResponseFiles={handleUploadTextResponseFiles}
      question={question}
      readOnly={readOnly}
    />
  );
};

const Scribing = (props: ScribingAnswerProps): JSX.Element => {
  const { question, answerId } = props;
  return <ScribingView key={`question_${question.id}`} answerId={answerId!} />;
};

const VoiceResponse = (props: VoiceResponseAnswerProps): JSX.Element => {
  const { question, answerId, readOnly, saveAnswerAndUpdateClientVersion } =
    props;
  return (
    <VoiceResponseAnswer
      key={`question_${question.id}`}
      answerId={answerId!}
      question={question}
      readOnly={readOnly}
      saveAnswerAndUpdateClientVersion={saveAnswerAndUpdateClientVersion}
    />
  );
};

const ForumPostResponse = (
  props: ForumPostResponseAnswerProps,
): JSX.Element => {
  const { question, answerId, readOnly, saveAnswerAndUpdateClientVersion } =
    props;
  return (
    <ForumPostResponseAnswer
      key={`question_${question.id}`}
      answerId={answerId!}
      question={question}
      readOnly={readOnly}
      saveAnswerAndUpdateClientVersion={saveAnswerAndUpdateClientVersion}
    />
  );
};

const AnswerNotImplemented = (): JSX.Element => {
  const { t } = useTranslation();

  return (
    <Card className="bg-yellow-100">
      <CardContent>{t(translations.rendererNotImplemented)}</CardContent>
    </Card>
  );
};

export const AnswerMapper = {
  MultipleChoice: (props: McqAnswerProps): JSX.Element => (
    <MultipleChoice {...props} />
  ),
  MultipleResponse: (props: MrqAnswerProps): JSX.Element => (
    <MultipleResponse {...props} />
  ),
  Programming: (props: ProgrammingAnswerProps): JSX.Element => (
    <Programming {...props} />
  ),
  TextResponse: (props: TextResponseAnswerProps): JSX.Element => (
    <TextResponse {...props} />
  ),
  FileUpload: (props: FileUploadAnswerProps): JSX.Element => (
    <FileUpload {...props} />
  ),
  Comprehension: (): JSX.Element => <AnswerNotImplemented />,
  RubricBasedResponse: (props: RubricBasedResponseAnswerProps): JSX.Element => (
    <RubricBasedResponse {...props} />
  ),
  Scribing: (props: ScribingAnswerProps): JSX.Element => (
    <Scribing {...props} />
  ),
  VoiceResponse: (props: VoiceResponseAnswerProps): JSX.Element => (
    <VoiceResponse {...props} />
  ),
  ForumPostResponse: (props: ForumPostResponseAnswerProps): JSX.Element => (
    <ForumPostResponse {...props} />
  ),
};

interface AnswerComponentProps<T extends keyof typeof QuestionType> {
  answerId: number | null;
  questionType: T;
  question: SubmissionQuestionData<T>;
  answerProps: AnswerPropsMap[T];
}

const Answer = <T extends keyof typeof QuestionType>(
  props: AnswerComponentProps<T>,
): JSX.Element => {
  const { answerId, questionType, answerProps } = props;
  const { t } = useTranslation();

  if (!answerId) {
    return <Alert severity="warning">{t(translations.missingAnswer)}</Alert>;
  }

  const Component = AnswerMapper[questionType];

  if (!Component) {
    return <AnswerNotImplemented />;
  }

  // "Any" type is used here as the props are dynamically generated
  // depending on the different answer type and typescript
  // does not support union typing for the elements.

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return Component(answerProps as any);
};

export default Answer;
