import { useEffect } from 'react';
import useEmitterFactory from 'react-emitter-factory';
import { Controller } from 'react-hook-form';
import { injectIntl } from 'react-intl';
import {
  Block as DraftIcon,
  CheckCircle as AutogradedIcon,
  Create as ManualIcon,
  Public as PublishedIcon,
} from '@mui/icons-material';
import { Grid, RadioGroup, Typography } from '@mui/material';

import IconRadio from 'lib/components/core/buttons/IconRadio';
import ErrorText from 'lib/components/core/ErrorText';
import InfoLabel from 'lib/components/core/InfoLabel';
import Section from 'lib/components/core/layouts/Section';
import ConditionsManager from 'lib/components/extensions/conditions/ConditionsManager';
import FormCheckboxField from 'lib/components/form/fields/CheckboxField';
import FormDateTimePickerField from 'lib/components/form/fields/DateTimePickerField';
import FormRichTextField from 'lib/components/form/fields/RichTextField';
import FormSelectField from 'lib/components/form/fields/SelectField';
import FormTextField from 'lib/components/form/fields/TextField';

import FileManager from '../FileManager';

import { fetchTabs } from './actions';
import t from './translations.intl';
import { AssessmentFormProps, connector } from './types';
import useFormValidation from './useFormValidation';

