import { FormControlLabel, Radio } from '@mui/material';
import { QuestionType } from 'types/course/assessment/question';

import UserHTMLText from 'lib/components/core/UserHTMLText';

import { AnswerDetailsProps } from '../../types';

const MultipleChoiceDetails = (
  props: AnswerDetailsProps<QuestionType.MultipleChoice>,
): JSX.Element => {
  const { question, answer } = props;
  return (
    <>
      {question.options.map((option) => (
        <FormControlLabel
          key={option.id}
          checked={
            answer.fields.option_ids.length > 0 &&
            answer.fields.option_ids.includes(option.id)
          }
          className="w-full"
          control={<Radio className="py-0 px-4" />}
          disabled
          label={
            <b>
              <UserHTMLText
                className={
                  option.correct ? 'bg-green-50 align-middle' : 'align-middle'
                }
                html={option.option.trim()}
              />
            </b>
          }
        />
      ))}
    </>
  );
};

export default MultipleChoiceDetails;
