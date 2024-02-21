import { FormControlLabel, Radio, Typography } from '@mui/material';
import { green } from '@mui/material/colors';
import { QuestionAnswerDisplayDetails } from 'types/course/statistics/assessmentStatistics';

const MultipleChoiceDetails = (
  props: QuestionAnswerDisplayDetails<'MultipleChoice'>,
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
          control={<Radio />}
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
