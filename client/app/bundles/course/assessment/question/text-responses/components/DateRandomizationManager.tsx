import { FC } from 'react';
import { Checkbox, FormControlLabel } from '@mui/material';
import {
  DateTimePicker as MuiDateTimePicker,
  LocalizationProvider,
} from '@mui/x-date-pickers';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { CellRandomConfigBody } from 'types/course/assessment/question/text-responses';

import useTranslation from 'lib/hooks/useTranslation';
import moment from 'lib/moment';
import formTranslations from 'lib/translations/form';

import translations from '../../../translations';

interface Props {
  config: CellRandomConfigBody<'date'>;
  onChange: (newConfig: Partial<CellRandomConfigBody<'date'>>) => void;
  onBlur?: () => void;
}

const DateRandomizationManager: FC<Props> = ({ config, onChange, onBlur }) => {
  const { t } = useTranslation();

  return (
    <LocalizationProvider dateAdapter={AdapterMoment}>
      <div className="flex flex-col space-y-5 mt-1">
        <MuiDateTimePicker
          ampm={false}
          format="DD-MM-YYYY HH:mm"
          label={t(formTranslations.minimum)}
          onChange={(value) => {
            if (value?.isValid()) onChange({ min: value.toDate() });
          }}
          slotProps={{
            textField: { size: 'small', onBlur },
          }}
          timezone="UTC"
          value={config.min ? moment.utc(config.min) : null}
        />
        <MuiDateTimePicker
          ampm={false}
          format="DD-MM-YYYY HH:mm"
          label={t(formTranslations.maximum)}
          onChange={(value) => {
            if (value?.isValid()) onChange({ max: value.toDate() });
          }}
          slotProps={{
            textField: { size: 'small', onBlur },
          }}
          timezone="UTC"
          value={config.max ? moment.utc(config.max) : null}
        />
        <FormControlLabel
          componentsProps={{
            typography: { variant: 'subtitle2', fontWeight: 'normal' },
          }}
          control={
            <Checkbox
              checked={config.roundToDay}
              className="p-2 pl-4"
              onChange={(e) => onChange({ roundToDay: e.target.checked })}
              size="small"
            />
          }
          label={t(translations.roundToDay)}
        />
      </div>
    </LocalizationProvider>
  );
};

export default DateRandomizationManager;
