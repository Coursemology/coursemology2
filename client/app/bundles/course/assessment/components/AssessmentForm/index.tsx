import { useEffect } from 'react';
import useEmitterFactory from 'react-emitter-factory';
import { Controller } from 'react-hook-form';
import {
  Block as DraftIcon,
  CheckCircle as AutogradedIcon,
  Create as ManualIcon,
  Public as PublishedIcon,
} from '@mui/icons-material';
import {
  Grid,
  InputAdornment,
  // List,
  RadioGroup,
  Typography,
} from '@mui/material';

// import AssessmentProgrammingQnList from 'course/admin/pages/CodaveriSettings/components/AssessmentProgrammingQnList';
// import LiveFeedbackToggleButton from 'course/admin/pages/CodaveriSettings/components/buttons/LiveFeedbackToggleButton';
// import { getProgrammingQuestionsForAssessments } from 'course/admin/pages/CodaveriSettings/selectors';
import IconRadio from 'lib/components/core/buttons/IconRadio';
import ErrorText from 'lib/components/core/ErrorText';
// import ExperimentalChip from 'lib/components/core/ExperimentalChip';
import InfoLabel from 'lib/components/core/InfoLabel';
import Section from 'lib/components/core/layouts/Section';
import ConditionsManager from 'lib/components/extensions/conditions/ConditionsManager';
import FormCheckboxField from 'lib/components/form/fields/CheckboxField';
import FormDateTimePickerField from 'lib/components/form/fields/DateTimePickerField';
import FormRichTextField from 'lib/components/form/fields/RichTextField';
import FormSelectField from 'lib/components/form/fields/SelectField';
import FormTextField from 'lib/components/form/fields/TextField';
import { useAppDispatch } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';

import FileManager from '../FileManager';
import BlocksInvalidBrowserFormField from '../monitoring/BlocksInvalidBrowserFormField';
import EnableMonitoringFormField from '../monitoring/EnableMonitoringFormField';
import MonitoringOptionsFormFields from '../monitoring/MonitoringOptionsFormFields';

import { fetchTabs } from './operations';
import translations from './translations';
import { AssessmentFormProps, connector } from './types';
import useFormValidation from './useFormValidation';

