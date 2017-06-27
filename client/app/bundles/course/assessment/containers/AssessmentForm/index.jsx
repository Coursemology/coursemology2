import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { reduxForm, Field, Form, formValueSelector, change } from 'redux-form';
import { connect } from 'react-redux';
import MenuItem from 'material-ui/MenuItem';
import ConditionList from 'lib/components/course/ConditionList';
import TextField from 'lib/components/redux-form/TextField';
import RichTextField from 'lib/components/redux-form/RichTextField';
import Toggle from 'lib/components/redux-form/Toggle';
import SelectField from 'lib/components/redux-form/SelectField';
import formTranslations from 'lib/translations/form';
import DateTimePicker from 'lib/components/redux-form/DateTimePicker';
import translations from './translations.intl';
import { formNames } from '../../constants';
import MaterialUploader from '../MaterialUploader';

const styles = {
  title: {
    width: '100%',
  },
  description: {
    width: '100%',
  },
  flexGroup: {
    display: 'flex',
  },
  flexChild: {
    flex: 1,
    marginLeft: 10,
  },
  toggle: {
    marginTop: 16,
  },
  hint: {
    fontSize: 14,
    marginBottom: 12,
  },
  conditions: {
    marginTop: 24,
  },
};

const validate = (values) => {
  const errors = {};

  const requiredFields = ['title', 'base_exp', 'time_bonus_exp', 'start_at'];
  if (!values.autograded) {
    requiredFields.push('tabbed_view');
  }

  if (values.password_protected) {
    requiredFields.push('password');
  }

  requiredFields.forEach((field) => {
    if (values[field] === undefined || values[field] === '' || values[field] === null) {
      errors[field] = formTranslations.required;
    }
  });

  if (values.start_at && values.end_at && new Date(values.start_at) >= new Date(values.end_at)) {
    errors.end_at = translations.startEndValidationError;
  }

  return errors;
};

