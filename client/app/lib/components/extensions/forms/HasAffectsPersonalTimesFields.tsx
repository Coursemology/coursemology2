import { ComponentProps } from 'react';
import { Control, Controller, FieldPath, FieldValues } from 'react-hook-form';
import { defineMessages } from 'react-intl';

import Section from 'lib/components/core/layouts/Section';
import FormCheckboxField from 'lib/components/form/fields/CheckboxField';
import useTranslation from 'lib/hooks/useTranslation';

const translations = defineMessages({
  hasPersonalTimes: {
    id: 'lib.components.extensions.forms.HasAffectsPersonalTimesFields.hasPersonalTimes',
    defaultMessage: 'Has personal times',
  },
  hasPersonalTimesHint: {
    id: 'lib.components.extensions.forms.HasAffectsPersonalTimesFields.hasPersonalTimesHint',
    defaultMessage:
      'Timings for this item will be automatically adjusted for users based on learning rate.',
  },
  affectsPersonalTimes: {
    id: 'lib.components.extensions.forms.HasAffectsPersonalTimesFields.affectsPersonalTimes',
    defaultMessage: 'Affects personal times',
  },
  affectsPersonalTimesHint: {
    id: 'lib.components.extensions.forms.HasAffectsPersonalTimesFields.affectsPersonalTimesHint',
    defaultMessage:
      "Student's submission time for this item will be taken into account \
      when updating personal times for other items.",
  },
  personalisedTimelines: {
    id: 'lib.components.extensions.forms.personalisedTimelines',
    defaultMessage: 'Personalised timelines',
  },
});

interface HasAffectsPersonalTimesFieldsProps<T extends FieldValues> {
  control: Control<T>;
  hasPersonalTimesFieldName: FieldPath<T>;
  affectsPersonalTimesFieldName: FieldPath<T>;
  disabled?: boolean;
}

const HasAffectsPersonalTimesFields = <T extends FieldValues>(
  props: HasAffectsPersonalTimesFieldsProps<T>,
): JSX.Element => {
  const { t } = useTranslation();

  return (
    <>
      <Controller
        control={props.control}
        name={props.hasPersonalTimesFieldName}
        render={({ field, fieldState }): JSX.Element => (
          <FormCheckboxField
            description={t(translations.hasPersonalTimesHint)}
            disabled={props.disabled}
            field={field}
            fieldState={fieldState}
            label={t(translations.hasPersonalTimes)}
          />
        )}
      />

      <Controller
        control={props.control}
        name={props.affectsPersonalTimesFieldName}
        render={({ field, fieldState }): JSX.Element => (
          <FormCheckboxField
            description={t(translations.affectsPersonalTimesHint)}
            disabled={props.disabled}
            field={field}
            fieldState={fieldState}
            label={t(translations.affectsPersonalTimes)}
          />
        )}
      />
    </>
  );
};

const PersonalizedTimelinesSection = (
  props: Omit<ComponentProps<typeof Section>, 'title'> & { title?: string },
): JSX.Element => {
  const { t } = useTranslation();

  return (
    <Section
      sticksToNavbar
      title={t(translations.personalisedTimelines)}
      {...props}
    />
  );
};

export default Object.assign(HasAffectsPersonalTimesFields, {
  Section: PersonalizedTimelinesSection,
});
