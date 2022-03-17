import { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { reduxForm, Field, Form, formValueSelector, change } from 'redux-form';
import { connect } from 'react-redux';
import { MenuItem } from '@mui/material';
import ErrorText, { errorProps } from 'lib/components/ErrorText';
import ConditionList from 'lib/components/course/ConditionList';
import renderTextField from 'lib/components/redux-form/TextField';
import RichTextField from 'lib/components/redux-form/RichTextField';
import renderToggleField from 'lib/components/redux-form/Toggle';
import renderSelectField from 'lib/components/redux-form/SelectField';
import formTranslations from 'lib/translations/form';
import DateTimePicker from 'lib/components/redux-form/DateTimePicker';
import { achievementTypesConditionAttributes, typeMaterial } from 'lib/types';
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

const isFieldBlank = (str) => str === undefined || str === '' || str === null;

const isEndDatePassedStartDate = (startAt, endAt) =>
  startAt && endAt && new Date(startAt) >= new Date(endAt);

const isTestCaseChosen = (usePublic, usePrivate, useEvaluation) =>
  !(usePublic || usePrivate || useEvaluation);

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
    if (
      isFieldBlank(values.view_password) &&
      isFieldBlank(values.session_password)
    ) {
      errors.password_protected = translations.passwordRequired;
    }
  }

  if (isEndDatePassedStartDate(values.start_at, values.end_at)) {
    errors.end_at = translations.startEndValidationError;
  }

  if (
    isTestCaseChosen(
      values.use_public,
      values.use_private,
      values.use_evaluation,
    )
  ) {
    errors.use_evaluation = translations.noTestCaseChosenError;
  }

  return errors;
};

class AssessmentForm extends Component {
  componentDidMount() {
    const { dispatch, editing } = this.props;
    // TODO: Shift the fetchTabs only when the selection menu is clicked on. This would
    //  prevent unnecessary loading of the tabs every time the assessment form is loaded.
    if (editing) {
      const failureMessage = (
        <FormattedMessage {...translations.fetchTabFailure} />
      );
      dispatch(fetchTabs(failureMessage));
    }
  }

  onStartAtChange = (_, newStartAt) => {
    const {
      start_at: startAt,
      end_at: endAt,
      bonus_end_at: bonusEndAt,
      dispatch,
    } = this.props;
    const newStartTime = newStartAt && newStartAt.getTime();
    const oldStartTime = startAt && new Date(startAt).getTime();
    const oldEndTime = endAt && new Date(endAt).getTime();
    const oldBonusTime = bonusEndAt && new Date(bonusEndAt).getTime();

    // Shift end_at time
    if (
      newStartTime &&
      oldStartTime &&
      oldEndTime &&
      oldStartTime <= oldEndTime
    ) {
      const newEndAt = new Date(oldEndTime + (newStartTime - oldStartTime));
      dispatch(change(formNames.ASSESSMENT, 'end_at', newEndAt));
    }

    // Shift bonus_end_at time
    if (
      newStartTime &&
      oldStartTime &&
      oldBonusTime &&
      oldStartTime <= oldBonusTime
    ) {
      const newBonusTime = new Date(
        oldBonusTime + (newStartTime - oldStartTime),
      );
      dispatch(change(formNames.ASSESSMENT, 'bonus_end_at', newBonusTime));
    }
  };

  renderEnableRandomizationField() {
    const { submitting } = this.props;

    return (
      <>
        <Field
          name="randomization"
          component={renderToggleField}
          parse={Boolean}
          label={<FormattedMessage {...translations.enableRandomization} />}
          style={styles.toggle}
          disabled={submitting}
        />
        <div style={styles.hint}>
          <FormattedMessage {...translations.enableRandomizationHint} />
        </div>
      </>
    );
  }

  renderExtraOptions() {
    const { submitting } = this.props;
    if (this.props.autograded) {
      return (
        <>
          <Field
            name="skippable"
            component={renderToggleField}
            parse={Boolean}
            label={<FormattedMessage {...translations.skippable} />}
            style={styles.toggle}
            disabled={submitting}
          />
          <Field
            name="allow_partial_submission"
            component={renderToggleField}
            parse={Boolean}
            label={
              <FormattedMessage {...translations.allowPartialSubmission} />
            }
            style={styles.toggle}
            disabled={submitting}
          />
          <Field
            name="show_mcq_answer"
            component={renderToggleField}
            parse={Boolean}
            label={<FormattedMessage {...translations.showMcqAnswer} />}
            style={styles.toggle}
            disabled={submitting}
          />
          <div style={styles.hint}>
            <FormattedMessage {...translations.showMcqAnswerHint} />
          </div>
        </>
      );
    }

    return (
      <>
        <Field
          name="tabbed_view"
          component={renderSelectField}
          label={<FormattedMessage {...translations.layout} />}
          type="boolean"
          disabled={submitting}
        >
          <MenuItem value={false}>
            <FormattedMessage {...translations.singlePage} />
          </MenuItem>
          <MenuItem
            // eslint-disable-next-line react/jsx-boolean-value
            value={true}
          >
            <FormattedMessage {...translations.tabbedView} />
          </MenuItem>
        </Field>
        <Field
          name="delayed_grade_publication"
          component={renderToggleField}
          parse={Boolean}
          label={<FormattedMessage {...translations.delayedGradePublication} />}
          style={styles.toggle}
          disabled={submitting}
        />
        <div style={styles.hint}>
          <FormattedMessage {...translations.delayedGradePublicationHint} />
        </div>
        <Field
          name="password_protected"
          component={renderToggleField}
          parse={Boolean}
          label={<FormattedMessage {...translations.passwordProtection} />}
          style={styles.toggle}
          disabled={submitting}
        />

        {this.props.password_protected && this.renderPasswordFields()}
      </>
    );
  }

