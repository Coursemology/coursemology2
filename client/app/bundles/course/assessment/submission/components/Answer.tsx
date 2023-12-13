import { defineMessages } from 'react-intl';
import { Card, CardContent } from '@mui/material';

import useTranslation from 'lib/hooks/useTranslation';

import PastAnswers from '../containers/PastAnswers';
import ScribingView from '../containers/ScribingView';
import VoiceResponseAnswer from '../containers/VoiceResponseAnswer';
import { SubmissionQuestionData } from '../questionGrade';
import {
  AnswerProps,
  FileUploadAnswerProps,
  ForumResponseAnswerProps,
  McqMrqAnswerProps,
  ProgrammingAnswerProps,
  ScribingAnswerProps,
  TextAnswerProps,
  VoiceResponseAnswerProps,
} from '../types';

import FileUploadAnswer from './answers/FileUpload';
import ForumPostResponseAnswer from './answers/ForumPostResponse';
import MultipleChoiceAnswer from './answers/MultipleChoice';
import MultipleResponseAnswer from './answers/MultipleResponse';
import ProgrammingAnswer from './answers/Programming';
import TextResponseAnswer from './answers/TextResponse';

const translations = defineMessages({
  rendererNotImplemented: {
    id: 'course.assessment.submission.SubmissionAnswer.rendererNotImplemented',
    defaultMessage:
      'The display for this question type has not been implemented yet.',
  },
});

interface Props {
  type: keyof typeof AnswerMapper;
  question: SubmissionQuestionData;
  answerProps: AnswerProps;
}

const Programming = (props: ProgrammingAnswerProps): JSX.Element => {
  const {
    question,
    answerId,
    readOnly,
    saveAnswerAndUpdateClientVersion,
    importFiles,
    isSavingAnswer,
  } = props;
  return (
    <ProgrammingAnswer
      key={`question_${question.id}`}
      {...{
        question,
        readOnly,
        answerId,
        saveAnswerAndUpdateClientVersion,
        importFiles,
        isSavingAnswer,
      }}
    />
  );
};

const MultipleChoice = (props: McqMrqAnswerProps): JSX.Element => {
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
      {...{
        question,
        readOnly,
        answerId,
        graderView,
        showMcqMrqSolution,
        saveAnswerAndUpdateClientVersion,
      }}
    />
  );
};

const MultipleResponse = (props: McqMrqAnswerProps): JSX.Element => {
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
      {...{
        question,
        readOnly,
        answerId,
        graderView,
        showMcqMrqSolution,
        saveAnswerAndUpdateClientVersion,
      }}
    />
  );
};

const TextResponse = (props: TextAnswerProps): JSX.Element => {
  const {
    question,
    answerId,
    readOnly,
    graderView,
    saveAnswerAndUpdateClientVersion,
    isSavingAnswer,
    uploadFiles,
  } = props;
  return (
    <TextResponseAnswer
      key={`question_${question.id}`}
      {...{
        question,
        readOnly,
        answerId,
        graderView,
        saveAnswerAndUpdateClientVersion,
        isSavingAnswer,
        uploadFiles,
      }}
    />
  );
};

const FileUpload = (props: FileUploadAnswerProps): JSX.Element => {
  const { question, answerId, readOnly, isSavingAnswer, uploadFiles } = props;
  return (
    <FileUploadAnswer
      key={`question_${question.id}`}
      {...{
        question,
        readOnly,
        answerId,
        isSavingAnswer,
        uploadFiles,
      }}
    />
  );
};

const Scribing = (props: ScribingAnswerProps): JSX.Element => {
  const { question, readOnly, answerId } = props;
  return (
    <ScribingView
      key={`question_${question.id}`}
      answerId={answerId}
      readOnly={readOnly}
      scribing={question}
    />
  );
};

const VoiceResponse = (props: VoiceResponseAnswerProps): JSX.Element => {
  const {
    question,
    answerId,
    readOnly,
    saveAnswerAndUpdateClientVersion,
    savingIndicator,
  } = props;
  return (
    <VoiceResponseAnswer
      key={`question_${question.id}`}
      answerId={answerId}
      question={question}
      readOnly={readOnly}
      saveAnswerAndUpdateClientVersion={saveAnswerAndUpdateClientVersion}
      savingIndicator={savingIndicator}
    />
  );
};

const ForumPostResponse = (props: ForumResponseAnswerProps): JSX.Element => {
  const {
    question,
    answerId,
    readOnly,
    saveAnswerAndUpdateClientVersion,
    savingIndicator,
  } = props;
  return (
    <ForumPostResponseAnswer
      key={`question_${question.id}`}
      answerId={answerId}
      question={question}
      readOnly={readOnly}
      saveAnswerAndUpdateClientVersion={saveAnswerAndUpdateClientVersion}
      savingIndicator={savingIndicator}
    />
  );
};

export type AnswerType =
  | 'MultipleChoice'
  | 'MultipleResponse'
  | 'Programming'
  | 'TextResponse'
  | 'Comprehension'
  | 'FileUpload'
  | 'Scribing'
  | 'VoiceResponse'
  | 'ForumPostResponse';

export const AnswerMapper = {
  MultipleChoice: (props: McqMrqAnswerProps): JSX.Element =>
    MultipleChoice(props),
  MultipleResponse: (props: McqMrqAnswerProps): JSX.Element =>
    MultipleResponse(props),
  Programming: (props: ProgrammingAnswerProps): JSX.Element =>
    Programming(props),
  TextResponse: (props: TextAnswerProps): JSX.Element => TextResponse(props),
  Comprehension: (props: TextAnswerProps): JSX.Element => TextResponse(props),
  FileUpload: (props: FileUploadAnswerProps): JSX.Element => FileUpload(props),
  Scribing: (props: ScribingAnswerProps): JSX.Element => Scribing(props),
  VoiceResponse: (props: VoiceResponseAnswerProps): JSX.Element =>
    VoiceResponse(props),
  ForumPostResponse: (props: ForumResponseAnswerProps): JSX.Element =>
    ForumPostResponse(props),
};

const Answer = (props: Props): JSX.Element => {
  const Component = AnswerMapper[props.type];
  const { t } = useTranslation();

  if (props.question.viewHistory) {
    return <PastAnswers question={props.question} />;
  }

  if (!Component) {
    return (
      <Card className="bg-yellow-100">
        <CardContent>{t(translations.rendererNotImplemented)}</CardContent>
      </Card>
    );
  }

  // in order to support polymorphism (each answerProps has different attributes, and we
  // need to support them all) and also the possibility of extending the type for future
  // addition type of answer, we declare props.answerProps as any, since it can be
  // any type

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return Component(props.answerProps as any);
};

export default Answer;