const AssessmentForm = (props: AssessmentFormProps): JSX.Element => {
  const {
    conditionAttributes,
    disabled,
    editing,
    gamified,
    folderAttributes,
    initialValues,
    isKoditsuExamEnabled,
    isQuestionsValidForKoditsu,
    modeSwitching,
    onSubmit,
    pulsegridUrl,
    // Randomized Assessment is temporarily hidden (PR#5406)
    // randomizationAllowed,
    showPersonalizedTimelineFeatures,
    canManageMonitor,
    tabs,
    monitoringEnabled,
  } = props;

  const {
    control,
    handleSubmit,
    setError,
    watch,
    formState: { errors, isDirty },
  } = useFormValidation(initialValues);

  const { t } = useTranslation();

  const dispatch = useAppDispatch();

  const autograded = watch('autograded');
  const passwordProtected = watch('password_protected');
  const sessionProtected = watch('session_protected');
  const hasTimeLimit = watch('has_time_limit');

  const monitoring = watch('monitoring.enabled');
  const isKoditsuAssessmentEnabled = watch('is_koditsu_enabled');

  const proctorWithKoditsuDisabledHint = (): string | undefined => {
    if (disabled) {
      return undefined;
    }

    return !isKoditsuExamEnabled
      ? t(translations.koditsuDisabledInCourse)
      : t(translations.questionsIncompatibleWithKoditsu);
  };

  // const assessmentId = initialValues.id;
  // const title = initialValues.title;

  // const programmingQuestions = useAppSelector((state) =>
  //   getProgrammingQuestionsForAssessments(state, [assessmentId]),
  // );

  // const qnsWithLiveFeedbackEnabled = programmingQuestions.filter(
  //   (question) => question.liveFeedbackEnabled,
  // );

  // const hasNoProgrammingQuestions = programmingQuestions.length === 0;
  // const isSomeLiveFeedbackEnabled =
  //   qnsWithLiveFeedbackEnabled.length < programmingQuestions.length;

  // Load all tabs if data is loaded, otherwise fall back to current assessment tab.
  const loadedTabs = tabs ?? watch('tabs');

  useEffect(() => {
    if (!editing) return;

    dispatch(fetchTabs(t(translations.fetchTabFailure)));
  }, [dispatch]);

  useEmitterFactory(
    props,
    {
      isDirty,
    },
    [isDirty],
  );

  const renderPasswordFields = (): JSX.Element => (
    <>
      <Controller
        control={control}
        name="view_password"
        render={({ field, fieldState }): JSX.Element => (
          <FormTextField
            disabled={disabled}
            field={field}
            fieldState={fieldState}
            fullWidth
            label={t(translations.viewPassword)}
            required
            type="password"
            variant="filled"
          />
        )}
      />

      <Typography className="!mt-0" color="text.secondary" variant="body2">
        {t(translations.viewPasswordHint)}
      </Typography>

      <Controller
        control={control}
        name="session_protected"
        render={({ field, fieldState }): JSX.Element => (
          <FormCheckboxField
            description={t(translations.sessionProtectionHint, {
              b: (chunk) => <strong>{chunk}</strong>,
            })}
            disabled={autograded || disabled}
            field={field}
            fieldState={fieldState}
            label={t(translations.sessionProtection)}
          />
        )}
      />

      {sessionProtected && (
        <Controller
          control={control}
          name="session_password"
          render={({ field, fieldState }): JSX.Element => (
            <FormTextField
              disabled={disabled}
              field={field}
              fieldState={fieldState}
              fullWidth
              label={t(translations.sessionPassword)}
              required
              type="password"
              variant="filled"
            />
          )}
        />
      )}
    </>
  );

  const renderTabs = (): JSX.Element | null => {
    if (!loadedTabs) return null;

    const options = loadedTabs.map((tab) => ({
      value: tab.tab_id,
      label: tab.title,
    }));

    return (
      <Controller
        control={control}
        name="tab_id"
        render={({ field, fieldState }): JSX.Element => (
          <FormSelectField
            disabled={disabled}
            field={field}
            fieldState={fieldState}
            label={t(translations.tab)}
            margin="0"
            options={options}
            variant="filled"
          />
        )}
      />
    );
  };

  return (
    <div>
      <form
        encType="multipart/form-data"
        id="assessment-form"
        noValidate
        onSubmit={handleSubmit((data) => onSubmit(data, setError))}
      >
        <ErrorText errors={errors} />

        <Section
          sticksToNavbar={editing}
          title={t(translations.assessmentDetails)}
        >
          <Controller
            control={control}
            name="title"
            render={({ field, fieldState }): JSX.Element => (
              <FormTextField
                disabled={disabled}
                disableMargins
                field={field}
                fieldState={fieldState}
                fullWidth
                label={t(translations.title)}
                required
                variant="filled"
              />
            )}
          />

          <Grid columnSpacing={2} container direction="row">
            <Grid item xs>
              <Controller
                control={control}
                name="start_at"
                render={({ field, fieldState }): JSX.Element => (
                  <FormDateTimePickerField
                    disabled={disabled}
                    disableMargins
                    disableShrinkingLabel
                    field={field}
                    fieldState={fieldState}
                    label={t(translations.startAt)}
                    required
                    variant="filled"
                  />
                )}
              />
            </Grid>

            <Grid item xs>
              <Controller
                control={control}
                name="end_at"
                render={({ field, fieldState }): JSX.Element => (
                  <FormDateTimePickerField
                    disabled={disabled}
                    disableMargins
                    disableShrinkingLabel
                    field={field}
                    fieldState={fieldState}
                    label={t(translations.endAt)}
                    required={isKoditsuAssessmentEnabled}
                    variant="filled"
                  />
                )}
              />
            </Grid>

            {gamified && (
              <Grid item xs>
                <Controller
                  control={control}
                  name="bonus_end_at"
                  render={({ field, fieldState }): JSX.Element => (
                    <FormDateTimePickerField
                      disabled={disabled}
                      disableMargins
                      disableShrinkingLabel
                      field={field}
                      fieldState={fieldState}
                      label={t(translations.bonusEndAt)}
                      variant="filled"
                    />
                  )}
                />
              </Grid>
            )}
          </Grid>

          <Controller
            control={control}
            name="has_time_limit"
            render={({ field, fieldState }): JSX.Element => (
              <FormCheckboxField
                description={t(translations.hasTimeLimitHint)}
                disabled={disabled}
                field={field}
                fieldState={fieldState}
                label={t(translations.hasTimeLimit)}
              />
            )}
          />

          {hasTimeLimit && (
            <Controller
              control={control}
              name="time_limit"
              render={({ field, fieldState }): JSX.Element => (
                <FormTextField
                  disabled={disabled}
                  disableMargins
                  field={field}
                  fieldState={fieldState}
                  fullWidth
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        {t(translations.minutes)}
                      </InputAdornment>
                    ),
                  }}
                  label={t(translations.timeLimit)}
                  type="number"
                  variant="filled"
                />
              )}
            />
          )}

          <Typography>{t(translations.description)}</Typography>

          <Controller
            control={control}
            name="description"
            render={({ field, fieldState }): JSX.Element => (
              <FormRichTextField
                disabled={disabled}
                disableMargins
                field={field}
                fieldState={fieldState}
                fullWidth
                variant="standard"
              />
            )}
          />

          {editing && (
            <>
              <Typography>{t(translations.visibility)}</Typography>

              <Controller
                control={control}
                name="published"
                render={({ field }): JSX.Element => (
                  <RadioGroup
                    {...field}
                    onChange={(e): void => {
                      const isPublished = e.target.value === 'published';
                      field.onChange(isPublished);
                    }}
                    value={field.value === true ? 'published' : 'draft'}
                  >
                    <IconRadio
                      description={t(translations.publishedHint)}
                      icon={PublishedIcon}
                      label={t(translations.published)}
                      value="published"
                    />

                    <IconRadio
                      description={t(translations.draftHint)}
                      icon={DraftIcon}
                      label={t(translations.draft)}
                      value="draft"
                    />
                  </RadioGroup>
                )}
              />
            </>
          )}

          <Controller
            control={control}
            name="has_todo"
            render={({ field, fieldState }): JSX.Element => (
              <FormCheckboxField
                description={t(translations.hasTodoHint)}
                disabled={disabled}
                field={field}
                fieldState={fieldState}
                label={t(translations.hasTodo)}
              />
            )}
          />

          {editing && folderAttributes && (
            <>
              <Typography>{t(translations.files)}</Typography>

              <FileManager
                disabled={!folderAttributes.enable_materials_action}
                folderId={folderAttributes.folder_id}
                materials={folderAttributes.materials}
              />
            </>
          )}
        </Section>

        {gamified && (
          <Section
            sticksToNavbar={editing}
            title={t(translations.gamification)}
          >
            <Grid container direction="row" spacing={2}>
              <Grid item xs>
                <Controller
                  control={control}
                  name="base_exp"
                  render={({ field, fieldState }): JSX.Element => (
                    <FormTextField
                      disabled={disabled}
                      disableMargins
                      field={field}
                      fieldState={fieldState}
                      fullWidth
                      label={t(translations.baseExp)}
                      onWheel={(event): void => event.currentTarget.blur()}
                      type="number"
                      variant="filled"
                    />
                  )}
                />
              </Grid>

              <Grid item xs>
                <Controller
                  control={control}
                  name="time_bonus_exp"
                  render={({ field, fieldState }): JSX.Element => (
                    <FormTextField
                      disabled={disabled}
                      disableMargins
                      field={field}
                      fieldState={fieldState}
                      fullWidth
                      label={t(translations.timeBonusExp)}
                      onWheel={(event): void => event.currentTarget.blur()}
                      type="number"
                      variant="filled"
                    />
                  )}
                />
              </Grid>
            </Grid>

            {editing && conditionAttributes && (
              <ConditionsManager
                conditionsData={conditionAttributes}
                description={t(translations.unlockConditionsHint)}
                title={t(translations.unlockConditions)}
              />
            )}
          </Section>
        )}

        <Section sticksToNavbar={editing} title={t(translations.grading)}>
          <Typography>{t(translations.gradingMode)}</Typography>

          {!modeSwitching && (
            <InfoLabel label={t(translations.modeSwitchingDisabled)} />
          )}

          <Controller
            control={control}
            name="autograded"
            render={({ field }): JSX.Element => (
              <RadioGroup
                {...field}
                onChange={(e): void => {
                  const isAutograded = e.target.value === 'autograded';
                  field.onChange(isAutograded);
                }}
                value={field.value === true ? 'autograded' : 'manual'}
              >
                <IconRadio
                  description={t(translations.autogradedHint)}
                  disabled={!!disabled || !modeSwitching}
                  icon={AutogradedIcon}
                  label="Autograded"
                  value="autograded"
                />

                <IconRadio
                  disabled={!!disabled || !modeSwitching}
                  icon={ManualIcon}
                  label="Manual"
                  value="manual"
                />
              </RadioGroup>
            )}
          />

          <Typography>{t(translations.calculateGradeWith)}</Typography>

          <Controller
            control={control}
            name="use_public"
            render={({ field, fieldState }): JSX.Element => (
              <FormCheckboxField
                disabled={disabled}
                field={field}
                fieldState={fieldState}
                label={t(translations.usePublic)}
              />
            )}
          />
          <Controller
            control={control}
            name="use_private"
            render={({ field, fieldState }): JSX.Element => (
              <FormCheckboxField
                disabled={disabled}
                field={field}
                fieldState={fieldState}
                label={t(translations.usePrivate)}
              />
            )}
          />
          <Controller
            control={control}
            name="use_evaluation"
            render={({ field, fieldState }): JSX.Element => (
              <FormCheckboxField
                disabled={disabled}
                field={field}
                fieldState={fieldState}
                label={t(translations.useEvaluation)}
              />
            )}
          />

          <Controller
            control={control}
            name="delayed_grade_publication"
            render={({ field, fieldState }): JSX.Element => (
              <FormCheckboxField
                description={t(translations.delayedGradePublicationHint)}
                disabled={autograded || disabled}
                disabledHint={t(translations.unavailableInAutograded)}
                field={field}
                fieldState={fieldState}
                label={t(translations.delayedGradePublication)}
              />
            )}
          />
        </Section>

        <Section
          sticksToNavbar={editing}
          title={t(translations.answersAndTestCases)}
        >
          <Controller
            control={control}
            name="skippable"
            render={({ field, fieldState }): JSX.Element => (
              <FormCheckboxField
                disabled={!autograded || disabled}
                disabledHint={t(translations.skippableManualHint)}
                field={field}
                fieldState={fieldState}
                label={t(translations.skippable)}
              />
            )}
          />
          <Controller
            control={control}
            name="allow_partial_submission"
            render={({ field, fieldState }): JSX.Element => (
              <FormCheckboxField
                disabled={!autograded || disabled}
                disabledHint={t(translations.unavailableInManuallyGraded)}
                field={field}
                fieldState={fieldState}
                label={t(translations.allowPartialSubmission)}
              />
            )}
          />

          <Typography>{t(translations.afterSubmissionGraded)}</Typography>

          <Controller
            control={control}
            name="show_private"
            render={({ field, fieldState }): JSX.Element => (
              <FormCheckboxField
                description={t(translations.forProgrammingQuestions)}
                disabled={disabled}
                field={field}
                fieldState={fieldState}
                label={t(translations.showPrivate)}
              />
            )}
          />
          <Controller
            control={control}
            name="show_evaluation"
            render={({ field, fieldState }): JSX.Element => (
              <FormCheckboxField
                description={t(translations.forProgrammingQuestions)}
                disabled={disabled}
                field={field}
                fieldState={fieldState}
                label={t(translations.showEvaluation)}
              />
            )}
          />

          <Controller
            control={control}
            name="show_mcq_mrq_solution"
            render={({ field, fieldState }): JSX.Element => (
              <FormCheckboxField
                disabled={disabled}
                field={field}
                fieldState={fieldState}
                label={t(translations.showMcqMrqSolution)}
              />
            )}
          />
        </Section>

        <Section sticksToNavbar={editing} title={t(translations.organization)}>
          {editing && renderTabs()}

          <Controller
            control={control}
            name="tabbed_view"
            render={({ field, fieldState }): JSX.Element => (
              <FormSelectField
                disabled={autograded || disabled}
                field={field}
                fieldState={fieldState}
                label={t(translations.displayAssessmentAs)}
                margin="0"
                options={[
                  {
                    value: false,
                    label: t(translations.singlePage),
                  },
                  {
                    value: true,
                    label: t(translations.tabbedView),
                  },
                ]}
                type="boolean"
                variant="filled"
              />
            )}
          />
        </Section>

        <Section
          sticksToNavbar={editing}
          title={t(translations.examsAndAccessControl)}
        >
          <Controller
            control={control}
            name="is_koditsu_enabled"
            render={({ field, fieldState }): JSX.Element => (
              <FormCheckboxField
                disabled={
                  !isKoditsuExamEnabled ||
                  (editing && !isQuestionsValidForKoditsu) ||
                  disabled
                }
                disabledHint={proctorWithKoditsuDisabledHint()}
                field={field}
                fieldState={fieldState}
                label={t(translations.proctorWithKoditsu)}
              />
            )}
          />
          <Controller
            control={control}
            name="block_student_viewing_after_submitted"
            render={({ field, fieldState }): JSX.Element => (
              <FormCheckboxField
                description={t(
                  translations.blockStudentViewingAfterSubmittedHint,
                )}
                disabled={autograded || disabled}
                disabledHint={t(translations.unavailableInAutograded)}
                field={field}
                fieldState={fieldState}
                label={t(translations.blockStudentViewingAfterSubmitted)}
              />
            )}
          />

          {/* Randomized Assessment is temporarily hidden (PR#5406) */}
          {/* {randomizationAllowed && (
          <Controller
            control={control}
            name="randomization"
            render={({ field, fieldState }): JSX.Element => (
              <FormCheckboxField
                description={t(translations.enableRandomizationHint)}
                disabled={disabled}
                field={field}
                fieldState={fieldState}
                label={t(translations.enableRandomization)}
              />
            )}
          />
        )} */}

          <Controller
            control={control}
            name="show_mcq_answer"
            render={({ field, fieldState }): JSX.Element => (
              <FormCheckboxField
                description={t(translations.showMcqAnswerHint)}
                disabled={!autograded || disabled}
                disabledHint={t(translations.unavailableInManuallyGraded)}
                field={field}
                fieldState={fieldState}
                label={t(translations.showMcqAnswer)}
              />
            )}
          />

          <Controller
            control={control}
            name="password_protected"
            render={({ field, fieldState }): JSX.Element => (
              <FormCheckboxField
                disabled={autograded || disabled}
                disabledHint={t(translations.unavailableInAutograded)}
                field={field}
                fieldState={fieldState}
                label={t(translations.passwordProtection)}
                labelClassName="mt-10"
              />
            )}
          />

          {!autograded && passwordProtected && renderPasswordFields()}

          {passwordProtected && monitoring && (
            <BlocksInvalidBrowserFormField
              control={control}
              disabled={!canManageMonitor || disabled}
            />
          )}

          {passwordProtected && monitoringEnabled && (
            <EnableMonitoringFormField
              control={control}
              disabled={!canManageMonitor || disabled}
              labelClassName="mt-10"
              pulsegridUrl={pulsegridUrl}
            />
          )}

          {passwordProtected && monitoring && (
            <MonitoringOptionsFormFields
              control={control}
              disabled={!canManageMonitor || disabled}
              pulsegridUrl={pulsegridUrl}
            />
          )}
        </Section>

        {showPersonalizedTimelineFeatures && (
          <Section
            sticksToNavbar={editing}
            title={t(translations.personalisedTimelines)}
          >
            <Controller
              control={control}
              name="has_personal_times"
              render={({ field, fieldState }): JSX.Element => (
                <FormCheckboxField
                  description={t(translations.hasPersonalTimesHint)}
                  disabled={disabled}
                  field={field}
                  fieldState={fieldState}
                  label={t(translations.hasPersonalTimes)}
                />
              )}
            />

            <Controller
              control={control}
              name="affects_personal_times"
              render={({ field, fieldState }): JSX.Element => (
                <FormCheckboxField
                  description={t(translations.affectsPersonalTimesHint)}
                  disabled={disabled}
                  field={field}
                  fieldState={fieldState}
                  label={t(translations.affectsPersonalTimes)}
                />
              )}
            />
          </Section>
        )}

        {/*
        {editing && (
          <Section
            sticksToNavbar
            title={
              <>
                {t(translations.liveFeedback)}
                <ExperimentalChip className="ml-2" disabled={disabled} />
              </>
            }
          >
            <div className="-ml-4 flex flex-row">
              <LiveFeedbackToggleButton
                assessmentIds={[assessmentId]}
                for={title}
                hideChipIndicator
              />
              <div>
                <Typography className="mt-3" variant="body1">
                  {t(translations.toggleLiveFeedbackDescription, {
                    enabled:
                      hasNoProgrammingQuestions || isSomeLiveFeedbackEnabled,
                  })}
                </Typography>
                {hasNoProgrammingQuestions && (
                  <InfoLabel label={t(translations.noProgrammingQuestion)} />
                )}
              </div>
            </div>

            {!hasNoProgrammingQuestions && (
              <List
                className="border border-solid border-neutral-300 rounded-lg"
                dense
                disablePadding
              >
                {programmingQuestions.map((question) => (
                  <AssessmentProgrammingQnList
                    key={question.id}
                    isOnlyForLiveFeedbackSetting
                    questionId={question.id}
                  />
                ))}
              </List>
            )}
          </Section>
        )} */}
      </form>
    </div>
  );
};

AssessmentForm.defaultProps = {
  gamified: true,
};

export default connector(AssessmentForm);
