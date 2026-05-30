import { FC } from 'react';
import { TextField } from '@mui/material';
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
    <div className="mt-1">
      <TextField
        fullWidth
        label={t(translations.overrideValue)}
        onChange={(e) => onChange({ value: e.target.value })}
        size="small"
        value={config.value}
      />
    </div>
  );
};

export default OverrideRandomizationManager;
