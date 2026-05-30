import { FC } from 'react';
import { Alert, Checkbox, FormControlLabel } from '@mui/material';
import { CellRandomConfigBody } from 'types/course/assessment/question/text-responses';

import useTranslation from 'lib/hooks/useTranslation';

import translations from '../../../translations';

interface Props {
  config: CellRandomConfigBody<'string'>;
  onChange: (newConfig: Partial<CellRandomConfigBody<'string'>>) => void;
}

const StringRandomizationManager: FC<Props> = ({ config, onChange }) => {
  const { t } = useTranslation();
  return (
    <div className="mt-1 flex flex-col">
      <Alert icon={false} severity="info">
        {t(translations.stringRandomizationModeDescription)}
      </Alert>
      <FormControlLabel
        componentsProps={{
          typography: {
            variant: 'subtitle2',
          },
        }}
        control={
          <Checkbox
            checked={config.randomizeLetters}
            className="p-2 pl-4"
            onChange={(e) => onChange({ randomizeLetters: e.target.checked })}
            size="small"
          />
        }
        label={t(translations.randomizeLetters)}
      />
      <FormControlLabel
        componentsProps={{
          typography: {
            variant: 'subtitle2',
          },
        }}
        control={
          <Checkbox
            checked={config.randomizeDigits}
            className="p-2 pl-4"
            onChange={(e) => onChange({ randomizeDigits: e.target.checked })}
            size="small"
          />
        }
        label={t(translations.randomizeDigits)}
      />
    </div>
  );
};

export default StringRandomizationManager;
