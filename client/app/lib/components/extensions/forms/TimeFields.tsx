import { Control, Controller, FieldPath, FieldValues } from 'react-hook-form';
import { defineMessages } from 'react-intl';

import FormDateTimePickerField from 'lib/components/form/fields/DateTimePickerField';
import useTranslation from 'lib/hooks/useTranslation';

const translations = defineMessages({
  startAt: {
    id: 'lib.components.extensions.forms.TimeFields.startAt',
    defaultMessage: 'Starts at',
  },
  endAt: {
    id: 'lib.components.extensions.forms.TimeFields.endAt',
    defaultMessage: 'Ends at',
  },
  bonusEndAt: {
    id: 'lib.components.extensions.forms.TimeFields.bonusEndAt',
    defaultMessage: 'Bonus ends at',
  },
});

interface TimeFieldsProps<
  TFieldValues extends FieldValues,
  THasBonusEndTime extends boolean | undefined,
> {
  control: Control<TFieldValues>;
  startTimeFieldName: FieldPath<TFieldValues>;
  endTimeFieldName: FieldPath<TFieldValues>;
  hasBonusEndTime?: THasBonusEndTime;
  bonusEndTimeFieldName?: NonNullable<THasBonusEndTime> extends true
    ? FieldPath<TFieldValues>
    : never;
  disabled?: boolean;
}

const TimeFields = <
  TFieldValues extends FieldValues,
  THasBonusEndTime extends boolean,
>(
  props: TimeFieldsProps<TFieldValues, THasBonusEndTime>,
): JSX.Element => {
  const { t } = useTranslation();

  return (
    <div className="flex space-x-5">
      <Controller
        control={props.control}
        name={props.startTimeFieldName}
        render={({ field, fieldState }): JSX.Element => (
          <FormDateTimePickerField
            className="w-full"
            disabled={props.disabled}
            disableMargins
            disableShrinkingLabel
            field={field}
            fieldState={fieldState}
            label={t(translations.startAt)}
            required
            style={{ width: '100%' }}
            variant="filled"
          />
        )}
      />

      <Controller
        control={props.control}
        name={props.endTimeFieldName}
        render={({ field, fieldState }): JSX.Element => (
          <FormDateTimePickerField
            disabled={props.disabled}
            disableMargins
            disableShrinkingLabel
            field={field}
            fieldState={fieldState}
            label={t(translations.endAt)}
            style={{ width: '100%' }}
            variant="filled"
          />
        )}
      />

      {props.hasBonusEndTime && (
        <Controller
          control={props.control}
          name={props.bonusEndTimeFieldName!}
          render={({ field, fieldState }): JSX.Element => (
            <FormDateTimePickerField
              disabled={props.disabled}
              disableMargins
              disableShrinkingLabel
              field={field}
              fieldState={fieldState}
              label={t(translations.bonusEndAt)}
              style={{ width: '100%' }}
              variant="filled"
            />
          )}
        />
      )}
    </div>
  );
};

export default TimeFields;
