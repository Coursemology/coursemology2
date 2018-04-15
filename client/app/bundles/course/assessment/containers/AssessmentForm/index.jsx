import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { reduxForm, Field, Form, formValueSelector, change } from 'redux-form';
import { connect } from 'react-redux';
import MenuItem from 'material-ui/MenuItem';
import ErrorText, { errorProps } from 'lib/components/ErrorText';
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
import { fetchTabs } from './actions';

const styles = {
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

const isFieldBlank = str => str === undefined || str === '' || str === null;

const isEndDatePassedStartDate = (startAt, endAt) => startAt && endAt && new Date(startAt) >= new Date(endAt);

const validate = (values) => {
  const errors = {};

  const requiredFields = ['title', 'base_exp', 'time_bonus_exp', 'start_at'];
  if (!values.autograded) {
    requiredFields.push('tabbed_view');
  }

  requiredFields.forEach((field) => {
    if (isFieldBlank(values[field])) {
      errors[field] = formTranslations.required;
    }
  });

  if (values.password_protected) {
    if (isFieldBlank(values.view_password) && isFieldBlank(values.session_password)) {
      errors.password_protected = translations.passwordRequired;
    }
  }

  if (isEndDatePassedStartDate(values.start_at, values.end_at)) {
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
    tabs: PropTypes.arrayOf(PropTypes.shape({
      tab_id: PropTypes.number,
      title: PropTypes.string,
    })),
    error: errorProps,
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

  componentDidMount() {
    const { dispatch, editing } = this.props;
    // TODO: Shift the fetchTabs only when the selection menu is clicked on. This would
    //  prevent unnecessary loading of the tabs every time the assessment form is loaded.
    if (editing) {
      const failureMessage = <FormattedMessage {...translations.fetchTabFailure} />;
      dispatch(fetchTabs(failureMessage));
    }
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

  renderTabs() {
    const { tabs, editing, submitting } = this.props;

    return (
      <Field
        name="tab_id"
        component={SelectField}
        style={styles.flexChild}
        floatingLabelText={<FormattedMessage {...translations.tab} />}
        floatingLabelFixed
        disabled={editing && submitting}
      >
        {tabs && tabs.map(tab => (
          <MenuItem
            key={tab.tab_id}
            value={tab.tab_id}
            primaryText={tab.title}
          />
        ))}
      </Field>
    );
  }

  renderPasswordFields() {
    const { submitting } = this.props;

    return (
      <div>
        <Field
          name="view_password"
          component={TextField}
          hintText={<FormattedMessage {...translations.viewPassword} />}
          fullWidth
          autoComplete="off"
          disabled={submitting}
        />
        <div style={styles.hint}>
          <FormattedMessage {...translations.viewPasswordHint} />
        </div>

        <Field
          name="session_password"
          component={TextField}
          hintText={<FormattedMessage {...translations.sessionPassword} />}
          fullWidth
          autoComplete="off"
          disabled={submitting}
        />
        <div style={styles.hint}>
          <FormattedMessage {...translations.sessionPasswordHint} />
        </div>
      </div>
    );
  }

  renderExtraOptions() {
    const { submitting } = this.props;
    if (this.props.autograded) {
      return (
        <Field
          name="skippable"
          component={Toggle}
          parse={Boolean}
          label={<FormattedMessage {...translations.skippable} />}
          labelPosition="right"
          style={styles.toggle}
          disabled={submitting}
        />
      );
    }

    return (
      <React.Fragment>
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
          parse={Boolean}
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
          parse={Boolean}
          label={<FormattedMessage {...translations.passwordProtection} />}
          labelPosition="right"
          style={styles.toggle}
          disabled={submitting}
        />

        {this.props.password_protected && this.renderPasswordFields()}
      </React.Fragment>
    );
  }

  render() {
    const { handleSubmit, onSubmit, gamified, modeSwitching, submitting, editing, folderAttributes,
      conditionAttributes, error } = this.props;

    return (
      <Form onSubmit={handleSubmit(onSubmit)}>
        <ErrorText errors={error} />
        <div style={styles.flexGroup}>
          <Field
            name="title"
            component={TextField}
            style={styles.flexChild}
            floatingLabelText={<FormattedMessage {...translations.title} />}
            disabled={submitting}
          />
          {editing && this.renderTabs()}
        </div>
        <br />
        <Field
          name="description"
          component={RichTextField}
          label={<FormattedMessage {...translations.description} />}
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
            parse={Boolean}
            label={<FormattedMessage {...translations.published} />}
            labelPosition="right"
            style={styles.toggle}
            disabled={submitting}
          />
        }

        <Field
          name="autograded"
          component={Toggle}
          parse={Boolean}
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
          parse={Boolean}
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
          parse={Boolean}
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
          <React.Fragment>
            <br />
            <MaterialUploader
              folderId={folderAttributes.folder_id}
              materials={folderAttributes.materials}
            />
          </React.Fragment>
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

const formSelector = formValueSelector(formNames.ASSESSMENT);

function mapStateToProps(state) {
  return {
    // Load all tabs if data is loaded, otherwise fall back to current assessment tab.
    tabs: state.editPage.tabs || formSelector(state, 'tabs'),
    ...formSelector(state, 'start_at', 'end_at', 'bonus_end_at', 'autograded', 'password_protected'),
  };
}

export default connect(mapStateToProps)(
  reduxForm({
    form: formNames.ASSESSMENT,
    validate,
  })(AssessmentForm)
);
