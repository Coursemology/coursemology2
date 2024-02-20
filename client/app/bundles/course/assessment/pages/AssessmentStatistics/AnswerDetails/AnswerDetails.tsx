import { defineMessages } from 'react-intl';
import { Card, CardContent } from '@mui/material';
import { QuestionType } from 'types/course/assessment/question';
import { AnswerDetailsMap } from 'types/course/statistics/answer';
import { QuestionDetails } from 'types/course/statistics/assessmentStatistics';

import useTranslation from 'lib/hooks/useTranslation';

import FileUploadDetails from './FileUploadDetails';
import ForumPostResponseDetails from './ForumPostResponseDetails';
import MultipleChoiceDetails from './MultipleChoiceDetails';
import MultipleResponseDetails from './MultipleResponseDetails';
import ProgrammingAnswerDetails from './ProgrammingAnswerDetails';
import TextResponseDetails from './TextResponseDetails';

const translations = defineMessages({
  rendererNotImplemented: {
    id: 'course.assessment.submission.Answer.rendererNotImplemented',
    defaultMessage:
      'The display for this question type has not been implemented yet.',
  },
});

interface AnswerDetailsProps<T extends keyof typeof QuestionType> {
  question: QuestionDetails<T>;
  answer: AnswerDetailsMap[T];
}

const AnswerNotImplemented = (): JSX.Element => {
  const { t } = useTranslation();

  return (
    <Card className="bg-yellow-100">
      <CardContent>{t(translations.rendererNotImplemented)}</CardContent>
    </Card>
  );
};

export const AnswerDetailsMapper = {
  MultipleChoice: (
    props: AnswerDetailsProps<'MultipleChoice'>,
  ): JSX.Element => <MultipleChoiceDetails {...props} />,
  MultipleResponse: (
    props: AnswerDetailsProps<'MultipleResponse'>,
  ): JSX.Element => <MultipleResponseDetails {...props} />,
  TextResponse: (props: AnswerDetailsProps<'TextResponse'>): JSX.Element => (
    <TextResponseDetails {...props} />
  ),
  FileUpload: (props: AnswerDetailsProps<'FileUpload'>): JSX.Element => (
    <FileUploadDetails {...props} />
  ),
  ForumPostResponse: (
    props: AnswerDetailsProps<'ForumPostResponse'>,
  ): JSX.Element => <ForumPostResponseDetails {...props} />,
  Programming: (props: AnswerDetailsProps<'Programming'>): JSX.Element => (
    <ProgrammingAnswerDetails {...props} />
  ),
  // TODO: define component for Voice Response, Scribing
  VoiceResponse: (_props: AnswerDetailsProps<'VoiceResponse'>): JSX.Element => (
    <AnswerNotImplemented />
  ),
  Scribing: (_props: AnswerDetailsProps<'Scribing'>): JSX.Element => (
    <AnswerNotImplemented />
  ),
  Comprehension: (_props: AnswerDetailsProps<'Comprehension'>): JSX.Element => (
    <AnswerNotImplemented />
  ),
};

const AnswerDetails = <T extends keyof typeof QuestionType>(
  props: AnswerDetailsProps<T>,
): JSX.Element => {
  const Component = AnswerDetailsMapper[props.answer.questionType];

  // "Any" type is used here as the props are dynamically generated
  // depending on the different answer type and typescript
  // does not support union typing for the elements.

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return Component({ ...props } as any);
};

export default AnswerDetails;
