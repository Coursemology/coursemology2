import { ElementType } from 'react';
import { defineMessages } from 'react-intl';
import { Card, CardContent } from '@mui/material';
import { yellow } from '@mui/material/colors';

import useTranslation from 'lib/hooks/useTranslation';

import 'ace-builds/src-noconflict/mode-python';
import 'ace-builds/src-noconflict/theme-github';

import PastAnswers from '../containers/PastAnswers';
import ScribingView from '../containers/ScribingView';
import VoiceResponseAnswer from '../containers/VoiceResponseAnswer';
import { SubmissionQuestionData } from '../questionGrade';

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

interface BaseAnswerProps<T> {
  question: T;
  readOnly: boolean;
  answerId: number;
  saveAnswer: (data: unknown, answerId: number, currentTime: number) => void;
}

interface ForumResponseAnswerProps<T> extends BaseAnswerProps<T> {
  savingIndicator?: React.ReactNode | null;
}

interface VoiceResponseAnswerProps<T> extends BaseAnswerProps<T> {
  savingIndicator?: React.ReactNode | null;
}

interface TextResponseAnswerProps<T> extends BaseAnswerProps<T> {
  graderView?: boolean;
}

interface FileUploadAnswerProps<T> extends BaseAnswerProps<T> {
  isSavingAnswer?: boolean;
}

interface McqMrqAnswerProps<T> extends BaseAnswerProps<T> {
  graderView?: boolean;
  showMcqMrqSolution?: boolean;
}

const MultipleChoice = (
  props: McqMrqAnswerProps<SubmissionQuestionData>,
): JSX.Element => {
  const {
    question,
    readOnly,
    answerId,
    graderView,
    showMcqMrqSolution,
    saveAnswer,
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
        saveAnswer,
      }}
    />
  );
};

const MultipleResponse = (
  props: McqMrqAnswerProps<SubmissionQuestionData>,
): JSX.Element => {
  const {
    question,
    readOnly,
    answerId,
    graderView,
    showMcqMrqSolution,
    saveAnswer,
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
        saveAnswer,
      }}
    />
  );
};

const Programming = (
  props: BaseAnswerProps<SubmissionQuestionData>,
): JSX.Element => {
  const { question, readOnly, answerId, saveAnswer } = props;
  return (
    <ProgrammingAnswer
      key={`question_${question.id}`}
      {...{
        question,
        readOnly,
        answerId,
        saveAnswer,
      }}
    />
  );
};

const TextResponse = (
  props: TextResponseAnswerProps<SubmissionQuestionData>,
): JSX.Element => {
  const { question, readOnly, answerId, graderView, saveAnswer } = props;
  return (
    <TextResponseAnswer
      key={`question_${question.id}`}
      {...{ question, readOnly, answerId, graderView, saveAnswer }}
    />
  );
};

const FileUpload = (
  props: FileUploadAnswerProps<SubmissionQuestionData>,
): JSX.Element => {
  const { question, readOnly, answerId, saveAnswer, isSavingAnswer } = props;
  return (
    <FileUploadAnswer
      key={`question_${question.id}`}
      {...{ question, readOnly, answerId, saveAnswer, isSavingAnswer }}
    />
  );
};

const Scribing = (
  props: BaseAnswerProps<SubmissionQuestionData>,
): JSX.Element => {
  const { question, readOnly, answerId, saveAnswer } = props;
  return (
    <ScribingView
      key={`question_${question.id}`}
      answerId={answerId}
      readOnly={readOnly}
      saveAnswer={saveAnswer}
      scribing={question}
    />
  );
};

const VoiceResponse = (
  props: VoiceResponseAnswerProps<SubmissionQuestionData>,
): JSX.Element => {
  const { question, readOnly, answerId, saveAnswer, savingIndicator } = props;
  return (
    <VoiceResponseAnswer
      key={`question_${question.id}`}
      answerId={answerId}
      question={question}
      readOnly={readOnly}
      saveAnswer={saveAnswer}
      savingIndicator={savingIndicator}
    />
  );
};

const ForumPostResponse = (
  props: ForumResponseAnswerProps<SubmissionQuestionData>,
): JSX.Element => {
  const { question, readOnly, answerId, saveAnswer, savingIndicator } = props;
  return (
    <ForumPostResponseAnswer
      key={`question_${question.id}`}
      answerId={answerId}
      question={question}
      readOnly={readOnly}
      saveAnswer={saveAnswer}
      savingIndicator={savingIndicator}
    />
  );
};

type AnswerProps<T> =
  | BaseAnswerProps<T>
  | ForumResponseAnswerProps<T>
  | VoiceResponseAnswerProps<T>
  | TextResponseAnswerProps<T>
  | FileUploadAnswerProps<T>
  | McqMrqAnswerProps<T>;

type AnswerType =
  | 'MultipleChoice'
  | 'MultipleResponse'
  | 'Programming'
  | 'TextResponse'
  | 'Comprehension'
  | 'FileUpload'
  | 'Scribing'
  | 'VoiceResponse'
  | 'ForumPostResponse';

const answers: Record<
  AnswerType,
  ElementType<AnswerProps<SubmissionQuestionData>>
> = {
  MultipleChoice,
  MultipleResponse,
  Programming,
  TextResponse,
  Comprehension: TextResponse,
  FileUpload,
  Scribing,
  VoiceResponse,
  ForumPostResponse,
};

const Answer = (props: AnswerProps<SubmissionQuestionData>): JSX.Element => {
  const Component = answers[props.question.type];
  const { t } = useTranslation();

  if (props.question.viewHistory) {
    return <PastAnswers question={props.question} />;
  }

  if (!Component) {
    return (
      <Card style={{ backgroundColor: yellow[100] }}>
        <CardContent>{t(translations.rendererNotImplemented)}</CardContent>
      </Card>
    );
  }

  return <Component {...props} />;
};

export default Answer;
