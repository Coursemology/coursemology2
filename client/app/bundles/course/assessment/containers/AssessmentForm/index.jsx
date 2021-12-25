import { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import MenuItem from 'material-ui/MenuItem';
import PropTypes from 'prop-types';
import { change, Field, Form, formValueSelector, reduxForm } from 'redux-form';

import ConditionList from 'lib/components/course/ConditionList';
import ErrorText, { errorProps } from 'lib/components/ErrorText';
import DateTimePicker from 'lib/components/redux-form/DateTimePicker';
import RichTextField from 'lib/components/redux-form/RichTextField';
import SelectField from 'lib/components/redux-form/SelectField';
import TextField from 'lib/components/redux-form/TextField';
import Toggle from 'lib/components/redux-form/Toggle';
import formTranslations from 'lib/translations/form';
import { achievementTypesConditionAttributes, typeMaterial } from 'lib/types';

import { formNames } from '../../constants';
import MaterialUploader from '../MaterialUploader';

import { fetchTabs } from './actions';
import translations from './translations.intl';

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
          component={Toggle}
          disabled={submitting}
          label={<FormattedMessage {...translations.enableRandomization} />}
          labelPosition="right"
          name="randomization"
          parse={Boolean}
          style={styles.toggle}
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
            component={Toggle}
            disabled={submitting}
            label={<FormattedMessage {...translations.skippable} />}
            labelPosition="right"
            name="skippable"
            parse={Boolean}
            style={styles.toggle}
          />
          <Field
            component={Toggle}
            disabled={submitting}
            label={
              <FormattedMessage {...translations.allowPartialSubmission} />
            }
            labelPosition="right"
            name="allow_partial_submission"
            parse={Boolean}
            style={styles.toggle}
          />
          <Field
            component={Toggle}
            disabled={submitting}
            label={<FormattedMessage {...translations.showMcqAnswer} />}
            labelPosition="right"
            name="show_mcq_answer"
            parse={Boolean}
            style={styles.toggle}
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
          component={SelectField}
          disabled={submitting}
          floatingLabelFixed={true}
          floatingLabelText={<FormattedMessage {...translations.layout} />}
          fullWidth={true}
          name="tabbed_view"
          type="boolean"
        >
          <MenuItem
            primaryText={<FormattedMessage {...translations.singlePage} />}
            value={false}
          />
          <MenuItem
            primaryText={<FormattedMessage {...translations.tabbedView} />}
            value={true}
          />
        </Field>
        <Field
          component={Toggle}
          disabled={submitting}
          label={<FormattedMessage {...translations.delayedGradePublication} />}
          labelPosition="right"
          name="delayed_grade_publication"
          parse={Boolean}
          style={styles.toggle}
        />
        <div style={styles.hint}>
          <FormattedMessage {...translations.delayedGradePublicationHint} />
        </div>
        <Field
          component={Toggle}
          disabled={submitting}
          label={<FormattedMessage {...translations.passwordProtection} />}
          labelPosition="right"
          name="password_protected"
          parse={Boolean}
          style={styles.toggle}
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
          autoComplete="off"
          component={TextField}
          disabled={submitting}
          fullWidth={true}
          hintText={<FormattedMessage {...translations.viewPassword} />}
          name="view_password"
        />
        <div style={styles.hint}>
          <FormattedMessage {...translations.viewPasswordHint} />
        </div>

        <Field
          autoComplete="off"
          component={TextField}
          disabled={submitting}
          fullWidth={true}
          hintText={<FormattedMessage {...translations.sessionPassword} />}
          name="session_password"
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
        component={SelectField}
        disabled={editing && submitting}
        floatingLabelFixed={true}
        floatingLabelText={<FormattedMessage {...translations.tab} />}
        name="tab_id"
        style={styles.flexChild}
      >
        {tabs &&
          tabs.map((tab) => (
            <MenuItem
              key={tab.tab_id}
              primaryText={tab.title}
              value={tab.tab_id}
            />
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
            component={TextField}
            disabled={submitting}
            floatingLabelText={<FormattedMessage {...translations.title} />}
            name="title"
            style={styles.flexChild}
          />
          {editing && this.renderTabs()}
        </div>
        <br />
        <Field
          component={RichTextField}
          disabled={submitting}
          label={<FormattedMessage {...translations.description} />}
          name="description"
        />
        <div style={styles.flexGroup}>
          <Field
            afterChange={this.onStartAtChange}
            component={DateTimePicker}
            disabled={submitting}
            floatingLabelText={<FormattedMessage {...translations.startAt} />}
            name="start_at"
            style={styles.flexChild}
          />
          <Field
            clearable={true}
            component={DateTimePicker}
            disabled={submitting}
            floatingLabelText={<FormattedMessage {...translations.endAt} />}
            name="end_at"
            style={styles.flexChild}
          />
          {gamified && (
            <Field
              clearable={true}
              component={DateTimePicker}
              disabled={submitting}
              floatingLabelText={
                <FormattedMessage {...translations.bonusEndAt} />
              }
              name="bonus_end_at"
              style={styles.flexChild}
            />
          )}
        </div>
        {gamified && (
          <div style={styles.flexGroup}>
            <Field
              component={TextField}
              disabled={submitting}
              floatingLabelText={<FormattedMessage {...translations.baseExp} />}
              name="base_exp"
              onWheel={(event) => event.currentTarget.blur()}
              style={styles.flexChild}
              type="number"
            />
            <Field
              component={TextField}
              disabled={submitting}
              floatingLabelText={
                <FormattedMessage {...translations.timeBonusExp} />
              }
              name="time_bonus_exp"
              onWheel={(event) => event.currentTarget.blur()}
              style={styles.flexChild}
              type="number"
            />
          </div>
        )}

        {editing && (
          <Field
            component={Toggle}
            disabled={submitting}
            label={<FormattedMessage {...translations.published} />}
            labelPosition="right"
            name="published"
            parse={Boolean}
            style={styles.toggle}
          />
        )}

        <Field
          component={Toggle}
          disabled={!modeSwitching || submitting}
          label={
            modeSwitching ? (
              <FormattedMessage {...translations.autograded} />
            ) : (
              <FormattedMessage {...translations.modeSwitchingDisabled} />
            )
          }
          labelPosition="right"
          name="autograded"
          parse={Boolean}
          style={styles.toggle}
        />

        {modeSwitching && (
          <div style={styles.hint}>
            <FormattedMessage {...translations.autogradedHint} />
          </div>
        )}

        <Field
          component={Toggle}
          disabled={submitting}
          label={
            <FormattedMessage
              {...translations.blockStudentViewingAfterSubmitted}
            />
          }
          labelPosition="right"
          name="block_student_viewing_after_submitted"
          parse={Boolean}
          style={styles.toggle}
        />

        {this.renderExtraOptions()}

        <Field
          component={Toggle}
          disabled={submitting}
          label={<FormattedMessage {...translations.showMcqMrqSolution} />}
          labelPosition="right"
          name="show_mcq_mrq_solution"
          parse={Boolean}
          style={styles.toggle}
        />
        <div style={styles.hint}>
          <FormattedMessage {...translations.showMcqMrqSolutionHint} />
        </div>

        <div style={styles.conditions}>
          <FormattedMessage {...translations.autogradeTestCasesHint} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <Field
            component={Toggle}
            disabled={submitting}
            label={<FormattedMessage {...translations.usePublic} />}
            labelPosition="right"
            name="use_public"
            parse={Boolean}
            style={styles.flexChild}
          />
          <Field
            component={Toggle}
            disabled={submitting}
            label={<FormattedMessage {...translations.usePrivate} />}
            labelPosition="right"
            name="use_private"
            parse={Boolean}
            style={styles.flexChild}
          />
          <Field
            component={Toggle}
            disabled={submitting}
            label={<FormattedMessage {...translations.useEvaluation} />}
            labelPosition="right"
            name="use_evaluation"
            parse={Boolean}
            style={styles.flexChild}
          />
        </div>

        <Field
          component={Toggle}
          disabled={submitting}
          label={<FormattedMessage {...translations.showPrivate} />}
          labelPosition="right"
          name="show_private"
          parse={Boolean}
          style={styles.toggle}
        />
        <div style={styles.hint}>
          <FormattedMessage {...translations.showPrivateHint} />
        </div>
        <Field
          component={Toggle}
          disabled={submitting}
          label={<FormattedMessage {...translations.showEvaluation} />}
          labelPosition="right"
          name="show_evaluation"
          parse={Boolean}
          style={styles.toggle}
        />
        <div style={styles.hint}>
          <FormattedMessage {...translations.showEvaluationHint} />
        </div>

        {randomizationAllowed && this.renderEnableRandomizationField()}

        {showPersonalizedTimelineFeatures && (
          <>
            <Field
              component={Toggle}
              disabled={submitting}
              label={<FormattedMessage {...translations.hasPersonalTimes} />}
              labelPosition="right"
              name="has_personal_times"
              parse={Boolean}
              style={styles.toggle}
            />
            <div style={styles.hint}>
              <FormattedMessage {...translations.hasPersonalTimesHint} />
            </div>
            <Field
              component={Toggle}
              disabled={submitting}
              label={
                <FormattedMessage {...translations.affectsPersonalTimes} />
              }
              labelPosition="right"
              name="affects_personal_times"
              parse={Boolean}
              style={styles.toggle}
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
              conditions={conditionAttributes.conditions}
              newConditionUrls={conditionAttributes.new_condition_urls}
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
