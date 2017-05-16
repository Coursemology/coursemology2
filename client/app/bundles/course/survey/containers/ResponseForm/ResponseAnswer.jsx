import React from 'react';
import PropTypes from 'prop-types';
import { Field } from 'redux-form';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import { RadioButton } from 'material-ui/RadioButton';
import Checkbox from 'material-ui/Checkbox';
import { red500 } from 'material-ui/styles/colors';
import formTranslations from 'lib/translations/form';
import TextField from 'lib/components/redux-form/TextField';
import { questionTypes } from 'course/survey/constants';
import { questionShape } from 'course/survey/propTypes';
import OptionsListItem from 'course/survey/components/OptionsListItem';

const styles = {
  textResponse: {
    width: '100%',
  },
  errorText: {
    color: red500,
  },
  grid: {
    display: 'flex',
    flexWrap: 'wrap',
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

const responseFormTranslations = defineMessages({
  selectAtLeast: {
    id: 'course.surveys.ResponseForm.selectAtLeast',
    defaultMessage: 'Please select at least {count} option(s).',
  },
  selectAtMost: {
    id: 'course.surveys.ResponseForm.selectAtMost',
    defaultMessage: 'Please select at most {count} option(s).',
  },
});

class ResponseAnswer extends React.Component {
  static propTypes = {
    member: PropTypes.string.isRequired,
    question: questionShape,
    disabled: PropTypes.bool.isRequired,

    intl: intlShape,
  };

  static renderMultipleResponseOptions(props) {
    const {
      disabled,
      input: { value, onChange },
      meta: { touched, dirty, error },
      question: { grid_view: grid, options },
    } = props;

    return (
      <div>
        { (dirty || touched) && error ? <p style={styles.errorText}>{error}</p> : null }
        <div style={grid ? styles.grid : {}}>
          {
            options.map((option) => {
              const widget = (
                <Checkbox
                  style={grid ? styles.gridOptionWidget : styles.listOptionWidget}
                  iconStyle={grid ? styles.gridOptionWidgetIcon : {}}
                  disabled={disabled}
                  checked={value.indexOf(option.id) !== -1}
                  onCheck={(event, isChecked) => {
                    const newValue = [...value];
                    if (isChecked) {
                      newValue.push(option.id);
                    } else {
                      newValue.splice(newValue.indexOf(option.id), 1);
                    }
                    return onChange(newValue);
                  }}
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

  static renderMultipleChoiceOptions(props) {
    const {
      disabled,
      input: { onChange, value },
      meta: { touched, dirty, error },
      question: { grid_view: grid, options },
    } = props;
    const selectedOption = value && value.length > 0 && value[0];

    return (
      <div>
        { (dirty || touched) && error ? <p style={styles.errorText}>{error}</p> : null }
        <div style={grid ? styles.grid : {}}>
          { options.map((option) => {
            const { option: optionText, image_url: imageUrl } = option;
            const id = option.id;
            const widget = (
              <RadioButton
                value={id}
                style={grid ? styles.gridOptionWidget : styles.listOptionWidget}
                iconStyle={grid ? styles.gridOptionWidgetIcon : {}}
                onCheck={(event, buttonValue) => onChange([buttonValue])}
                checked={id === selectedOption}
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

  renderMultipleResponseField() {
    const { member, question, disabled, intl } = this.props;
    const { required, min_options: minOptions, max_options: maxOptions } = question;

    const checkQuantitySelected = (options) => {
      const optionCount = options.length;

      // Skip checks if question is not required and student doesn't intend to answer it.
      if (!required && optionCount === 0) { return undefined; }

      if (minOptions && optionCount < minOptions) {
        return intl.formatMessage(responseFormTranslations.selectAtLeast, { count: minOptions });
      }
      if (maxOptions && optionCount > maxOptions) {
        return intl.formatMessage(responseFormTranslations.selectAtMost, { count: maxOptions });
      }

      return undefined;
    };

    return (
      <Field
        name={`${member}.answer.question_option_ids`}
        component={ResponseAnswer.renderMultipleResponseOptions}
        validate={checkQuantitySelected}
        {...{ question, disabled }}
      />
    );
  }

  renderMultipleChoiceField() {
    const { member, question, disabled, intl } = this.props;
    const checkRequired = value => ((question.required && (!value || value.length < 1)) ?
      intl.formatMessage(responseFormTranslations.selectAtLeast, { count: 1 }) : undefined);

    return (
      <Field
        name={`${member}.answer.question_option_ids`}
        component={ResponseAnswer.renderMultipleChoiceOptions}
        validate={checkRequired}
        {...{ question, disabled }}
      />
    );
  }

  renderTextResponseField() {
    const { member, question, disabled } = this.props;
    const checkRequired = value => ((question.required && !value) ? formTranslations.required : undefined);

    return (
      <Field
        name={`${member}.answer.text_response`}
        component={TextField}
        style={styles.textResponse}
        disabled={disabled}
        validate={checkRequired}
        multiLine
      />
    );
  }

  render() {
    const { TEXT, MULTIPLE_CHOICE, MULTIPLE_RESPONSE } = questionTypes;
    const { question } = this.props;
    if (!question) { return <div />; }

    const renderer = {
      [TEXT]: this.renderTextResponseField,
      [MULTIPLE_CHOICE]: this.renderMultipleChoiceField,
      [MULTIPLE_RESPONSE]: this.renderMultipleResponseField,
    }[question.question_type];
    if (!renderer) { return <div />; }

    return renderer.call(this);
  }
}

export default injectIntl(ResponseAnswer);
