/* eslint-disable camelcase */
import { useEffect } from 'react';
import { injectIntl } from 'react-intl';
import { Controller } from 'react-hook-form';
import { RadioGroup, Typography, Grid } from '@mui/material';
import {
  Public as PublishedIcon,
  Block as DraftIcon,
  Create as ManualIcon,
  CheckCircle as AutogradedIcon,
} from '@mui/icons-material';
import useEmitterFactory from 'react-emitter-factory';

import FormDateTimePickerField from 'lib/components/form/fields/DateTimePickerField';
import FormRichTextField from 'lib/components/form/fields/RichTextField';
import FormSelectField from 'lib/components/form/fields/SelectField';
import FormTextField from 'lib/components/form/fields/TextField';
import FormCheckboxField from 'lib/components/form/fields/CheckboxField';
import ErrorText from 'lib/components/ErrorText';
import ConditionList from 'lib/components/course/ConditionList';
import Section from 'lib/components/layouts/Section';
import IconRadio from 'lib/components/IconRadio';
import InfoLabel from 'lib/components/InfoLabel';
import t from './translations.intl';
import FileManager from '../FileManager';
import { fetchTabs } from './actions';
import useFormValidation from './useFormValidation';
import { connector, AssessmentFormProps } from './types';

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
        name="view_password"
        control={control}
        render={({ field, fieldState }): JSX.Element => (
          <FormTextField
            field={field}
            fieldState={fieldState}
            disabled={disabled}
            label={intl.formatMessage(t.viewPassword)}
            description={intl.formatMessage(t.viewPasswordHint)}
            fullWidth
            required
            variant="filled"
            type="password"
          />
        )}
      />

      <Controller
        name="session_protected"
        control={control}
        render={({ field, fieldState }): JSX.Element => (
          <FormCheckboxField
            field={field}
            fieldState={fieldState}
            disabled={disabled ?? autograded}
            label={intl.formatMessage(t.sessionProtection)}
            description={intl.formatMessage(t.sessionProtectionHint)}
          />
        )}
      />

      {sessionProtected && (
        <Controller
          name="session_password"
          control={control}
          render={({ field, fieldState }): JSX.Element => (
            <FormTextField
              field={field}
              fieldState={fieldState}
              disabled={disabled}
              label={intl.formatMessage(t.sessionPassword)}
              description={intl.formatMessage(t.sessionPasswordHint)}
              fullWidth
              required
              variant="filled"
              type="password"
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
        name="tab_id"
        control={control}
        render={({ field, fieldState }): JSX.Element => (
          <FormSelectField
            field={field}
            fieldState={fieldState}
            disabled={disabled}
            label={intl.formatMessage(t.tab)}
            options={options}
            variant="filled"
            margin="0"
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
        title={intl.formatMessage(t.assessmentDetails)}
        sticksToNavbar={editing}
      >
        <Controller
          name="title"
          control={control}
          render={({ field, fieldState }): JSX.Element => (
            <FormTextField
              field={field}
              fieldState={fieldState}
              disabled={disabled}
              label={intl.formatMessage(t.title)}
              fullWidth
              required
              variant="filled"
              margins={false}
            />
          )}
        />

        <Grid container spacing={2} direction="row">
          <Grid item xs>
            <Controller
              name="start_at"
              control={control}
              render={({ field, fieldState }): JSX.Element => (
                <FormDateTimePickerField
                  field={field}
                  fieldState={fieldState}
                  disabled={disabled}
                  label={intl.formatMessage(t.startAt)}
                  variant="filled"
                  disableMargins
                  disableShrinkingLabel
                />
              )}
            />
          </Grid>

          <Grid item xs>
            <Controller
              name="end_at"
              control={control}
              render={({ field, fieldState }): JSX.Element => (
                <FormDateTimePickerField
                  field={field}
                  fieldState={fieldState}
                  disabled={disabled}
                  label={intl.formatMessage(t.endAt)}
                  variant="filled"
                  disableMargins
                  disableShrinkingLabel
                />
              )}
            />
          </Grid>

          {gamified && (
            <Grid item xs>
              <Controller
                name="bonus_end_at"
                control={control}
                render={({ field, fieldState }): JSX.Element => (
                  <FormDateTimePickerField
                    field={field}
                    fieldState={fieldState}
                    disabled={disabled}
                    label={intl.formatMessage(t.bonusEndAt)}
                    variant="filled"
                    disableMargins
                    disableShrinkingLabel
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
          name="description"
          control={control}
          render={({ field, fieldState }): JSX.Element => (
            <FormRichTextField
              field={field}
              fieldState={fieldState}
              disabled={disabled}
              fullWidth
              variant="standard"
              disableMargins
            />
          )}
        />

        {editing && (
          <>
            <Typography variant="body1">
              {intl.formatMessage(t.visibility)}
            </Typography>

            <Controller
              name="published"
              control={control}
              render={({ field }): JSX.Element => (
                <RadioGroup
                  {...field}
                  value={field.value === true ? 'published' : 'draft'}
                  onChange={(e): void => {
                    const isPublished = e.target.value === 'published';
                    field.onChange(isPublished);
                  }}
                >
                  <IconRadio
                    value="published"
                    label={intl.formatMessage(t.published)}
                    icon={PublishedIcon}
                    description={intl.formatMessage(t.publishedHint)}
                  />

                  <IconRadio
                    value="draft"
                    label={intl.formatMessage(t.draft)}
                    icon={DraftIcon}
                    description={intl.formatMessage(t.draftHint)}
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
          title={intl.formatMessage(t.gamification)}
          sticksToNavbar={editing}
        >
          <Grid container spacing={2} direction="row">
            <Grid item xs>
              <Controller
                name="base_exp"
                control={control}
                render={({ field, fieldState }): JSX.Element => (
                  <FormTextField
                    field={field}
                    fieldState={fieldState}
                    disabled={disabled}
                    fullWidth
                    label={intl.formatMessage(t.baseExp)}
                    onWheel={(event): void => event.currentTarget.blur()}
                    type="number"
                    variant="filled"
                    margins={false}
                  />
                )}
              />
            </Grid>

            <Grid item xs>
              <Controller
                name="time_bonus_exp"
                control={control}
                render={({ field, fieldState }): JSX.Element => (
                  <FormTextField
                    field={field}
                    fieldState={fieldState}
                    disabled={disabled}
                    fullWidth
                    label={intl.formatMessage(t.timeBonusExp)}
                    onWheel={(event): void => event.currentTarget.blur()}
                    type="number"
                    variant="filled"
                    margins={false}
                  />
                )}
              />
            </Grid>
          </Grid>

          {editing && conditionAttributes && (
            <ConditionList
              title={intl.formatMessage(t.unlockConditions)}
              description={intl.formatMessage(t.unlockConditionsHint)}
              newConditionUrls={conditionAttributes.new_condition_urls}
              conditions={conditionAttributes.conditions}
            />
          )}
        </Section>
      )}

      <Section title={intl.formatMessage(t.grading)} sticksToNavbar={editing}>
        <Typography variant="body1">
          {intl.formatMessage(t.gradingMode)}
        </Typography>

        {!modeSwitching && (
          <InfoLabel label={intl.formatMessage(t.modeSwitchingDisabled)} />
        )}

        {containsCodaveri ? (
          <InfoLabel>
            {intl.formatMessage(t.containsCodaveriQuestion)}
          </InfoLabel>
        ) : null}

        <Controller
          name="autograded"
          control={control}
          render={({ field }): JSX.Element => (
            <>
              <RadioGroup
                {...field}
                value={field.value === true ? 'autograded' : 'manual'}
                onChange={(e): void => {
                  const isAutograded = e.target.value === 'autograded';
                  field.onChange(isAutograded);
                }}
              >
                <IconRadio
                  value="autograded"
                  label="Autograded"
                  icon={AutogradedIcon}
                  description={intl.formatMessage(t.autogradedHint)}
                  disabled={containsCodaveri ?? disabled ?? !modeSwitching}
                />

                <IconRadio
                  value="manual"
                  label="Manual"
                  icon={ManualIcon}
                  disabled={containsCodaveri ?? disabled ?? !modeSwitching}
                />
              </RadioGroup>
            </>
          )}
        />

        <Typography variant="body1">
          {intl.formatMessage(t.calculateGradeWith)}
        </Typography>

        <Controller
          name="use_public"
          control={control}
          render={({ field, fieldState }): JSX.Element => (
            <FormCheckboxField
              field={field}
              fieldState={fieldState}
              disabled={disabled}
              label={intl.formatMessage(t.usePublic)}
            />
          )}
        />
        <Controller
          name="use_private"
          control={control}
          render={({ field, fieldState }): JSX.Element => (
            <FormCheckboxField
              field={field}
              fieldState={fieldState}
              disabled={disabled}
              label={intl.formatMessage(t.usePrivate)}
            />
          )}
        />
        <Controller
          name="use_evaluation"
          control={control}
          render={({ field, fieldState }): JSX.Element => (
            <FormCheckboxField
              field={field}
              fieldState={fieldState}
              disabled={disabled}
              label={intl.formatMessage(t.useEvaluation)}
            />
          )}
        />

        <Controller
          name="delayed_grade_publication"
          control={control}
          render={({ field, fieldState }): JSX.Element => (
            <FormCheckboxField
              field={field}
              fieldState={fieldState}
              disabled={disabled ?? autograded}
              label={intl.formatMessage(t.delayedGradePublication)}
              description={intl.formatMessage(t.delayedGradePublicationHint)}
              disabledHint={
                <InfoLabel
                  label={intl.formatMessage(t.unavailableInAutograded)}
                />
              }
            />
          )}
        />
      </Section>

      <Section
        title={intl.formatMessage(t.answersAndTestCases)}
        sticksToNavbar={editing}
      >
        <Controller
          name="skippable"
          control={control}
          render={({ field, fieldState }): JSX.Element => (
            <FormCheckboxField
              field={field}
              fieldState={fieldState}
              disabled={disabled ?? !autograded}
              label={intl.formatMessage(t.skippable)}
              disabledHint={
                <InfoLabel label={intl.formatMessage(t.skippableManualHint)} />
              }
            />
          )}
        />
        <Controller
          name="allow_partial_submission"
          control={control}
          render={({ field, fieldState }): JSX.Element => (
            <FormCheckboxField
              field={field}
              fieldState={fieldState}
              disabled={disabled ?? !autograded}
              label={intl.formatMessage(t.allowPartialSubmission)}
              disabledHint={
                <InfoLabel
                  label={intl.formatMessage(t.unavailableInManuallyGraded)}
                />
              }
            />
          )}
        />

        <Typography variant="body1">
          {intl.formatMessage(t.afterSubmissionGraded)}
        </Typography>

        <Controller
          name="show_private"
          control={control}
          render={({ field, fieldState }): JSX.Element => (
            <FormCheckboxField
              field={field}
              fieldState={fieldState}
              disabled={disabled}
              label={intl.formatMessage(t.showPrivate)}
              description={intl.formatMessage(t.forProgrammingQuestions)}
            />
          )}
        />
        <Controller
          name="show_evaluation"
          control={control}
          render={({ field, fieldState }): JSX.Element => (
            <FormCheckboxField
              field={field}
              fieldState={fieldState}
              disabled={disabled}
              label={intl.formatMessage(t.showEvaluation)}
              description={intl.formatMessage(t.forProgrammingQuestions)}
            />
          )}
        />

        <Controller
          name="show_mcq_mrq_solution"
          control={control}
          render={({ field, fieldState }): JSX.Element => (
            <FormCheckboxField
              field={field}
              fieldState={fieldState}
              disabled={disabled}
              label={intl.formatMessage(t.showMcqMrqSolution)}
            />
          )}
        />
      </Section>

      <Section
        title={intl.formatMessage(t.organisation)}
        sticksToNavbar={editing}
      >
        {editing && renderTabs()}

        <Controller
          name="tabbed_view"
          control={control}
          render={({ field, fieldState }): JSX.Element => (
            <FormSelectField
              field={field}
              fieldState={fieldState}
              disabled={disabled ?? autograded}
              label={intl.formatMessage(t.displayAssessmentAs)}
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
              margin="0"
            />
          )}
        />
      </Section>

      <Section
        title={intl.formatMessage(t.examsAndAccessControl)}
        sticksToNavbar={editing}
      >
        <Controller
          name="block_student_viewing_after_submitted"
          control={control}
          render={({ field, fieldState }): JSX.Element => (
            <FormCheckboxField
              field={field}
              fieldState={fieldState}
              disabled={disabled}
              label={intl.formatMessage(t.blockStudentViewingAfterSubmitted)}
            />
          )}
        />

        {randomizationAllowed && (
          <Controller
            name="randomization"
            control={control}
            render={({ field, fieldState }): JSX.Element => (
              <FormCheckboxField
                field={field}
                fieldState={fieldState}
                disabled={disabled}
                label={intl.formatMessage(t.enableRandomization)}
                description={intl.formatMessage(t.enableRandomizationHint)}
              />
            )}
          />
        )}

        <Controller
          name="show_mcq_answer"
          control={control}
          render={({ field, fieldState }): JSX.Element => (
            <FormCheckboxField
              field={field}
              fieldState={fieldState}
              disabled={disabled ?? !autograded}
              label={intl.formatMessage(t.showMcqAnswer)}
              description={intl.formatMessage(t.showMcqAnswerHint)}
              disabledHint={
                <InfoLabel
                  label={intl.formatMessage(t.unavailableInManuallyGraded)}
                />
              }
            />
          )}
        />

        <Controller
          name="password_protected"
          control={control}
          render={({ field, fieldState }): JSX.Element => (
            <FormCheckboxField
              field={field}
              fieldState={fieldState}
              disabled={disabled ?? autograded}
              label={intl.formatMessage(t.passwordProtection)}
              disabledHint={
                <InfoLabel
                  label={intl.formatMessage(t.unavailableInAutograded)}
                />
              }
            />
          )}
        />

        {!autograded && passwordProtected && renderPasswordFields()}
      </Section>

      {showPersonalizedTimelineFeatures && (
        <Section
          title={intl.formatMessage(t.personalisedTimelines)}
          sticksToNavbar={editing}
        >
          <Controller
            name="has_personal_times"
            control={control}
            render={({ field, fieldState }): JSX.Element => (
              <FormCheckboxField
                field={field}
                fieldState={fieldState}
                disabled={disabled}
                label={intl.formatMessage(t.hasPersonalTimes)}
                description={intl.formatMessage(t.hasPersonalTimesHint)}
              />
            )}
          />

          <Controller
            name="affects_personal_times"
            control={control}
            render={({ field, fieldState }): JSX.Element => (
              <FormCheckboxField
                field={field}
                fieldState={fieldState}
                disabled={disabled}
                label={intl.formatMessage(t.affectsPersonalTimes)}
                description={intl.formatMessage(t.affectsPersonalTimesHint)}
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
