import { RadioButton } from 'material-ui/RadioButton';
import { green50 } from 'material-ui/styles/colors';

import { answerShape, questionShape } from '../../propTypes';

const MultipleResponse = ({ question, answer }) => {
  const selectedOptions = answer.option_ids;
  return (
    <>
      {question.options.map((option) => (
        <RadioButton
          key={option.id}
          checked={selectedOptions.indexOf(option.id) !== -1}
          disabled={true}
          label={
            <div
              dangerouslySetInnerHTML={{ __html: option.option.trim() }}
              style={
                option.correct && selectedOptions.indexOf(option.id) !== -1
                  ? { backgroundColor: green50 }
                  : null
              }
            />
          }
          value={option.id}
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
