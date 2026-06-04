import { FC } from 'react';
import { Alert, FormHelperText } from '@mui/material';
import { CellRandomConfigBody } from 'types/course/assessment/question/text-responses';

import useTranslation from 'lib/hooks/useTranslation';

import translations from '../../../translations';

interface Props {
  config: CellRandomConfigBody<'override'>;
  onChange: (newConfig: Partial<CellRandomConfigBody<'override'>>) => void;
}

const OverrideRandomizationManager: FC<Props> = ({ config, onChange }) => {
  const { t } = useTranslation();
  return (
    <div className="mt-1 flex h-full flex-col space-y-1">
      <Alert icon={false} severity="info">
        {t(translations.overrideRandomizationModeDescription)}
      </Alert>
      <FormHelperText>{t(translations.overrideValue)}</FormHelperText>
      <textarea
        className="w-full h-full resize-none rounded border border-solid border-neutral-400 p-2 focus:outline-none focus:ring-1 focus:ring-inset focus:ring-blue-600"
        onChange={(e) => onChange({ value: e.target.value })}
        value={config.value}
      />
    </div>
  );
};

export default OverrideRandomizationManager;
