import React, { PropTypes } from 'react';
import { Field, FieldArray } from 'redux-form';
import { RadioButton } from 'material-ui/RadioButton';
import { Card, CardText } from 'material-ui/Card';
import { red500 } from 'material-ui/styles/colors';
import TextField from 'lib/components/redux-form/TextField';
import Checkbox from 'lib/components/redux-form/Checkbox';
import RadioButtonGroup from 'lib/components/redux-form/RadioButtonGroup';
import { questionTypes } from '../constants';
import { questionShape } from '../propTypes';
import Thumbnail from './Thumbnail';

const styles = {
  textResponse: {
    width: '100%',
  },
  label: {
    // Overrides bootstrap's styling. To be removed once bootstrap is removed
    fontWeight: 'normal',
    // When image is clicked, magnify the image instead of selecting the option
    zIndex: 2,
  },
  image: {
    maxHeight: 150,
    maxWidth: 400,
  },
  optionLabel: {
    display: 'flex',
    flexDirection: 'column',
  },
  option: {
    marginTop: 10,
  },
  errorText: {
    color: red500,
  },
};

class ResponseAnswer extends React.Component {
  static propTypes = {
    question: questionShape,
    member: PropTypes.string.isRequired,
    index: PropTypes.number.isRequired,
  };

  static renderTextResponseField(question, member) {
    return (
      <Field
        name={`${member}[text_response]`}
        component={TextField}
        style={styles.textResponse}
        multiLine
      />
    );
  }

  static renderOptionLabel(option) {
    return (
      <div style={styles.optionLabel}>
        {
          option.image_url ?
            <Thumbnail src={option.image_url} style={styles.image} /> :
          []
        }
        { option.option ? option.option : '' }
      </div>
    );
  }

  static renderMultipleChoiceOptions({ question, ...props }) {
    const { meta: { dirty, error } } = props;
    return (
      <div>
        { dirty && error ? <p style={styles.errorText}>{error}</p> : null }
        <RadioButtonGroup {...props}>
          {question.options.map(option => (
            <RadioButton
              key={option.id}
              value={option.id.toString()}
              label={ResponseAnswer.renderOptionLabel(option)}
              labelStyle={styles.label}
              style={styles.option}
            />
          ))}
        </RadioButtonGroup>
      </div>
    );
  }

  static renderMultipleChoiceField(question, member) {
    return (
      <Field
        name={`${member}[selected_option]`}
        component={ResponseAnswer.renderMultipleChoiceOptions}
        {...{ question }}
      />
    );
  }

  static renderMultipleResponseOptions(props) {
    const { fields, question, meta: { dirty, error } } = props;
    return (
      <div>
        { dirty && error ? <p style={styles.errorText}>{error}</p> : null }
        {
          fields.map((member, index) => {
            const answerOption = fields.get(index);
            const option = question.options.find(opt =>
              opt.id.toString() === answerOption.question_option_id.toString()
            );
            return (
              <Field
                key={option.id}
                name={`${member}[selected]`}
                component={Checkbox}
                label={ResponseAnswer.renderOptionLabel(option)}
                labelStyle={styles.label}
                style={styles.option}
              />
            );
          })
        }
      </div>
    );
  }

  static renderMultipleResponseField(question, member) {
    return (
      <FieldArray
        name={`${member}[options]`}
        component={ResponseAnswer.renderMultipleResponseOptions}
        {...{ question }}
      />
    );
  }

  render() {
    const { TEXT, MULTIPLE_CHOICE, MULTIPLE_RESPONSE } = questionTypes;
    const { question, member, index } = this.props;
    if (!question) { return <div />; }

    const renderer = {
      [TEXT]: ResponseAnswer.renderTextResponseField,
      [MULTIPLE_CHOICE]: ResponseAnswer.renderMultipleChoiceField,
      [MULTIPLE_RESPONSE]: ResponseAnswer.renderMultipleResponseField,
    }[question.question_type];
    if (!renderer) { return <div />; }

    return (
      <Card>
        <CardText>
          <p>{`${question.weight + 1}. ${question.description}`}</p>
          <Field
            name={`${member}[${index}][id]`}
            component="hidden"
          />
          { renderer(question, member) }
        </CardText>
      </Card>
    );
  }
}

export default ResponseAnswer;
