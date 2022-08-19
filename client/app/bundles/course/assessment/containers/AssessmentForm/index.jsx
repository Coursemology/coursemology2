/* eslint-disable camelcase */
import { useEffect } from 'react';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { yupResolver } from '@hookform/resolvers/yup';
import { Controller, useForm } from 'react-hook-form';
import * as yup from 'yup';
import FormDateTimePickerField from 'lib/components/form/fields/DateTimePickerField';
import FormRichTextField from 'lib/components/form/fields/RichTextField';
import FormSelectField from 'lib/components/form/fields/SelectField';
import FormTextField from 'lib/components/form/fields/TextField';
import FormToggleField from 'lib/components/form/fields/ToggleField';
import ErrorText from 'lib/components/ErrorText';
import ConditionList from 'lib/components/course/ConditionList';
import formTranslations from 'lib/translations/form';
import { achievementTypesConditionAttributes, typeMaterial } from 'lib/types';
import ReactTooltip from 'react-tooltip';
import t from './translations.intl';
import MaterialUploader from '../MaterialUploader';
import { fetchTabs } from './actions';
import Section from 'lib/components/layouts/Section';

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

const validationSchema = yup.object({
  title: yup.string().required(formTranslations.required),
  tab_id: yup.number(),
  description: yup.string(),
  start_at: yup
    .date()
    .nullable()
    .typeError(formTranslations.invalidDate)
    .required(formTranslations.required),
  end_at: yup
    .date()
    .nullable()
    .typeError(formTranslations.invalidDate)
    .min(yup.ref('start_at'), t.startEndValidationError),
  bonus_end_at: yup
    .date()
    .nullable()
    .typeError(formTranslations.invalidDate)
    .min(yup.ref('start_at'), t.startEndValidationError),
  base_exp: yup
    .number()
    .typeError(formTranslations.required)
    .required(formTranslations.required),
  time_bonus_exp: yup
    .number()
    .nullable(true)
    .transform((_, val) => (val === Number(val) ? val : null)),
  published: yup.bool(),
  autograded: yup.bool(),
  block_student_viewing_after_submitted: yup.bool(),
  skippable: yup.bool(),
  allow_partial_submission: yup.bool(),
  show_mcq_answer: yup.bool(),
  tabbed_view: yup.bool().when('autograded', {
    is: false,
    then: yup.bool().required(formTranslations.required),
  }),
  delayed_grade_publication: yup.bool(),
  password_protected: yup
    .bool()
    .when(
      ['view_password', 'session_password'],
      (view_password, session_password, schema) =>
        schema.test({
          test: (password_protected) =>
            // Check if there is at least 1 password type when password_protectd
            // is enabled.
            password_protected ? session_password || view_password : true,
          message: t.passwordRequired,
        }),
    ),
  view_password: yup.string().nullable(),
  session_password: yup.string().nullable(),
  show_mcq_mrq_solution: yup.bool(),
  use_public: yup.bool(),
  use_private: yup.bool(),
  use_evaluation: yup
    .bool()
    .when(['use_public', 'use_private'], (use_public, use_private, schema) =>
      schema.test({
        // Check if there is at least 1 selected test case.
        test: (use_evaluation) => use_public || use_private || use_evaluation,
        message: t.noTestCaseChosenError,
      }),
    ),
  show_private: yup.bool(),
  show_evaluation: yup.bool(),
  randomization: yup.bool(),
  has_personal_times: yup.bool(),
  affects_personal_times: yup.bool(),
});

