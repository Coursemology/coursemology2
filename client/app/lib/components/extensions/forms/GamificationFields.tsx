import { ComponentProps } from 'react';
import { Control, Controller, FieldPath, FieldValues } from 'react-hook-form';
import { defineMessages } from 'react-intl';
import { ConditionsData } from 'types/course/conditions';

import Section from 'lib/components/core/layouts/Section';
import ConditionsManager from 'lib/components/extensions/conditions/ConditionsManager';
import FormTextField from 'lib/components/form/fields/TextField';
import useTranslation from 'lib/hooks/useTranslation';

const translations = defineMessages({
  gamification: {
    id: 'lib.components.extensions.forms.GamificationFields.gamification',
    defaultMessage: 'Gamification',
  },
  baseExp: {
    id: 'lib.components.extensions.forms.GamificationFields.baseExp',
    defaultMessage: 'Base EXP',
  },
  timeBonusExp: {
    id: 'lib.components.extensions.forms.GamificationFields.timeBonusExp',
    defaultMessage: 'Time Bonus EXP',
  },
  unlockConditions: {
    id: 'lib.components.extensions.forms.GamificationFields.unlockConditions',
    defaultMessage: 'Unlock conditions',
  },
  unlockConditionsHint: {
    id: 'lib.components.extensions.forms.GamificationFields.unlockConditionsHint',
    defaultMessage:
      'This item will be unlocked if a student meets the following conditions.',
  },
});

interface GamificationFieldsProps<T extends FieldValues> {
  control: Control<T>;
  baseExpFieldName: FieldPath<T>;
  timeBonusExpFieldName: FieldPath<T>;
  conditionsData?: ConditionsData;
  disabled?: boolean;
}

const GamificationFields = <T extends FieldValues>(
  props: GamificationFieldsProps<T>,
): JSX.Element => {
  const { t } = useTranslation();

  return (
    <>
      <div className="flex space-x-5">
        <Controller
          control={props.control}
          name={props.baseExpFieldName}
          render={({ field, fieldState }): JSX.Element => (
            <FormTextField
              disabled={props.disabled}
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

        <Controller
          control={props.control}
          name={props.timeBonusExpFieldName}
          render={({ field, fieldState }): JSX.Element => (
            <FormTextField
              disabled={props.disabled}
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
      </div>

      {props.conditionsData && (
        <ConditionsManager
          conditionsData={props.conditionsData}
          description={t(translations.unlockConditionsHint)}
          disabled={props.disabled}
          title={t(translations.unlockConditions)}
        />
      )}
    </>
  );
};

const GamificationFieldsSection = (
  props: Omit<ComponentProps<typeof Section>, 'title'> & { title?: string },
): JSX.Element => {
  const { t } = useTranslation();

  return (
    <Section sticksToNavbar title={t(translations.gamification)} {...props} />
  );
};

export default Object.assign(GamificationFields, {
  Section: GamificationFieldsSection,
});