  renderPasswordFields() {
    const { submitting } = this.props;

    return (
      <div>
        <Field
          name="view_password"
          component={renderTextField}
          placeholder={translations.viewPassword.defaultMessage}
          fullWidth
          autoComplete="off"
          disabled={submitting}
        />
        <div style={styles.hint}>
          <FormattedMessage {...translations.viewPasswordHint} />
        </div>

        <Field
          name="session_password"
          component={renderTextField}
          placeholder={translations.sessionPassword.defaultMessage}
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

  renderTabs() {
    const { tabs, editing, submitting } = this.props;

    return (
      <Field
        name="tab_id"
        component={renderSelectField}
        label={<FormattedMessage {...translations.tab} />}
        disabled={editing && submitting}
      >
        {tabs &&
          tabs.map((tab) => (
            <MenuItem key={tab.tab_id} value={tab.tab_id}>
              {tab.title}
            </MenuItem>
          ))}
      </Field>
    );
  }

  render() {
    const {
      handleSubmit,
      onSubmit,
      gamified,
      showPersonalizedTimelineFeatures,
      modeSwitching,
      submitting,
      editing,
      folderAttributes,
      conditionAttributes,
      randomizationAllowed,
      error,
    } = this.props;

    return (
      <Form onSubmit={handleSubmit(onSubmit)}>
        <ErrorText errors={error} />
        <div style={styles.flexGroup}>
          <Field
            name="title"
            component={renderTextField}
            style={styles.flexChild}
            label={<FormattedMessage {...translations.title} />}
            disabled={submitting}
          />
          {editing && this.renderTabs()}
        </div>
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
            label={<FormattedMessage {...translations.startAt} />}
            style={styles.flexChild}
            disabled={submitting}
            afterChange={this.onStartAtChange}
          />
          <Field
            name="end_at"
            component={DateTimePicker}
            clearable
            label={<FormattedMessage {...translations.endAt} />}
            style={styles.flexChild}
            disabled={submitting}
          />
          {gamified && (
            <Field
              name="bonus_end_at"
              component={DateTimePicker}
              clearable
              label={<FormattedMessage {...translations.bonusEndAt} />}
              style={styles.flexChild}
              disabled={submitting}
            />
          )}
        </div>
        {gamified && (
          <div style={styles.flexGroup}>
            <Field
              name="base_exp"
              component={renderTextField}
              label={<FormattedMessage {...translations.baseExp} />}
              type="number"
              onWheel={(event) => event.currentTarget.blur()}
              style={styles.flexChild}
              disabled={submitting}
            />
            <Field
              name="time_bonus_exp"
              component={renderTextField}
              label={<FormattedMessage {...translations.timeBonusExp} />}
              type="number"
              onWheel={(event) => event.currentTarget.blur()}
              style={styles.flexChild}
              disabled={submitting}
            />
          </div>
        )}

        {editing && (
          <Field
            name="published"
            component={renderToggleField}
            parse={Boolean}
            label={<FormattedMessage {...translations.published} />}
            style={styles.toggle}
            disabled={submitting}
          />
        )}

        <Field
          name="autograded"
          component={renderToggleField}
          parse={Boolean}
          label={
            modeSwitching ? (
              <FormattedMessage {...translations.autograded} />
            ) : (
              <FormattedMessage {...translations.modeSwitchingDisabled} />
            )
          }
          style={styles.toggle}
          disabled={!modeSwitching || submitting}
        />

        {modeSwitching && (
          <div style={styles.hint}>
            <FormattedMessage {...translations.autogradedHint} />
          </div>
        )}

        <Field
          name="block_student_viewing_after_submitted"
          component={renderToggleField}
          parse={Boolean}
          label={
            <FormattedMessage
              {...translations.blockStudentViewingAfterSubmitted}
            />
          }
          style={styles.toggle}
          disabled={submitting}
        />

        {this.renderExtraOptions()}

        <Field
          name="show_mcq_mrq_solution"
          component={renderToggleField}
          parse={Boolean}
          label={<FormattedMessage {...translations.showMcqMrqSolution} />}
          style={styles.toggle}
          disabled={submitting}
        />
        <div style={styles.hint}>
          <FormattedMessage {...translations.showMcqMrqSolutionHint} />
        </div>

        <div style={styles.conditions}>
          <FormattedMessage {...translations.autogradeTestCasesHint} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <Field
            name="use_public"
            component={renderToggleField}
            parse={Boolean}
            label={<FormattedMessage {...translations.usePublic} />}
            style={styles.flexChild}
            disabled={submitting}
          />
          <Field
            name="use_private"
            component={renderToggleField}
            parse={Boolean}
            label={<FormattedMessage {...translations.usePrivate} />}
            style={styles.flexChild}
            disabled={submitting}
          />
          <Field
            name="use_evaluation"
            component={renderToggleField}
            parse={Boolean}
            label={<FormattedMessage {...translations.useEvaluation} />}
            style={styles.flexChild}
            disabled={submitting}
          />
        </div>

        <Field
          name="show_private"
          component={renderToggleField}
          parse={Boolean}
          label={<FormattedMessage {...translations.showPrivate} />}
          style={styles.toggle}
          disabled={submitting}
        />
        <div style={styles.hint}>
          <FormattedMessage {...translations.showPrivateHint} />
        </div>
        <Field
          name="show_evaluation"
          component={renderToggleField}
          parse={Boolean}
          label={<FormattedMessage {...translations.showEvaluation} />}
          style={styles.toggle}
          disabled={submitting}
        />
        <div style={styles.hint}>
          <FormattedMessage {...translations.showEvaluationHint} />
        </div>

        {randomizationAllowed && this.renderEnableRandomizationField()}

        {showPersonalizedTimelineFeatures && (
          <>
            <Field
              name="has_personal_times"
              component={renderToggleField}
              parse={Boolean}
              label={<FormattedMessage {...translations.hasPersonalTimes} />}
              style={styles.toggle}
              disabled={submitting}
            />
            <div style={styles.hint}>
              <FormattedMessage {...translations.hasPersonalTimesHint} />
            </div>
            <Field
              name="affects_personal_times"
              component={renderToggleField}
              parse={Boolean}
              label={
                <FormattedMessage {...translations.affectsPersonalTimes} />
              }
              style={styles.toggle}
              disabled={submitting}
            />
            <div style={styles.hint}>
              <FormattedMessage {...translations.affectsPersonalTimesHint} />
            </div>
          </>
        )}

        {folderAttributes && (
          <>
            <br />
            <MaterialUploader
              enableMaterialsAction={folderAttributes.enable_materials_action}
              folderId={folderAttributes.folder_id}
              materials={folderAttributes.materials}
            />
          </>
        )}
        {editing && conditionAttributes && (
          <div style={styles.conditions}>
            <ConditionList
              newConditionUrls={conditionAttributes.new_condition_urls}
              conditions={conditionAttributes.conditions}
            />
          </div>
        )}
      </Form>
    );
  }
}

AssessmentForm.defaultProps = {
  gamified: true,
};

AssessmentForm.propTypes = {
  dispatch: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  start_at: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
  end_at: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
  bonus_end_at: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.instanceOf(Date),
  ]),
  autograded: PropTypes.bool,
  password_protected: PropTypes.bool,
  showPersonalizedTimelineFeatures: PropTypes.bool,
  submitting: PropTypes.bool,
  tabs: PropTypes.arrayOf(
    PropTypes.shape({
      tab_id: PropTypes.number,
      title: PropTypes.string,
    }),
  ),
  // If randomization is enabled for the assessment
  randomization: PropTypes.bool,
  error: errorProps,
  // Above are props from redux-form.

