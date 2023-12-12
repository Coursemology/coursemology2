import { ElementType } from 'react';
import { FieldValues, UseFormSetValue } from 'react-hook-form';
import { defineMessages } from 'react-intl';
import { Card, CardContent } from '@mui/material';
import { yellow } from '@mui/material/colors';

import useTranslation from 'lib/hooks/useTranslation';

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
  question: SubmissionQuestionData;
  answerId: number;
  moreProps: T;
}

interface ProgrammingAnswerData {
  readOnly: boolean;
  saveAnswer: (data: unknown, answerId: number) => void;
  importFiles: (
    savedAnswerId: number,
    answerFields: unknown,
    language: string,
    setValue: UseFormSetValue<FieldValues>,
  ) => void;
  isSavingAnswer: boolean;
}

interface ProgrammingAnswerProps
  extends BaseAnswerProps<ProgrammingAnswerData> {}

const Programming = (props: ProgrammingAnswerProps): JSX.Element => {
  const {
    question,
    answerId,
    moreProps: { readOnly, saveAnswer, importFiles, isSavingAnswer },
  } = props;
  return (
    <ProgrammingAnswer
      key={`question_${question.id}`}
      {...{
        question,
        readOnly,
        answerId,
        saveAnswer,
        importFiles,
        isSavingAnswer,
      }}
    />
  );
};

interface McqMrqAnswerData {
  readOnly: boolean;
  saveAnswer: (data: unknown, answerId: number) => void;
  graderView: boolean;
  showMcqMrqSolution: boolean;
}

interface McqMrqAnswerProps extends BaseAnswerProps<McqMrqAnswerData> {}

const MultipleChoice = (props: McqMrqAnswerProps): JSX.Element => {
  const {
    question,
    answerId,
    moreProps: { readOnly, graderView, showMcqMrqSolution, saveAnswer },
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

const MultipleResponse = (props: McqMrqAnswerProps): JSX.Element => {
  const {
    question,
    answerId,
    moreProps: { readOnly, graderView, showMcqMrqSolution, saveAnswer },
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

interface TextResponseAnswerData {
  readOnly: boolean;
  saveAnswer: (data: unknown, answerId: number) => void;
  uploadFiles: (
    savedAnswerId: number,
    answerFields: unknown,
    setValue: UseFormSetValue<FieldValues>,
  ) => void;
  isSavingAnswer: boolean;
  graderView: boolean;
}

interface TextResponseAnswerProps
  extends BaseAnswerProps<TextResponseAnswerData> {}

const TextResponse = (props: TextResponseAnswerProps): JSX.Element => {
  const {
    question,
    answerId,
    moreProps: {
      readOnly,
      graderView,
      saveAnswer,
      isSavingAnswer,
      uploadFiles,
    },
  } = props;
  return (
    <TextResponseAnswer
      key={`question_${question.id}`}
      {...{
        question,
        readOnly,
        answerId,
        graderView,
        saveAnswer,
        isSavingAnswer,
        uploadFiles,
      }}
    />
  );
};

interface FileUploadAnswerData {
  readOnly: boolean;
  uploadFiles: (
    savedAnswerId: number,
    answerFields: unknown,
    setValue: UseFormSetValue<FieldValues>,
  ) => void;
  isSavingAnswer: boolean;
  graderView: boolean;
}

interface FileUploadAnswerProps extends BaseAnswerProps<FileUploadAnswerData> {}

const FileUpload = (props: FileUploadAnswerProps): JSX.Element => {
  const {
    question,
    answerId,
    moreProps: { readOnly, isSavingAnswer, uploadFiles },
  } = props;
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

interface ScribingAnswerData {
  readOnly: boolean;
}

interface ScribingAnswerProps extends BaseAnswerProps<ScribingAnswerData> {}

const Scribing = (props: ScribingAnswerProps): JSX.Element => {
  const {
    question,
    moreProps: { readOnly },
    answerId,
  } = props;
  return (
    <ScribingView
      key={`question_${question.id}`}
      answerId={answerId}
      readOnly={readOnly}
      scribing={question}
    />
  );
};

interface VoiceResponseAnswerData {
  readOnly: boolean;
  saveAnswer: (data: unknown, answerId: number) => void;
  savingIndicator: React.ReactNode | null;
}

interface VoiceResponseAnswerProps
  extends BaseAnswerProps<VoiceResponseAnswerData> {}

const VoiceResponse = (props: VoiceResponseAnswerProps): JSX.Element => {
  const {
    question,
    answerId,
    moreProps: { readOnly, saveAnswer, savingIndicator },
  } = props;
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

interface ForumResponseAnswerData {
  readOnly: boolean;
  saveAnswer: (data: unknown, answerId: number) => void;
  savingIndicator: React.ReactNode | null;
}

interface ForumResponseAnswerProps
  extends BaseAnswerProps<ForumResponseAnswerData> {}

const ForumPostResponse = (props: ForumResponseAnswerProps): JSX.Element => {
  const {
    question,
    answerId,
    moreProps: { readOnly, saveAnswer, savingIndicator },
  } = props;
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

const answers: Record<AnswerType, ElementType<BaseAnswerProps<never>>> = {
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

const Answer = (props: BaseAnswerProps<unknown>): JSX.Element => {
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
