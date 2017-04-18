import React, { PropTypes } from 'react';
import { Field, FieldArray } from 'redux-form';
import { defineMessages, FormattedMessage } from 'react-intl';
import { RadioButton } from 'material-ui/RadioButton';
import { Card, CardText } from 'material-ui/Card';
import { red500 } from 'material-ui/styles/colors';
import TextField from 'lib/components/redux-form/TextField';
import Checkbox from 'lib/components/redux-form/Checkbox';
import { questionTypes } from 'course/survey/constants';
import OptionsListItem from 'course/survey/components/OptionsListItem';

const styles = {
  textResponse: {
    width: '100%',
  },
  errorText: {
    color: red500,
  },
  answerCard: {
    marginBottom: 15,
  },
  grid: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  tiledImage: {
    maxHeight: 150,
    maxWidth: 150,
  },
  listOptionWidget: {
    width: 'auto',
  },
  gridOptionWidget: {
    marginTop: 5,
    width: 'auto',
  },
  gridOptionWidgetIcon: {
    margin: 0,
  },
};

const translations = defineMessages({
  noAnswer: {
    id: 'course.surveys.ResponseForm.ResponseAnswer.noAnswer',
    defaultMessage: 'Answer is missing. Question was likely created after response was made.',
  },
});

class ResponseAnswer extends React.Component {
  static propTypes = {
    member: PropTypes.string.isRequired,
    index: PropTypes.number.isRequired,
    fields: PropTypes.shape({
      get: PropTypes.func.isRequired,
    }).isRequired,
    disabled: PropTypes.bool.isRequired,
  };

  static renderTextResponseField(question, member, disabled) {
    return (
      <Field
        name={`${member}[text_response]`}
        component={TextField}
        style={styles.textResponse}
        disabled={disabled}
        multiLine
      />
    );
  }

  static renderMultipleResponseOptions(props) {
    const { fields, question, disabled, meta: { dirty, error } } = props;
    const { grid_view: grid, options } = question;

    return (
      <div>
        { dirty && error ? <p style={styles.errorText}>{error}</p> : null }
        <div style={grid ? styles.grid : {}}>
          {
            fields.map((member, index) => {
              const answerOption = fields.get(index);
              const option = options.find(opt =>
                opt.id.toString() === answerOption.question_option_id.toString()
              );
              const widget = (
                <Field
                  name={`${member}[selected]`}
                  component={Checkbox}
                  style={grid ? styles.gridOptionWidget : styles.listOptionWidget}
                  iconStyle={grid ? styles.gridOptionWidgetIcon : {}}
                  disabled={disabled}
                />
              );
              const { option: optionText, image_url: imageUrl } = option;
              return (
                <OptionsListItem
                  key={option.id}
                  {...{ optionText, imageUrl, widget, grid }}
                />
              );
            })
          }
        </div>
      </div>
    );
  }

  static renderMultipleResponseField(question, member, disabled) {
    return (
      <FieldArray
        name={`${member}[options]`}
        component={ResponseAnswer.renderMultipleResponseOptions}
        {...{ question, disabled }}
      />
    );
  }

  static renderMultipleChoiceOptions({ question, disabled, ...props }) {
    const { input: { onChange, value }, meta: { dirty, error } } = props;
    const { grid_view: grid, options } = question;

    return (
      <div>
        { dirty && error ? <p style={styles.errorText}>{error}</p> : null }
        <div style={grid ? styles.grid : {}}>
          { options.map((option) => {
            const { option: optionText, image_url: imageUrl } = option;
            const id = option.id;
            const widget = (
              <RadioButton
                value={id}
                style={grid ? styles.gridOptionWidget : styles.listOptionWidget}
                iconStyle={grid ? styles.gridOptionWidgetIcon : {}}
                onCheck={(event, buttonValue) => onChange(buttonValue)}
                checked={id === value}
                disabled={disabled}
              />
            );
            return (
              <OptionsListItem
                key={option.id}
                {...{ optionText, imageUrl, widget, grid }}
              />
            );
          })}
        </div>
      </div>
    );
  }

  static renderMultipleChoiceField(question, member, disabled) {
    return (
      <Field
        name={`${member}[selected_option]`}
        component={ResponseAnswer.renderMultipleChoiceOptions}
        {...{ question, disabled }}
      />
    );
  }

  render() {
    const { TEXT, MULTIPLE_CHOICE, MULTIPLE_RESPONSE } = questionTypes;
    const { member, index, fields, disabled } = this.props;
    const answer = fields.get(index);
    const question = answer.question;

    if (!question) { return <div />; }

    const renderer = {
      [TEXT]: ResponseAnswer.renderTextResponseField,
      [MULTIPLE_CHOICE]: ResponseAnswer.renderMultipleChoiceField,
      [MULTIPLE_RESPONSE]: ResponseAnswer.renderMultipleResponseField,
    }[question.question_type];
    if (!renderer) { return <div />; }

    return (
      <Card style={styles.answerCard}>
        <CardText>
          <p>{`${index + 1}. ${question.description}`}</p>
          {
            answer.present ?
              <div>
                <Field name={`${member}[${index}][id]`} component="hidden" />
                { renderer(question, member, disabled) }
              </div> :
              <div style={styles.errorText}>
                <FormattedMessage {...translations.noAnswer} />
              </div>
          }
        </CardText>
      </Card>
    );
  }
}

export default ResponseAnswer;