  onSubmit: PropTypes.func.isRequired,
  // If the Form is in editing mode, `published` button will be displayed.
  editing: PropTypes.bool,
  // if the EXP fields should be displayed
  gamified: PropTypes.bool,
  // If the personalized timeline fields should be displayed
  show_personalized_timeline_features: PropTypes.bool,
  // If randomization is allowed for assessments in the current course
  randomizationAllowed: PropTypes.bool,
  // If allow to switch between autoraded and manually graded mode.
  modeSwitching: PropTypes.bool,
  folderAttributes: PropTypes.shape({
    folder_id: PropTypes.number,
    // If any action (upload, delete and download) of the materials
    enable_materials_action: PropTypes.bool,
    // See MaterialFormContainer for detailed PropTypes.
    materials: typeMaterial,
  }),
  // Condtions will be displayed if the attributes are present.
  conditionAttributes: achievementTypesConditionAttributes,
};

const formSelector = formValueSelector(formNames.ASSESSMENT);

function mapStateToProps(state) {
  return {
    // Load all tabs if data is loaded, otherwise fall back to current assessment tab.
    tabs: state.editPage.tabs || formSelector(state, 'tabs'),
    ...formSelector(
      state,
      'start_at',
      'end_at',
      'bonus_end_at',
      'autograded',
      'password_protected',
    ),
  };
}

export default connect(mapStateToProps)(
  reduxForm({
    form: formNames.ASSESSMENT,
    validate,
  })(AssessmentForm),
);
