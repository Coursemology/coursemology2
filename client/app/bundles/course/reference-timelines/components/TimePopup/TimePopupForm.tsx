import { Controller } from 'react-hook-form';
import { Button, Collapse } from '@mui/material';
import { date, object, ref } from 'yup';

import FormDateTimePickerField from 'lib/components/form/fields/DateTimePickerField';
import Form from 'lib/components/form/Form';
import useTranslation from 'lib/hooks/useTranslation';
import moment from 'lib/moment';
import formTranslations from 'lib/translations/form';

import { useLastSaved } from '../../contexts';
import translations from '../../translations';
import { DraftableTimeData } from '../../utils';

const validationSchema = object({
  startAt: date()
    .typeError(translations.mustValidDateTimeFormat)
    .required(translations.mustSpecifyStartTime),
  endAt: date()
    .nullable()
    .typeError(translations.mustValidDateTimeFormat)
    .min(ref('startAt'), translations.endTimeMustAfterStart),
  bonusEndAt: date()
    .nullable()
    .typeError(translations.mustValidDateTimeFormat)
    .min(ref('startAt'), translations.bonusEndTimeMustAfterStart),
});

interface TimePopupFormProps {
  for?: Partial<DraftableTimeData>;
  showsBonus?: boolean;
  onSubmit?: (data: {
    startAt: moment.Moment;
    bonusEndAt?: moment.Moment;
    endAt?: moment.Moment;
  }) => void;
  new?: boolean;
}

const TimePopupForm = (props: TimePopupFormProps): JSX.Element => {
  const { for: time } = props;

  const { t } = useTranslation();

  const { status } = useLastSaved();

  return (
    <Form
      className="space-y-4"
      disabled={status === 'loading'}
      initialValues={{
        startAt: (time?.startAt ?? null) as moment.Moment,
        bonusEndAt: (time?.bonusEndAt ?? null) as moment.Moment,
        endAt: (time?.endAt ?? null) as moment.Moment,
      }}
      onSubmit={props.onSubmit}
      validates={validationSchema}
    >
      {(control, watch): JSX.Element => {
        let unchanged = false;

        if (!props.new) {
          const start = watch('startAt');
          const bonus = watch('bonusEndAt');
          const end = watch('endAt');

          unchanged = Boolean(
            time?.startAt && moment(start).isSame(time.startAt),
          );

          if (time?.bonusEndAt || bonus)
            unchanged &&= moment(bonus).isSame(time?.bonusEndAt);

          if (time?.endAt || end) unchanged &&= moment(end).isSame(time?.endAt);
        }

        return (
          <>
            <Controller
              control={control}
              name="startAt"
              render={({ field, fieldState }): JSX.Element => (
                <FormDateTimePickerField
                  disabled={status === 'loading'}
                  disableMargins
                  disableShrinkingLabel
                  field={field}
                  fieldState={fieldState}
                  label={t(translations.startsAt)}
                  required
                  suppressesFormatErrors
                  variant="filled"
                />
              )}
            />

            {props.showsBonus && (
              <Controller
                control={control}
                name="bonusEndAt"
                render={({ field, fieldState }): JSX.Element => (
                  <FormDateTimePickerField
                    disabled={status === 'loading'}
                    disableMargins
                    disableShrinkingLabel
                    field={field}
                    fieldState={fieldState}
                    label={t(translations.bonusEndsAt)}
                    suppressesFormatErrors
                    variant="filled"
                  />
                )}
              />
            )}

            <Controller
              control={control}
              name="endAt"
              render={({ field, fieldState }): JSX.Element => (
                <FormDateTimePickerField
                  disabled={status === 'loading'}
                  disableMargins
                  disableShrinkingLabel
                  field={field}
                  fieldState={fieldState}
                  label={t(translations.endsAt)}
                  suppressesFormatErrors
                  variant="filled"
                />
              )}
            />

            <Collapse className="!mt-0" collapsedSize={0} in={!unchanged}>
              <footer className="flex justify-end pt-4">
                <Button disabled={status === 'loading'} type="submit">
                  {t(formTranslations.save)}
                </Button>
              </footer>
            </Collapse>
          </>
        );
      }}
    </Form>
  );
};

export default TimePopupForm;
