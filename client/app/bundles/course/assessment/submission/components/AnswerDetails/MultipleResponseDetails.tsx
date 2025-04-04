import { Checkbox, FormControlLabel, Typography } from '@mui/material';
import { green } from '@mui/material/colors';
import { QuestionType } from 'types/course/assessment/question';

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
        );
      })}
    </>
  );
};

export default MultipleResponseDetails;
