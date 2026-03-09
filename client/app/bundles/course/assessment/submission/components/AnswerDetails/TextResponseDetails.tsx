import { QuestionType } from 'types/course/assessment/question';

import UserHTMLText from 'lib/components/core/UserHTMLText';

import { AnswerDetailsProps } from '../../types';

import AttachmentDetails from './AttachmentDetails';

const TextResponseDetails = (
  props: AnswerDetailsProps<QuestionType.TextResponse>,
): JSX.Element => {
  const { question, answer } = props;

  return (
    <>
      <UserHTMLText html={answer.fields.answer_text} />
      {question.maxAttachments > 0 && (
        <div className="w-full mt-4 mb-4">
          <AttachmentDetails attachments={answer.attachments} />
        </div>
      )}
    </>
  );
};

export default TextResponseDetails;