const AssessmentForm = (props: AssessmentFormProps): JSX.Element => {
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
    formState: { errors, isDirty },
  } = useFormValidation(initialValues);

  const autograded = watch('autograded');
  const passwordProtected = watch('password_protected');
  const sessionProtected = watch('session_protected');

  // Load all tabs if data is loaded, otherwise fall back to current assessment tab.
  const loadedTabs = tabs ?? watch('tabs');

  useEffect(() => {
    if (!editing) return;

    const failureMessage = intl.formatMessage(t.fetchTabFailure);

    // @ts-ignore until Assessment store and a custom dispatch for thunk is fully typed
    // https://redux.js.org/tutorials/typescript-quick-start#define-typed-hooks
    dispatch(fetchTabs(failureMessage));
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
            fullWidth={true}
            label={intl.formatMessage(t.viewPassword)}
            required={true}
            type="password"
            variant="filled"
          />
        )}
      />

      <Typography className="!mt-0" color="text.secondary" variant="body2">
        {intl.formatMessage(t.viewPasswordHint)}
      </Typography>

      <Controller
        control={control}
        name="session_protected"
        render={({ field, fieldState }): JSX.Element => (
          <FormCheckboxField
            description={intl.formatMessage(t.sessionProtectionHint)}
            disabled={disabled ?? autograded}
            field={field}
            fieldState={fieldState}
            label={intl.formatMessage(t.sessionProtection)}
          />
        )}
      />

      {sessionProtected && (
        <>
          <Controller
            control={control}
            name="session_password"
            render={({ field, fieldState }): JSX.Element => (
              <FormTextField
                disabled={disabled}
                field={field}
                fieldState={fieldState}
                fullWidth={true}
                label={intl.formatMessage(t.sessionPassword)}
                required={true}
                type="password"
                variant="filled"
              />
            )}
          />

          <Typography className="!mt-0" color="text.secondary" variant="body2">
            {intl.formatMessage(t.sessionPasswordHint)}
          </Typography>
        </>
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
            label={intl.formatMessage(t.tab)}
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
      noValidate={true}
      onSubmit={handleSubmit((data) => onSubmit(data, setError))}
    >
      <ErrorText errors={errors} />

      <Section
        sticksToNavbar={editing}
        title={intl.formatMessage(t.assessmentDetails)}
      >
        <Controller
          control={control}
          name="title"
          render={({ field, fieldState }): JSX.Element => (
            <FormTextField
              disabled={disabled}
              disableMargins={true}
              field={field}
              fieldState={fieldState}
              fullWidth={true}
              label={intl.formatMessage(t.title)}
              required={true}
              variant="filled"
            />
          )}
        />

        <Grid columnSpacing={2} container={true} direction="row">
          <Grid item={true} xs={true}>
            <Controller
              control={control}
              name="start_at"
              render={({ field, fieldState }): JSX.Element => (
                <FormDateTimePickerField
                  disabled={disabled}
                  disableMargins={true}
                  disableShrinkingLabel={true}
                  field={field}
                  fieldState={fieldState}
                  label={intl.formatMessage(t.startAt)}
                  variant="filled"
                />
              )}
            />
          </Grid>

          <Grid item={true} xs={true}>
            <Controller
              control={control}
              name="end_at"
              render={({ field, fieldState }): JSX.Element => (
                <FormDateTimePickerField
                  disabled={disabled}
                  disableMargins={true}
                  disableShrinkingLabel={true}
                  field={field}
                  fieldState={fieldState}
                  label={intl.formatMessage(t.endAt)}
                  variant="filled"
                />
              )}
            />
          </Grid>

          {gamified && (
            <Grid item={true} xs={true}>
              <Controller
                control={control}
                name="bonus_end_at"
                render={({ field, fieldState }): JSX.Element => (
                  <FormDateTimePickerField
                    disabled={disabled}
                    disableMargins={true}
                    disableShrinkingLabel={true}
                    field={field}
                    fieldState={fieldState}
                    label={intl.formatMessage(t.bonusEndAt)}
                    variant="filled"
                  />
                )}
              />
            </Grid>
          )}
        </Grid>

        <Typography variant="body1">
          {intl.formatMessage(t.description)}
        </Typography>

        <Controller
          control={control}
          name="description"
          render={({ field, fieldState }): JSX.Element => (
            <FormRichTextField
              disabled={disabled}
              disableMargins={true}
              field={field}
              fieldState={fieldState}
              fullWidth={true}
              variant="standard"
            />
          )}
        />

        {editing && (
          <>
            <Typography variant="body1">
              {intl.formatMessage(t.visibility)}
            </Typography>

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
                    description={intl.formatMessage(t.publishedHint)}
                    icon={PublishedIcon}
                    label={intl.formatMessage(t.published)}
                    value="published"
                  />

                  <IconRadio
                    description={intl.formatMessage(t.draftHint)}
                    icon={DraftIcon}
                    label={intl.formatMessage(t.draft)}
                    value="draft"
                  />
                </RadioGroup>
              )}
            />
          </>
        )}

        {editing && folderAttributes && (
          <>
            <Typography variant="body1">
              {intl.formatMessage(t.files)}
            </Typography>

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
          title={intl.formatMessage(t.gamification)}
        >
          <Grid container={true} direction="row" spacing={2}>
            <Grid item={true} xs={true}>
              <Controller
                control={control}
                name="base_exp"
                render={({ field, fieldState }): JSX.Element => (
                  <FormTextField
                    disabled={disabled}
                    disableMargins={true}
                    field={field}
                    fieldState={fieldState}
                    fullWidth={true}
                    label={intl.formatMessage(t.baseExp)}
                    onWheel={(event): void => event.currentTarget.blur()}
                    type="number"
                    variant="filled"
                  />
                )}
              />
            </Grid>

            <Grid item={true} xs={true}>
              <Controller
                control={control}
                name="time_bonus_exp"
                render={({ field, fieldState }): JSX.Element => (
                  <FormTextField
                    disabled={disabled}
                    disableMargins={true}
                    field={field}
                    fieldState={fieldState}
                    fullWidth={true}
                    label={intl.formatMessage(t.timeBonusExp)}
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
              description={intl.formatMessage(t.unlockConditionsHint)}
              title={intl.formatMessage(t.unlockConditions)}
            />
          )}
        </Section>
      )}

      <Section sticksToNavbar={editing} title={intl.formatMessage(t.grading)}>
        <Typography variant="body1">
          {intl.formatMessage(t.gradingMode)}
        </Typography>

        {!modeSwitching && (
          <InfoLabel label={intl.formatMessage(t.modeSwitchingDisabled)} />
        )}

        {containsCodaveri && (
          <InfoLabel label={intl.formatMessage(t.containsCodaveriQuestion)} />
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
                description={intl.formatMessage(t.autogradedHint)}
                disabled={!!containsCodaveri || !!disabled || !modeSwitching}
                icon={AutogradedIcon}
                label="Autograded"
                value="autograded"
              />

              <IconRadio
                disabled={!!containsCodaveri || !!disabled || !modeSwitching}
                icon={ManualIcon}
                label="Manual"
                value="manual"
              />
            </RadioGroup>
          )}
        />

        <Typography variant="body1">
          {intl.formatMessage(t.calculateGradeWith)}
        </Typography>

        <Controller
          control={control}
          name="use_public"
          render={({ field, fieldState }): JSX.Element => (
            <FormCheckboxField
              disabled={disabled}
              field={field}
              fieldState={fieldState}
              label={intl.formatMessage(t.usePublic)}
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
              label={intl.formatMessage(t.usePrivate)}
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
              label={intl.formatMessage(t.useEvaluation)}
            />
          )}
        />

        <Controller
          control={control}
          name="delayed_grade_publication"
          render={({ field, fieldState }): JSX.Element => (
            <FormCheckboxField
              description={intl.formatMessage(t.delayedGradePublicationHint)}
              disabled={disabled ?? autograded}
              disabledHint={
                <InfoLabel
                  label={intl.formatMessage(t.unavailableInAutograded)}
                />
              }
              field={field}
              fieldState={fieldState}
              label={intl.formatMessage(t.delayedGradePublication)}
            />
          )}
        />
      </Section>

      <Section
        sticksToNavbar={editing}
        title={intl.formatMessage(t.answersAndTestCases)}
      >
        <Controller
          control={control}
          name="skippable"
          render={({ field, fieldState }): JSX.Element => (
            <FormCheckboxField
              disabled={disabled ?? !autograded}
              disabledHint={
                <InfoLabel label={intl.formatMessage(t.skippableManualHint)} />
              }
              field={field}
              fieldState={fieldState}
              label={intl.formatMessage(t.skippable)}
            />
          )}
        />
        <Controller
          control={control}
          name="allow_partial_submission"
          render={({ field, fieldState }): JSX.Element => (
            <FormCheckboxField
              disabled={disabled ?? !autograded}
              disabledHint={
                <InfoLabel
                  label={intl.formatMessage(t.unavailableInManuallyGraded)}
                />
              }
              field={field}
              fieldState={fieldState}
              label={intl.formatMessage(t.allowPartialSubmission)}
            />
          )}
        />

        <Typography variant="body1">
          {intl.formatMessage(t.afterSubmissionGraded)}
        </Typography>

        <Controller
          control={control}
          name="show_private"
          render={({ field, fieldState }): JSX.Element => (
            <FormCheckboxField
              description={intl.formatMessage(t.forProgrammingQuestions)}
              disabled={disabled}
              field={field}
              fieldState={fieldState}
              label={intl.formatMessage(t.showPrivate)}
            />
          )}
        />
        <Controller
          control={control}
          name="show_evaluation"
          render={({ field, fieldState }): JSX.Element => (
            <FormCheckboxField
              description={intl.formatMessage(t.forProgrammingQuestions)}
              disabled={disabled}
              field={field}
              fieldState={fieldState}
              label={intl.formatMessage(t.showEvaluation)}
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
              label={intl.formatMessage(t.showMcqMrqSolution)}
            />
          )}
        />
      </Section>

      <Section
        sticksToNavbar={editing}
        title={intl.formatMessage(t.organization)}
      >
        {editing && renderTabs()}

        <Controller
          control={control}
          name="tabbed_view"
          render={({ field, fieldState }): JSX.Element => (
            <FormSelectField
              disabled={disabled ?? autograded}
              field={field}
              fieldState={fieldState}
              label={intl.formatMessage(t.displayAssessmentAs)}
              margin="0"
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
              type="boolean"
              variant="filled"
            />
          )}
        />
      </Section>

      <Section
        sticksToNavbar={editing}
        title={intl.formatMessage(t.examsAndAccessControl)}
      >
        <Controller
          control={control}
          name="block_student_viewing_after_submitted"
          render={({ field, fieldState }): JSX.Element => (
            <FormCheckboxField
              disabled={disabled}
              field={field}
              fieldState={fieldState}
              label={intl.formatMessage(t.blockStudentViewingAfterSubmitted)}
            />
          )}
        />

        {randomizationAllowed && (
          <Controller
            control={control}
            name="randomization"
            render={({ field, fieldState }): JSX.Element => (
              <FormCheckboxField
                description={intl.formatMessage(t.enableRandomizationHint)}
                disabled={disabled}
                field={field}
                fieldState={fieldState}
                label={intl.formatMessage(t.enableRandomization)}
              />
            )}
          />
        )}

        <Controller
          control={control}
          name="show_mcq_answer"
          render={({ field, fieldState }): JSX.Element => (
            <FormCheckboxField
              description={intl.formatMessage(t.showMcqAnswerHint)}
              disabled={disabled ?? !autograded}
              disabledHint={
                <InfoLabel
                  label={intl.formatMessage(t.unavailableInManuallyGraded)}
                />
              }
              field={field}
              fieldState={fieldState}
              label={intl.formatMessage(t.showMcqAnswer)}
            />
          )}
        />

        <Controller
          control={control}
          name="password_protected"
          render={({ field, fieldState }): JSX.Element => (
            <FormCheckboxField
              disabled={disabled ?? autograded}
              disabledHint={
                <InfoLabel
                  label={intl.formatMessage(t.unavailableInAutograded)}
                />
              }
              field={field}
              fieldState={fieldState}
              label={intl.formatMessage(t.passwordProtection)}
            />
          )}
        />

        {!autograded && passwordProtected && renderPasswordFields()}
      </Section>

      {showPersonalizedTimelineFeatures && (
        <Section
          sticksToNavbar={editing}
          title={intl.formatMessage(t.personalisedTimelines)}
        >
          <Controller
            control={control}
            name="has_personal_times"
            render={({ field, fieldState }): JSX.Element => (
              <FormCheckboxField
                description={intl.formatMessage(t.hasPersonalTimesHint)}
                disabled={disabled}
                field={field}
                fieldState={fieldState}
                label={intl.formatMessage(t.hasPersonalTimes)}
              />
            )}
          />

          <Controller
            control={control}
            name="affects_personal_times"
            render={({ field, fieldState }): JSX.Element => (
              <FormCheckboxField
                description={intl.formatMessage(t.affectsPersonalTimesHint)}
                disabled={disabled}
                field={field}
                fieldState={fieldState}
                label={intl.formatMessage(t.affectsPersonalTimes)}
              />
            )}
          />
        </Section>
      )}
    </form>
  );
};

AssessmentForm.defaultProps = {
  gamified: true,
};

export default connector(injectIntl(AssessmentForm));
