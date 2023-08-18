import { FormControlLabel, Radio, Typography } from '@mui/material';
import { green } from '@mui/material/colors';

import { answerShape, questionShape } from '../../propTypes';

const MultipleResponse = ({ question, answer }) => {
  const selectedOptions = answer.option_ids;
  return (
    <>
      {question.options.map((option) => (
        <FormControlLabel
          key={option.id}
          checked={selectedOptions.indexOf(option.id) !== -1}
          control={<Radio style={{ padding: '0 12px' }} />}
          disabled
          label={
            <b>
              <Typography
                dangerouslySetInnerHTML={{ __html: option.option.trim() }}
                style={
                  option.correct && selectedOptions.indexOf(option.id) !== -1
                    ? { backgroundColor: green[50] }
                    : null
                }
                variant="body2"
              />
            </b>
          }
          style={{ width: '100%' }}
          value={option.id.toString()}
        />
      ))}
    </>
  );
};

MultipleResponse.propTypes = {
  question: questionShape,
  answer: answerShape,
};

export default MultipleResponse;
