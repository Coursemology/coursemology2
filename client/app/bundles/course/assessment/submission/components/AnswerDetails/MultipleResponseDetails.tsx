import { Checkbox, FormControlLabel } from '@mui/material';
import { QuestionType } from 'types/course/assessment/question';

import UserHTMLText from 'lib/components/core/UserHTMLText';

import { AnswerDetailsProps } from '../../types';

const MultipleResponseDetails = (
  props: AnswerDetailsProps<QuestionType.MultipleResponse>,
): JSX.Element => {
  const { question, answer } = props;
  return (
    <>
      {question.options.map((option) => {
        return (
          <FormControlLabel
            key={option.id}
            checked={
              answer.fields.option_ids.length > 0 &&
              answer.fields.option_ids.indexOf(option.id) !== -1
            }
            className="w-full"
            control={<Checkbox className="py-0 px-4" />}
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
        );
      })}
    </>
  );
};

export default MultipleResponseDetails;
