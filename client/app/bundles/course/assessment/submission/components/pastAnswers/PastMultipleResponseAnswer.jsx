import { FormControlLabel, Radio } from '@mui/material';
import { green } from '@mui/material/colors';
import { answerShape, questionShape } from '../../propTypes';

function MultipleResponse({ question, answer }) {
  const selectedOptions = answer.option_ids;
  return (
    <>
      {question.options.map((option) => (
        <FormControlLabel
          checked={selectedOptions.indexOf(option.id) !== -1}
          control={<Radio style={{ padding: '0 12px' }} />}
          disabled
          key={option.id}
          label={
            <b>
              <div
                style={
                  option.correct && selectedOptions.indexOf(option.id) !== -1
                    ? { backgroundColor: green[50] }
                    : null
                }
                dangerouslySetInnerHTML={{ __html: option.option.trim() }}
              />
            </b>
          }
          style={{ width: '100%' }}
          value={option.id.toString()}
        />
      ))}
    </>
  );
}

MultipleResponse.propTypes = {
  question: questionShape,
  answer: answerShape,
};

export default MultipleResponse;
