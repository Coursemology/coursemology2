import { defineMessages } from 'react-intl';
import { Card, CardContent } from '@mui/material';
import { QuestionType } from 'types/course/assessment/question';
import { Question } from 'types/course/statistics/assessmentStatistics';

import useTranslation from 'lib/hooks/useTranslation';

import ProgrammingQuestionDetails from './ProgrammingQuestionDetails';

const translations = defineMessages({
  rendererNotImplemented: {
    id: 'course.assessment.submission.Question.rendererNotImplemented',
    defaultMessage:
      'The display for this question type has not been implemented yet.',
  },
});

interface QuestionDetailsProps<T extends keyof typeof QuestionType> {
  question: Question<T>;
}

const QuestionNotImplemented = (): JSX.Element => {
  const { t } = useTranslation();

  return (
    <Card className="bg-yellow-100">
      <CardContent>{t(translations.rendererNotImplemented)}</CardContent>
    </Card>
  );
};

// TODO: define component for unimplemented parts
export const QuestionDetailsMapper = {
  MultipleChoice: (
    _props: QuestionDetailsProps<'MultipleChoice'>,
  ): JSX.Element => <QuestionNotImplemented />,
  MultipleResponse: (
    _props: QuestionDetailsProps<'MultipleResponse'>,
  ): JSX.Element => <QuestionNotImplemented />,
  TextResponse: (_props: QuestionDetailsProps<'TextResponse'>): JSX.Element => (
    <QuestionNotImplemented />
  ),
  FileUpload: (_props: QuestionDetailsProps<'FileUpload'>): JSX.Element => (
    <QuestionNotImplemented />
  ),
  ForumPostResponse: (
    _props: QuestionDetailsProps<'ForumPostResponse'>,
  ): JSX.Element => <QuestionNotImplemented />,
  Programming: (props: QuestionDetailsProps<'Programming'>): JSX.Element => (
    <ProgrammingQuestionDetails {...props} />
  ),
  VoiceResponse: (
    _props: QuestionDetailsProps<'VoiceResponse'>,
  ): JSX.Element => <QuestionNotImplemented />,
  Scribing: (_props: QuestionDetailsProps<'Scribing'>): JSX.Element => (
    <QuestionNotImplemented />
  ),
  Comprehension: (
    _props: QuestionDetailsProps<'Comprehension'>,
  ): JSX.Element => <QuestionNotImplemented />,
};

const QuestionDetails = <T extends keyof typeof QuestionType>(
  props: QuestionDetailsProps<T>,
): JSX.Element => {
  const Component = QuestionDetailsMapper[props.question.type];

  // "Any" type is used here as the props are dynamically generated
  // depending on the different question type and typescript
  // does not support union typing for the elements.

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return Component({ ...props } as any);
};

export default QuestionDetails;
