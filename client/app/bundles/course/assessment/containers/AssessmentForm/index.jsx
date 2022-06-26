/* eslint-disable camelcase */
import { useEffect } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
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
import translations from './translations.intl';
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

const validationSchema = yup.object({
  title: yup.string().required(formTranslations.required),
  tab_id: yup.number(),
  description: yup.string(),
  start_at: yup.date().nullable().required(formTranslations.required),
  end_at: yup
    .date()
    .nullable()
    .min(yup.ref('start_at'), translations.startEndValidationError),
  bonus_end_at: yup
    .date()
    .nullable()
    .min(yup.ref('start_at'), translations.startEndValidationError),
  base_exp: yup
    .number()
    .typeError(formTranslations.required)
    .required(formTranslations.required),
  time_bonus_exp: yup
    .number()
    .typeError(formTranslations.required)
    .required(formTranslations.required),
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
          message: translations.passwordRequired,
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
        message: translations.noTestCaseChosenError,
      }),
    ),
  show_private: yup.bool(),
  show_evaluation: yup.bool(),
  randomization: yup.bool(),
  has_personal_times: yup.bool(),
  affects_personal_times: yup.bool(),
});

const onStartAtChange = (nextStartAt, watch, setValue) => {
  const prevStartAt = watch('start_at');
  const prevEndAt = watch('end_at');
  const prevBonusEndAt = watch('bonus_end_at');

  const newStartTime = nextStartAt && new Date(nextStartAt).getTime();
  const oldStartTime = prevStartAt && new Date(prevStartAt).getTime();
  const oldEndTime = prevEndAt && new Date(prevEndAt).getTime();
  const oldBonusTime = prevBonusEndAt && new Date(prevBonusEndAt).getTime();

  // Shift end_at time
  if (
    newStartTime &&
    oldStartTime &&
    oldEndTime &&
    oldStartTime <= oldEndTime
  ) {
    const nextEndAt = new Date(oldEndTime + (newStartTime - oldStartTime));
    setValue('end_at', nextEndAt);
  }

  // Shift bonus_end_at time
  if (
    newStartTime &&
    oldStartTime &&
    oldBonusTime &&
    oldStartTime <= oldBonusTime
  ) {
    const nextBonusEndAt = new Date(
      oldBonusTime + (newStartTime - oldStartTime),
    );
    setValue('bonus_end_at', nextBonusEndAt);
  }
};

