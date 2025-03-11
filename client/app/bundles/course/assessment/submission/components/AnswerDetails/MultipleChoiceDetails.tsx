import { FormControlLabel, Radio, Typography } from '@mui/material';
import { green } from '@mui/material/colors';
import { QuestionType } from 'types/course/assessment/question';

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
              <Typography
                dangerouslySetInnerHTML={{ __html: option.option.trim() }}
                style={
                  option.correct
                    ? {
                        backgroundColor: green[50],
                        verticalAlign: 'middle',
                      }
                    : { verticalAlign: 'middle' }
                }
                variant="body2"
              />
            </b>
          }
        />
      ))}
    </>
  );
};

export default MultipleChoiceDetails;