class AssessmentForm extends React.Component {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    handleSubmit: PropTypes.func.isRequired,
    start_at: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.instanceOf(Date),
    ]),
    end_at: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.instanceOf(Date),
    ]),
    bonus_end_at: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.instanceOf(Date),
    ]),
    autograded: PropTypes.bool,
    password_protected: PropTypes.bool,
    submitting: PropTypes.bool,
    // Above are props from redux-form.

    onSubmit: PropTypes.func.isRequired,
    // If the Form is in editing mode, `published` button will be displayed.
    editing: PropTypes.bool,
    // if the EXP fields should be displayed
    gamified: PropTypes.bool,
    // If allow to switch between autoraded and manually graded mode.
    modeSwitching: PropTypes.bool,
    folderAttributes: PropTypes.shape({
      folderId: PropTypes.number,
      // See MaterialFormContainer for detailed PropTypes.
      materials: PropTypes.array,
    }),
    // Condtions will be displayed if the attributes are present.
    conditionAttributes: PropTypes.shape({
      new_condition_urls: PropTypes.array,
      conditions: PropTypes.array,
    }),
  };

  static defaultProps = {
    gamified: true,
  }

  onStartAtChange = (_, newStartAt) => {
    const { start_at: startAt, end_at: endAt, bonus_end_at: bonusEndAt, dispatch } = this.props;
    const newStartTime = newStartAt && newStartAt.getTime();
    const oldStartTime = startAt && new Date(startAt).getTime();
    const oldEndTime = endAt && new Date(endAt).getTime();
    const oldBonusTime = bonusEndAt && new Date(bonusEndAt).getTime();

    // Shift end_at time
    if (newStartTime && oldStartTime && oldEndTime && oldStartTime <= oldEndTime) {
      const newEndAt = new Date(oldEndTime + (newStartTime - oldStartTime));
      dispatch(change(formNames.ASSESSMENT, 'end_at', newEndAt));
    }

    // Shift bonus_end_at time
    if (newStartTime && oldStartTime && oldBonusTime && oldStartTime <= oldBonusTime) {
      const newBonusTime = new Date(oldBonusTime + (newStartTime - oldStartTime));
      dispatch(change(formNames.ASSESSMENT, 'bonus_end_at', newBonusTime));
    }
  }

  renderExtraOptions() {
    const { submitting } = this.props;
    if (this.props.autograded) {
      return (
        <div>
          <Field
            name="skippable"
            component={Toggle}
            label={<FormattedMessage {...translations.skippable} />}
            labelPosition="right"
            style={styles.toggle}
            disabled={submitting}
          />
        </div>
      );
    }

    return (
      <div>
        <Field
          name="tabbed_view"
          component={SelectField}
          floatingLabelText={<FormattedMessage {...translations.layout} />}
          floatingLabelFixed
          fullWidth
          type="boolean"
          disabled={submitting}
        >
          <MenuItem
            value={false}
            primaryText={<FormattedMessage {...translations.singlePage} />}
          />
          <MenuItem
            value={true} // eslint-disable-line
            primaryText={<FormattedMessage {...translations.tabbedView} />}
          />
        </Field>
        <Field
          name="delayed_grade_publication"
          component={Toggle}
          label={<FormattedMessage {...translations.delayedGradePublication} />}
          labelPosition="right"
          style={styles.toggle}
          disabled={submitting}
        />
        <div style={styles.hint}>
          <FormattedMessage {...translations.delayedGradePublicationHint} />
        </div>
        <Field
          name="password_protected"
          component={Toggle}
          label={<FormattedMessage {...translations.passwordProtection} />}
          labelPosition="right"
          style={styles.toggle}
          disabled={submitting}
        />
        {
          this.props.password_protected &&
          <Field
            name="password"
            component={TextField}
            hintText={<FormattedMessage {...translations.password} />}
            fullWidth
            autoComplete={false}
            disabled={submitting}
          />
        }
        <div style={styles.hint}>
          <FormattedMessage {...translations.passwordProtectionHint} />
        </div>
      </div>
    );
  }

  render() {
    const { handleSubmit, onSubmit, gamified, modeSwitching, submitting, editing, folderAttributes,
      conditionAttributes } = this.props;

    return (
      <Form onSubmit={handleSubmit(onSubmit)}>
        <Field
          name="title"
          component={TextField}
          floatingLabelText={<FormattedMessage {...translations.title} />}
          style={styles.title}
          disabled={submitting}
        />
        <br />
        <Field
          name="description"
          component={RichTextField}
          label={<FormattedMessage {...translations.description} />}
          style={styles.description}
          disabled={submitting}
        />
        <div style={styles.flexGroup}>
          <Field
            name="start_at"
            component={DateTimePicker}
            floatingLabelText={<FormattedMessage {...translations.startAt} />}
            style={styles.flexChild}
            disabled={submitting}
            afterChange={this.onStartAtChange}
          />
          <Field
            name="end_at"
            component={DateTimePicker}
            floatingLabelText={<FormattedMessage {...translations.endAt} />}
            style={styles.flexChild}
            disabled={submitting}
          />
          {
            gamified &&
            <Field
              name="bonus_end_at"
              component={DateTimePicker}
              floatingLabelText={<FormattedMessage {...translations.bonusEndAt} />}
              style={styles.flexChild}
              disabled={submitting}
            />
          }
        </div>
        {
          gamified &&
          <div style={styles.flexGroup}>
            <Field
              name="base_exp"
              component={TextField}
              floatingLabelText={<FormattedMessage {...translations.baseExp} />}
              type="number"
              style={styles.flexChild}
              disabled={submitting}
            />
            <Field
              name="time_bonus_exp"
              component={TextField}
              floatingLabelText={<FormattedMessage {...translations.timeBonusExp} />}
              type="number"
              style={styles.flexChild}
              disabled={submitting}
            />
          </div>
        }

        {
          editing &&
          <Field
            name="published"
            component={Toggle}
            label={<FormattedMessage {...translations.published} />}
            labelPosition="right"
            style={styles.toggle}
            disabled={submitting}
          />
        }

        <Field
          name="autograded"
          component={Toggle}
          label={
            modeSwitching ? <FormattedMessage {...translations.autograded} /> :
            <FormattedMessage {...translations.modeSwitchingDisabled} />
          }
          labelPosition="right"
          style={styles.toggle}
          disabled={!modeSwitching || submitting}
        />

        {
          modeSwitching &&
          <div style={styles.hint}>
            <FormattedMessage {...translations.autogradedHint} />
          </div>
        }

        {this.renderExtraOptions()}

        <Field
          name="show_private"
          component={Toggle}
          label={<FormattedMessage {...translations.showPrivate} />}
          labelPosition="right"
          style={styles.toggle}
          disabled={submitting}
        />
        <div style={styles.hint}>
          <FormattedMessage {...translations.showPrivateHint} />
        </div>
        <Field
          name="show_evaluation"
          component={Toggle}
          label={<FormattedMessage {...translations.showEvaluation} />}
          labelPosition="right"
          style={styles.toggle}
          disabled={submitting}
        />
        <div style={styles.hint}>
          <FormattedMessage {...translations.showEvaluationHint} />
        </div>

        {
          folderAttributes &&
          <div>
            <br />
            <MaterialUploader
              folderId={folderAttributes.folder_id}
              materials={folderAttributes.materials}
            />
          </div>
        }
        {
          editing && conditionAttributes &&
          <div style={styles.conditions}>
            <ConditionList
              newConditionUrls={conditionAttributes.new_condition_urls}
              conditions={conditionAttributes.conditions}
            />
          </div>
        }
      </Form>
    );
  }
}

const selector = formValueSelector(formNames.ASSESSMENT);
export default connect(state =>
  selector(state, 'start_at', 'end_at', 'bonus_end_at', 'autograded', 'password_protected')
)(
  reduxForm({
    form: formNames.ASSESSMENT,
    validate,
  })(AssessmentForm)
);