const AssessmentForm = (props) => {
  const {
    conditionAttributes,
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
  } = props;
  const {
    control,
    handleSubmit,
    setError,
    setValue,
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
      const failureMessage = (
        <FormattedMessage {...translations.fetchTabFailure} />
      );
      dispatch(fetchTabs(failureMessage));
    }
  }, [dispatch]);

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
            placeholder={<FormattedMessage {...translations.viewPassword} />}
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
      <div style={styles.hint}>
        <FormattedMessage {...translations.viewPasswordHint} />
      </div>

      <Controller
        name="session_password"
        control={control}
        render={({ field, fieldState }) => (
          <FormTextField
            field={field}
            fieldState={fieldState}
            disabled={disabled}
            placeholder={<FormattedMessage {...translations.sessionPassword} />}
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
      <div style={styles.hint}>
        <FormattedMessage {...translations.sessionPasswordHint} />
      </div>
    </div>
  );

  const renderExtraOptions = () => {
    if (autograded) {
      return (
        <div>
          <Controller
            name="skippable"
            control={control}
            render={({ field, fieldState }) => (
              <FormToggleField
                field={field}
                fieldState={fieldState}
                disabled={disabled}
                label={<FormattedMessage {...translations.skippable} />}
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
                label={
                  <FormattedMessage {...translations.allowPartialSubmission} />
                }
                renderIf={autograded}
                style={styles.toggle}
              />
            )}
          />
          <Controller
            name="show_mcq_answer"
            control={control}
            render={({ field, fieldState }) => (
              <FormToggleField
                field={field}
                fieldState={fieldState}
                disabled={disabled}
                label={<FormattedMessage {...translations.showMcqAnswer} />}
                renderIf={autograded}
                style={styles.toggle}
              />
            )}
          />
          <div style={styles.hint}>
            <FormattedMessage {...translations.showMcqAnswerHint} />
          </div>
        </div>
      );
    }
    const options = [
      {
        value: false,
        label: <FormattedMessage {...translations.singlePage} />,
      },
      {
        value: true,
        label: <FormattedMessage {...translations.tabbedView} />,
      },
    ];
    return (
      <>
        <Controller
          name="tabbed_view"
          control={control}
          render={({ field, fieldState }) => (
            <FormSelectField
              field={field}
              fieldState={fieldState}
              disabled={disabled}
              label={<FormattedMessage {...translations.tab} />}
              options={options}
              renderIf={!autograded}
              type="boolean"
            />
          )}
        />
        <Controller
          name="delayed_grade_publication"
          control={control}
          render={({ field, fieldState }) => (
            <FormToggleField
              field={field}
              fieldState={fieldState}
              disabled={disabled}
              label={
                <FormattedMessage {...translations.delayedGradePublication} />
              }
              renderIf={!autograded}
              style={styles.toggle}
            />
          )}
        />
        <div style={styles.hint}>
          <FormattedMessage {...translations.delayedGradePublicationHint} />
        </div>

        <Controller
          name="password_protected"
          control={control}
          render={({ field, fieldState }) => (
            <FormToggleField
              field={field}
              fieldState={fieldState}
              disabled={disabled}
              label={<FormattedMessage {...translations.passwordProtection} />}
              renderIf={!autograded}
              style={styles.toggle}
            />
          )}
        />
        {passwordProtected && renderPasswordFields()}
      </>
    );
  };

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
            label={<FormattedMessage {...translations.tab} />}
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
      <div style={styles.flexGroup}>
        <Controller
          name="title"
          control={control}
          render={({ field, fieldState }) => (
            <FormTextField
              field={field}
              fieldState={fieldState}
              disabled={disabled}
              label={<FormattedMessage {...translations.title} />}
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
        {editing && renderTabs(loadedTabs, disabled)}
      </div>
      <Controller
        name="description"
        control={control}
        render={({ field, fieldState }) => (
          <FormRichTextField
            field={field}
            fieldState={fieldState}
            disabled={disabled}
            label={<FormattedMessage {...translations.description} />}
            fullWidth
            InputLabelProps={{
              shrink: true,
            }}
            variant="standard"
          />
        )}
      />
      <div style={styles.flexGroup}>
        <Controller
          name="start_at"
          control={control}
          render={({ field, fieldState }) => (
            <FormDateTimePickerField
              field={field}
              fieldState={fieldState}
              disabled={disabled}
              label={<FormattedMessage {...translations.startAt} />}
              afterChangeField={(newValue) =>
                onStartAtChange(newValue, watch, setValue)
              }
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
              label={<FormattedMessage {...translations.endAt} />}
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
                label={<FormattedMessage {...translations.bonusEndAt} />}
                style={styles.flexChild}
              />
            )}
          />
        )}
      </div>
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
                label={<FormattedMessage {...translations.baseExp} />}
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
                label={<FormattedMessage {...translations.timeBonusExp} />}
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

      {editing && (
        <Controller
          name="published"
          control={control}
          render={({ field, fieldState }) => (
            <FormToggleField
              field={field}
              fieldState={fieldState}
              disabled={disabled}
              label={<FormattedMessage {...translations.published} />}
              style={styles.toggle}
            />
          )}
        />
      )}

      <Controller
        name="autograded"
        control={control}
        render={({ field, fieldState }) => (
          <FormToggleField
            field={field}
            fieldState={fieldState}
            disabled={!modeSwitching || disabled}
            label={
              modeSwitching ? (
                <FormattedMessage {...translations.autograded} />
              ) : (
                <FormattedMessage {...translations.modeSwitchingDisabled} />
              )
            }
            style={styles.toggle}
          />
        )}
      />

      {modeSwitching && (
        <div style={styles.hint}>
          <FormattedMessage {...translations.autogradedHint} />
        </div>
      )}

      <Controller
        name="block_student_viewing_after_submitted"
        control={control}
        render={({ field, fieldState }) => (
          <FormToggleField
            field={field}
            fieldState={fieldState}
            disabled={disabled}
            label={
              <FormattedMessage
                {...translations.blockStudentViewingAfterSubmitted}
              />
            }
            style={styles.toggle}
          />
        )}
      />

      {renderExtraOptions()}

      <Controller
        name="show_mcq_mrq_solution"
        control={control}
        render={({ field, fieldState }) => (
          <FormToggleField
            field={field}
            fieldState={fieldState}
            disabled={disabled}
            label={<FormattedMessage {...translations.showMcqMrqSolution} />}
            style={styles.toggle}
          />
        )}
      />
      <div style={styles.hint}>
        <FormattedMessage {...translations.showMcqMrqSolutionHint} />
      </div>

      <div style={styles.conditions}>
        <FormattedMessage {...translations.autogradeTestCasesHint} />
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
              label={<FormattedMessage {...translations.usePublic} />}
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
              label={<FormattedMessage {...translations.usePrivate} />}
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
              label={<FormattedMessage {...translations.useEvaluation} />}
              style={styles.flexChild}
            />
          )}
        />
      </div>

      <Controller
        name="show_private"
        control={control}
        render={({ field, fieldState }) => (
          <FormToggleField
            field={field}
            fieldState={fieldState}
            disabled={disabled}
            label={<FormattedMessage {...translations.showPrivate} />}
            style={styles.toggle}
          />
        )}
      />
      <div style={styles.hint}>
        <FormattedMessage {...translations.showPrivateHint} />
      </div>
      <Controller
        name="show_evaluation"
        control={control}
        render={({ field, fieldState }) => (
          <FormToggleField
            field={field}
            fieldState={fieldState}
            disabled={disabled}
            label={<FormattedMessage {...translations.showEvaluation} />}
            style={styles.toggle}
          />
        )}
      />
      <div style={styles.hint}>
        <FormattedMessage {...translations.showEvaluationHint} />
      </div>

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
                label={
                  <FormattedMessage {...translations.enableRandomization} />
                }
                style={styles.toggle}
              />
            )}
          />
          <div style={styles.hint}>
            <FormattedMessage {...translations.enableRandomizationHint} />
          </div>
        </>
      )}

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
                label={<FormattedMessage {...translations.hasPersonalTimes} />}
                style={styles.toggle}
              />
            )}
          />
          <div style={styles.hint}>
            <FormattedMessage {...translations.hasPersonalTimesHint} />
          </div>

          <Controller
            name="affects_personal_times"
            control={control}
            render={({ field, fieldState }) => (
              <FormToggleField
                field={field}
                fieldState={fieldState}
                disabled={disabled}
                label={
                  <FormattedMessage {...translations.affectsPersonalTimes} />
                }
                style={styles.toggle}
              />
            )}
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
};

function mapStateToProps(state) {
  return {
    tabs: state.editPage.tabs,
  };
}

export default connect(mapStateToProps)(AssessmentForm);
