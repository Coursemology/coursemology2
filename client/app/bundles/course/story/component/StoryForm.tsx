import { Controller } from 'react-hook-form';
import { defineMessages } from 'react-intl';
import { Alert } from '@mui/material';
import { StoryData } from 'types/course/story/stories';

import Section from 'lib/components/core/layouts/Section';
import Subsection from 'lib/components/core/layouts/Subsection';
import DescriptionField from 'lib/components/extensions/forms/DescriptionField';
import GamificationFields from 'lib/components/extensions/forms/GamificationFields';
import HasAffectsPersonalTimesFields from 'lib/components/extensions/forms/HasAffectsPersonalTimesFields';
import TimeFields from 'lib/components/extensions/forms/TimeFields';
import TitleField from 'lib/components/extensions/forms/TitleField';
import VisibilityField from 'lib/components/extensions/forms/VisibilityField';
import FormTextField from 'lib/components/form/fields/TextField';
import Form from 'lib/components/form/Form';
import useTranslation from 'lib/hooks/useTranslation';

const translations = defineMessages({
  providerId: {
    id: 'course.story.edit.providerId',
    defaultMessage: 'Provider ID',
  },
  providerIdHint: {
    id: 'course.story.edit.providerIdHint',
    defaultMessage:
      'Coursemology integrates with Cikgo to deliver stories in this course. Manage your story in Cikgo, ' +
      'then enter its Provider ID here to use it here in Coursemology.',
  },
  providerSettings: {
    id: 'course.story.edit.providerSettings',
    defaultMessage: 'Provider settings',
  },
  storyDetails: {
    id: 'course.story.edit.storyDetails',
    defaultMessage: 'Story details',
  },
  cannotChangeProviderId: {
    id: 'course.story.edit.cannotChangeProviderId',
    defaultMessage:
      'You cannot change the Provider ID once there are rooms created in this story.',
  },
});

const StoryForm = ({
  initialValues,
  gamified,
  showPersonalizedTimelineFeatures,
  dirty,
  disabled,
  hasRooms,
}: {
  initialValues: StoryData;
  gamified: boolean;
  showPersonalizedTimelineFeatures: boolean;
  disabled?: boolean;
  dirty?: boolean;
  hasRooms?: boolean;
}): JSX.Element => {
  const { t } = useTranslation();

  return (
    <Form dirty={dirty} headsUp initialValues={initialValues}>
      {(control, watch) => {
        return (
          <>
            <Section sticksToNavbar title={t(translations.storyDetails)}>
              <TitleField control={control} disabled={disabled} name="title" />

              <TimeFields
                bonusEndTimeFieldName="bonusEndAt"
                control={control}
                disabled={disabled}
                endTimeFieldName="endAt"
                hasBonusEndTime
                startTimeFieldName="startAt"
              />

              <DescriptionField
                control={control}
                disabled={disabled}
                name="description"
              />

              <VisibilityField
                control={control}
                disabled={disabled}
                name="published"
              />
            </Section>

            {gamified && (
              <GamificationFields.Section>
                <GamificationFields
                  baseExpFieldName="baseExp"
                  control={control}
                  disabled={disabled}
                  timeBonusExpFieldName="timeBonusExp"
                />
              </GamificationFields.Section>
            )}

            <Section sticksToNavbar title={t(translations.providerSettings)}>
              <Subsection
                spaced
                subtitle={t(translations.providerIdHint)}
                title={t(translations.providerId)}
              >
                <Alert severity="info">
                  {t(translations.cannotChangeProviderId)}
                </Alert>

                <Controller
                  control={control}
                  name="providerId"
                  render={({ field, fieldState }): JSX.Element => (
                    <FormTextField
                      disabled={hasRooms || disabled}
                      disableMargins
                      field={field}
                      fieldState={fieldState}
                      fullWidth
                      label={t(translations.providerId)}
                      required
                      variant="filled"
                    />
                  )}
                />
              </Subsection>
            </Section>

            {showPersonalizedTimelineFeatures && (
              <HasAffectsPersonalTimesFields.Section>
                <HasAffectsPersonalTimesFields
                  affectsPersonalTimesFieldName="affectsPersonalTimes"
                  control={control}
                  disabled={disabled}
                  hasPersonalTimesFieldName="hasPersonalTimes"
                />
              </HasAffectsPersonalTimesFields.Section>
            )}
          </>
        );
      }}
    </Form>
  );
};

export default StoryForm;
