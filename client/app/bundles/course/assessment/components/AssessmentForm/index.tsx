import { useEffect } from 'react';
import useEmitterFactory from 'react-emitter-factory';
import { Controller } from 'react-hook-form';
import {
  CheckCircle as AutogradedIcon,
  Create as ManualIcon,
} from '@mui/icons-material';
import { Grid, InputAdornment, RadioGroup, Typography } from '@mui/material';

import BetaChip from 'lib/components/core/BetaChip';
import IconRadio from 'lib/components/core/buttons/IconRadio';
import ErrorText from 'lib/components/core/ErrorText';
import InfoLabel from 'lib/components/core/InfoLabel';
import Section from 'lib/components/core/layouts/Section';
import Link from 'lib/components/core/Link';
import DescriptionField from 'lib/components/extensions/forms/DescriptionField';
import GamificationFields from 'lib/components/extensions/forms/GamificationFields';
import HasAffectsPersonalTimesFields from 'lib/components/extensions/forms/HasAffectsPersonalTimesFields';
import TimeFields from 'lib/components/extensions/forms/TimeFields';
import TitleField from 'lib/components/extensions/forms/TitleField';
import VisibilityField from 'lib/components/extensions/forms/VisibilityField';
import FormCheckboxField from 'lib/components/form/fields/CheckboxField';
import FormSelectField from 'lib/components/form/fields/SelectField';
import FormTextField from 'lib/components/form/fields/TextField';
import { useAppDispatch } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';

import FileManager from '../FileManager';

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

  const monitoring = watch('monitoring.enabled');
  const hasMonitoringSecret = watch('monitoring.secret');

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
        <TitleField control={control} disabled={disabled} name="title" />

        <TimeFields
          bonusEndTimeFieldName="bonus_end_at"
          control={control}
          disabled={disabled}
          endTimeFieldName="end_at"
          hasBonusEndTime
          startTimeFieldName="start_at"
        />

        <DescriptionField
          control={control}
          disabled={disabled}
          name="description"
        />

        {editing && (
          <VisibilityField
            control={control}
            disabled={disabled}
            name="published"
          />
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
        <GamificationFields.Section sticksToNavbar={editing}>
          <GamificationFields
            baseExpFieldName="base_exp"
            conditionsData={editing ? conditionAttributes : undefined}
            control={control}
            disabled={disabled}
            timeBonusExpFieldName="time_bonus_exp"
          />
        </GamificationFields.Section>
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
          name="allow_record_draft_answer"
          render={({ field, fieldState }): JSX.Element => (
            <FormCheckboxField
              disabled={disabled}
              field={field}
              fieldState={fieldState}
              label={t(translations.allowRecordDraftAnswer)}
            />
          )}
        />
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
          <Controller
            control={control}
            name="monitoring.blocks"
            render={({ field, fieldState }): JSX.Element => (
              <FormCheckboxField
                description={t(translations.blocksAccessesFromInvalidSUSHint)}
                disabled={
                  !canManageMonitor ||
                  !sessionProtected ||
                  !hasMonitoringSecret ||
                  disabled
                }
                disabledHint={
                  !sessionProtected || !hasMonitoringSecret
                    ? t(translations.needSUSAndSessionUnlockPassword)
                    : undefined
                }
                field={field}
                fieldState={fieldState}
                label={t(translations.blocksAccessesFromInvalidSUS)}
              />
            )}
          />
        )}

        {passwordProtected && monitoringEnabled && (
          <Controller
            control={control}
            name="monitoring.enabled"
            render={({ field, fieldState }): JSX.Element => (
              <FormCheckboxField
                description={t(translations.examMonitoringHint, {
                  pulsegrid: (chunk) => (
                    <Link opensInNewTab to={pulsegridUrl}>
                      {chunk}
                    </Link>
                  ),
                })}
                disabled={!canManageMonitor || disabled}
                disabledHint={t(translations.onlyManagersOwnersCanEdit)}
                field={field}
                fieldState={fieldState}
                label={
                  <span className="flex items-center space-x-2">
                    <span>{t(translations.examMonitoring)}</span>
                    <BetaChip disabled={!canManageMonitor || disabled} />
                  </span>
                }
                labelClassName="mt-10"
              />
            )}
          />
        )}

        {passwordProtected && monitoring && (
          <>
            <Controller
              control={control}
              name="monitoring.secret"
              render={({ field, fieldState }): JSX.Element => (
                <FormTextField
                  disabled={!canManageMonitor || disabled}
                  field={field}
                  fieldState={fieldState}
                  fullWidth
                  label={t(translations.secret)}
                  variant="filled"
                />
              )}
            />

            <Typography
              className="!mt-0"
              color="text.secondary"
              variant="body2"
            >
              {t(translations.secretHint, {
                pulsegrid: (chunk) => (
                  <Link opensInNewTab to={pulsegridUrl}>
                    {chunk}
                  </Link>
                ),
              })}
            </Typography>

            <Grid container direction="row" spacing={2}>
              <Grid item xs>
                <Grid container direction="row" spacing={2}>
                  <Grid item xs>
                    <Controller
                      control={control}
                      name="monitoring.min_interval_ms"
                      render={({ field, fieldState }): JSX.Element => (
                        <FormTextField
                          disabled={!canManageMonitor || disabled}
                          field={field}
                          fieldState={fieldState}
                          fullWidth
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                {t(translations.milliseconds)}
                              </InputAdornment>
                            ),
                          }}
                          label={t(translations.minInterval)}
                          required
                          type="number"
                          variant="filled"
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs>
                    <Controller
                      control={control}
                      name="monitoring.max_interval_ms"
                      render={({ field, fieldState }): JSX.Element => (
                        <FormTextField
                          disabled={!canManageMonitor || disabled}
                          field={field}
                          fieldState={fieldState}
                          fullWidth
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                {t(translations.milliseconds)}
                              </InputAdornment>
                            ),
                          }}
                          label={t(translations.maxInterval)}
                          required
                          type="number"
                          variant="filled"
                        />
                      )}
                    />
                  </Grid>
                </Grid>

                <Typography
                  className="!mt-0"
                  color="text.secondary"
                  variant="body2"
                >
                  {t(translations.intervalHint)}
                </Typography>
              </Grid>

              <Grid item xs>
                <Controller
                  control={control}
                  name="monitoring.offset_ms"
                  render={({ field, fieldState }): JSX.Element => (
                    <FormTextField
                      disabled={!canManageMonitor || disabled}
                      field={field}
                      fieldState={fieldState}
                      fullWidth
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            {t(translations.milliseconds)}
                          </InputAdornment>
                        ),
                      }}
                      label={t(translations.offset)}
                      required
                      type="number"
                      variant="filled"
                    />
                  )}
                />

                <Typography
                  className="!mt-0"
                  color="text.secondary"
                  variant="body2"
                >
                  {t(translations.offsetHint)}
                </Typography>
              </Grid>
            </Grid>
          </>
        )}
      </Section>

      {showPersonalizedTimelineFeatures && (
        <HasAffectsPersonalTimesFields.Section sticksToNavbar={editing}>
          <HasAffectsPersonalTimesFields
            affectsPersonalTimesFieldName="affects_personal_times"
            control={control}
            disabled={disabled}
            hasPersonalTimesFieldName="has_personal_times"
          />
        </HasAffectsPersonalTimesFields.Section>
      )}
    </form>
  );
};

AssessmentForm.defaultProps = {
  gamified: true,
};

export default connector(AssessmentForm);