const AssessmentForm = (props) => {
  const {
    conditionAttributes,
    containsCodaveri,
    disabled,
    dispatch,
    editing,
    gamified,
    folderAttributes,
    initialValues,
    modeSwitching,
    onSubmit,
    randomizationAllowed,
    showPersonalizedTimelineFeatures,
    tabs,
    intl,
  } = props;
  const {
    control,
    handleSubmit,
    setError,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: initialValues,
    resolver: yupResolver(validationSchema),
  });
  const autograded = watch('autograded');
  const passwordProtected = watch('password_protected');

  // Load all tabs if data is loaded, otherwise fall back to current assessment tab.
  const loadedTabs = tabs || watch('tabs');

  useEffect(() => {
    if (editing) {
      const failureMessage = intl.formatMessage(t.fetchTabFailure);
      dispatch(fetchTabs(failureMessage));
    }
  }, [dispatch]);

  const autogradedToggleTooltip = containsCodaveri
    ? intl.formatMessage(t.containsCodaveriQuestion)
    : intl.formatMessage(t.modeSwitchingDisabled);

  const renderPasswordFields = () => (
    <div>
      <Controller
        name="view_password"
        control={control}
        render={({ field, fieldState }) => (
          <FormTextField
            field={field}
            fieldState={fieldState}
            disabled={disabled}
            placeholder={intl.formatMessage(t.viewPassword)}
            fullWidth
            InputLabelProps={{
              shrink: true,
            }}
            renderIf={passwordProtected}
            required
            style={styles.flexChild}
            variant="standard"
          />
        )}
      />
      <div style={styles.hint}>{intl.formatMessage(t.viewPasswordHint)}</div>

      <Controller
        name="session_password"
        control={control}
        render={({ field, fieldState }) => (
          <FormTextField
            field={field}
            fieldState={fieldState}
            disabled={disabled}
            placeholder={intl.formatMessage(t.sessionPassword)}
            fullWidth
            InputLabelProps={{
              shrink: true,
            }}
            renderIf={passwordProtected}
            required
            style={styles.flexChild}
            variant="standard"
          />
        )}
      />
      <div style={styles.hint}>{intl.formatMessage(t.sessionPasswordHint)}</div>
    </div>
  );

  const renderTabs = () => {
    if (!loadedTabs) {
      return null;
    }

    const options = loadedTabs.map((tab) => ({
      value: tab.tab_id,
      label: tab.title,
    }));
    return (
      <Controller
        name="tab_id"
        control={control}
        render={({ field, fieldState }) => (
          <FormSelectField
            field={field}
            fieldState={fieldState}
            disabled={disabled}
            label={intl.formatMessage(t.tab)}
            options={options}
          />
        )}
      />
    );
  };

  return (
    <form
      encType="multipart/form-data"
      id="assessment-form"
      noValidate
      onSubmit={handleSubmit((data) => onSubmit(data, setError))}
    >
      <ErrorText errors={errors} />

      <Section title={intl.formatMessage(t.assessmentDetails)}>
        <div style={styles.flexGroup}>
          <Controller
            name="title"
            control={control}
            render={({ field, fieldState }) => (
              <FormTextField
                field={field}
                fieldState={fieldState}
                disabled={disabled}
                label={intl.formatMessage(t.title)}
                fullWidth
                InputLabelProps={{
                  shrink: true,
                }}
                required
                style={styles.flexChild}
                variant="standard"
              />
            )}
          />
        </div>

        <div style={styles.flexGroup}>
          <Controller
            name="start_at"
            control={control}
            render={({ field, fieldState }) => (
              <FormDateTimePickerField
                field={field}
                fieldState={fieldState}
                disabled={disabled}
                label={intl.formatMessage(t.startAt)}
                style={styles.flexChild}
              />
            )}
          />
          <Controller
            name="end_at"
            control={control}
            render={({ field, fieldState }) => (
              <FormDateTimePickerField
                field={field}
                fieldState={fieldState}
                disabled={disabled}
                label={intl.formatMessage(t.endAt)}
                style={styles.flexChild}
              />
            )}
          />
          {gamified && (
            <Controller
              name="bonus_end_at"
              control={control}
              render={({ field, fieldState }) => (
                <FormDateTimePickerField
                  field={field}
                  fieldState={fieldState}
                  disabled={disabled}
                  label={intl.formatMessage(t.bonusEndAt)}
                  style={styles.flexChild}
                />
              )}
            />
          )}
        </div>

        <Controller
          name="description"
          control={control}
          render={({ field, fieldState }) => (
            <FormRichTextField
              field={field}
              fieldState={fieldState}
              disabled={disabled}
              label={intl.formatMessage(t.description)}
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
              variant="standard"
            />
          )}
        />

        {editing && (
          <Controller
            name="published"
            control={control}
            render={({ field, fieldState }) => (
              <FormToggleField
                field={field}
                fieldState={fieldState}
                disabled={disabled}
                label={intl.formatMessage(t.published)}
                style={styles.toggle}
              />
            )}
          />
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
      </Section>

      <Section title={intl.formatMessage(t.gamification)}>
        {gamified && (
          <div style={styles.flexGroup}>
            <Controller
              name="base_exp"
              control={control}
              render={({ field, fieldState }) => (
                <FormTextField
                  field={field}
                  fieldState={fieldState}
                  disabled={disabled}
                  fullWidth
                  label={intl.formatMessage(t.baseExp)}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  onWheel={(event) => event.currentTarget.blur()}
                  style={styles.flexChild}
                  type="number"
                  variant="standard"
                />
              )}
            />
            <Controller
              name="time_bonus_exp"
              control={control}
              render={({ field, fieldState }) => (
                <FormTextField
                  field={field}
                  fieldState={fieldState}
                  disabled={disabled}
                  fullWidth
                  label={intl.formatMessage(t.timeBonusExp)}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  onWheel={(event) => event.currentTarget.blur()}
                  style={styles.flexChild}
                  type="number"
                  variant="standard"
                />
              )}
            />
          </div>
        )}

        {editing && conditionAttributes && (
          <div style={styles.conditions}>
            <ConditionList
              newConditionUrls={conditionAttributes.new_condition_urls}
              conditions={conditionAttributes.conditions}
            />
          </div>
        )}
      </Section>

      <Section title={intl.formatMessage(t.grading)}>
        <ReactTooltip id="autograde-toggle">
          {autogradedToggleTooltip}
        </ReactTooltip>
        <div
          data-tip
          data-for="autograde-toggle"
          data-tip-disable={!containsCodaveri && modeSwitching}
        >
          <Controller
            name="autograded"
            control={control}
            render={({ field, fieldState }) => (
              <FormToggleField
                field={field}
                fieldState={fieldState}
                disabled={containsCodaveri || !modeSwitching || disabled}
                label={intl.formatMessage(t.autograded)}
                style={styles.toggle}
              />
            )}
          />
        </div>

        {modeSwitching && !containsCodaveri && (
          <div style={styles.hint}>{intl.formatMessage(t.autogradedHint)}</div>
        )}

        <div style={styles.conditions}>
          {intl.formatMessage(t.autogradeTestCasesHint)}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <Controller
            name="use_public"
            control={control}
            render={({ field, fieldState }) => (
              <FormToggleField
                field={field}
                fieldState={fieldState}
                disabled={disabled}
                label={intl.formatMessage(t.usePublic)}
                style={styles.flexChild}
              />
            )}
          />
          <Controller
            name="use_private"
            control={control}
            render={({ field, fieldState }) => (
              <FormToggleField
                field={field}
                fieldState={fieldState}
                disabled={disabled}
                label={intl.formatMessage(t.usePrivate)}
                style={styles.flexChild}
              />
            )}
          />
          <Controller
            name="use_evaluation"
            control={control}
            render={({ field, fieldState }) => (
              <FormToggleField
                field={field}
                fieldState={fieldState}
                disabled={disabled}
                label={intl.formatMessage(t.useEvaluation)}
                style={styles.flexChild}
              />
            )}
          />
        </div>

        {autograded ? (
          <>
            <Controller
              name="delayed_grade_publication"
              control={control}
              render={({ field, fieldState }) => (
                <FormToggleField
                  field={field}
                  fieldState={fieldState}
                  disabled={disabled}
                  label={intl.formatMessage(t.delayedGradePublication)}
                  style={styles.toggle}
                />
              )}
            />
            <div style={styles.hint}>
              {intl.formatMessage(t.delayedGradePublicationHint)}
            </div>
          </>
        ) : null}
      </Section>

      <Section title={intl.formatMessage(t.answersAndTestCases)}>
        {autograded ? (
          <div>
            <Controller
              name="skippable"
              control={control}
              render={({ field, fieldState }) => (
                <FormToggleField
                  field={field}
                  fieldState={fieldState}
                  disabled={disabled}
                  label={intl.formatMessage(t.skippable)}
                  renderIf={autograded}
                  style={styles.toggle}
                />
              )}
            />
            <Controller
              name="allow_partial_submission"
              control={control}
              render={({ field, fieldState }) => (
                <FormToggleField
                  field={field}
                  fieldState={fieldState}
                  disabled={disabled}
                  label={intl.formatMessage(t.allowPartialSubmission)}
                  renderIf={autograded}
                  style={styles.toggle}
                />
              )}
            />
          </div>
        ) : null}

        <Controller
          name="show_private"
          control={control}
          render={({ field, fieldState }) => (
            <FormToggleField
              field={field}
              fieldState={fieldState}
              disabled={disabled}
              label={intl.formatMessage(t.showPrivate)}
              style={styles.toggle}
            />
          )}
        />
        <div style={styles.hint}>{intl.formatMessage(t.showPrivateHint)}</div>
        <Controller
          name="show_evaluation"
          control={control}
          render={({ field, fieldState }) => (
            <FormToggleField
              field={field}
              fieldState={fieldState}
              disabled={disabled}
              label={intl.formatMessage(t.showEvaluation)}
              style={styles.toggle}
            />
          )}
        />
        <div style={styles.hint}>
          {intl.formatMessage(t.showEvaluationHint)}
        </div>

        <Controller
          name="show_mcq_mrq_solution"
          control={control}
          render={({ field, fieldState }) => (
            <FormToggleField
              field={field}
              fieldState={fieldState}
              disabled={disabled}
              label={intl.formatMessage(t.showMcqMrqSolution)}
              style={styles.toggle}
            />
          )}
        />
        <div style={styles.hint}>
          {intl.formatMessage(t.showMcqMrqSolutionHint)}
        </div>
      </Section>

      <Section
        title={intl.formatMessage(t.organisation)}
        subtitle={intl.formatMessage(t.organisationSubtitle)}
      >
        {editing && renderTabs(loadedTabs, disabled)}

        <Controller
          name="tabbed_view"
          control={control}
          render={({ field, fieldState }) => (
            <FormSelectField
              field={field}
              fieldState={fieldState}
              disabled={disabled}
              label={intl.formatMessage(t.tab)}
              options={[
                {
                  value: false,
                  label: intl.formatMessage(t.singlePage),
                },
                {
                  value: true,
                  label: intl.formatMessage(t.tabbedView),
                },
              ]}
              renderIf={!autograded}
              type="boolean"
            />
          )}
        />
      </Section>

      <Section title={intl.formatMessage(t.examsAndAccessControl)}>
        <Controller
          name="block_student_viewing_after_submitted"
          control={control}
          render={({ field, fieldState }) => (
            <FormToggleField
              field={field}
              fieldState={fieldState}
              disabled={disabled}
              label={intl.formatMessage(t.blockStudentViewingAfterSubmitted)}
              style={styles.toggle}
            />
          )}
        />

        {randomizationAllowed && (
          <>
            <Controller
              name="randomization"
              control={control}
              render={({ field, fieldState }) => (
                <FormToggleField
                  field={field}
                  fieldState={fieldState}
                  disabled={disabled}
                  label={intl.formatMessage(t.enableRandomization)}
                  style={styles.toggle}
                />
              )}
            />
            <div style={styles.hint}>
              {intl.formatMessage(t.enableRandomizationHint)}
            </div>
          </>
        )}

        {autograded ? (
          <>
            <Controller
              name="show_mcq_answer"
              control={control}
              render={({ field, fieldState }) => (
                <FormToggleField
                  field={field}
                  fieldState={fieldState}
                  disabled={disabled}
                  label={intl.formatMessage(t.showMcqAnswer)}
                  renderIf={autograded}
                  style={styles.toggle}
                />
              )}
            />
            <div style={styles.hint}>
              {intl.formatMessage(t.showMcqAnswerHint)}
            </div>

            <Controller
              name="password_protected"
              control={control}
              render={({ field, fieldState }) => (
                <FormToggleField
                  field={field}
                  fieldState={fieldState}
                  disabled={disabled}
                  label={intl.formatMessage(t.passwordProtection)}
                  renderIf={!autograded}
                  style={styles.toggle}
                />
              )}
            />
            {passwordProtected && renderPasswordFields()}
          </>
        ) : null}
      </Section>

      <Section title={intl.formatMessage(t.personalisedTimelines)}>
        {showPersonalizedTimelineFeatures && (
          <>
            <Controller
              name="has_personal_times"
              control={control}
              render={({ field, fieldState }) => (
                <FormToggleField
                  field={field}
                  fieldState={fieldState}
                  disabled={disabled}
                  label={intl.formatMessage(t.hasPersonalTimes)}
                  style={styles.toggle}
                />
              )}
            />
            <div style={styles.hint}>
              {intl.formatMessage(t.hasPersonalTimesHint)}
            </div>

            <Controller
              name="affects_personal_times"
              control={control}
              render={({ field, fieldState }) => (
                <FormToggleField
                  field={field}
                  fieldState={fieldState}
                  disabled={disabled}
                  label={intl.formatMessage(t.affectsPersonalTimes)}
                  style={styles.toggle}
                />
              )}
            />
            <div style={styles.hint}>
              {intl.formatMessage(t.affectsPersonalTimesHint)}
            </div>
          </>
        )}
      </Section>
    </form>
  );
};

AssessmentForm.defaultProps = {
  gamified: true,
};

AssessmentForm.propTypes = {
  disabled: PropTypes.bool,
  dispatch: PropTypes.func.isRequired,
  start_at: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
  end_at: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
  bonus_end_at: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.instanceOf(Date),
  ]),
  autograded: PropTypes.bool,
  password_protected: PropTypes.bool,
  showPersonalizedTimelineFeatures: PropTypes.bool,
  tabs: PropTypes.arrayOf(
    PropTypes.shape({
      tab_id: PropTypes.number,
      title: PropTypes.string,
    }),
  ),
  // If randomization is enabled for the assessment
  randomization: PropTypes.bool,

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
  // If an assessment contains question of programming codaveri type
  containsCodaveri: PropTypes.bool,
  folderAttributes: PropTypes.shape({
    folder_id: PropTypes.number,
    // If any action (upload, delete and download) of the materials
    enable_materials_action: PropTypes.bool,
    // See MaterialFormContainer for detailed PropTypes.
    materials: typeMaterial,
  }),
  // Condtions will be displayed if the attributes are present.
  conditionAttributes: achievementTypesConditionAttributes,
  initialValues: PropTypes.object,
  intl: PropTypes.object,
};

function mapStateToProps(state) {
  return {
    tabs: state.editPage.tabs,
  };
}

export default connect(mapStateToProps)(injectIntl(AssessmentForm));
