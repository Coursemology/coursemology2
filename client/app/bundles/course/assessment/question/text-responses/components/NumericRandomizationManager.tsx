import { FC, useEffect, useRef, useState } from 'react';
import { Checkbox, FormControlLabel, TextField } from '@mui/material';
import { CellRandomConfigBody } from 'types/course/assessment/question/text-responses';

import useTranslation from 'lib/hooks/useTranslation';
import formTranslations from 'lib/translations/form';

import translations from '../../../translations';

interface Props {
  config: CellRandomConfigBody<'numeric'>;
  onChange: (newConfig: Partial<CellRandomConfigBody<'numeric'>>) => void;
  onBlur?: () => void;
}

const NumericRandomizationManager: FC<Props> = (props) => {
  const { config, onChange, onBlur } = props;
  const { t } = useTranslation();

  const [minText, setMinText] = useState(String(config.min));
  const [maxText, setMaxText] = useState(String(config.max));
  const minFocused = useRef(false);
  const maxFocused = useRef(false);

  // Sync display when parent updates the config (e.g., after blur-triggered clamp),
  // but only when the field is not actively being edited.
  useEffect(() => {
    if (!minFocused.current) setMinText(String(config.min));
  }, [config.min]);
  useEffect(() => {
    if (!maxFocused.current) setMaxText(String(config.max));
  }, [config.max]);

  const handleBlur = (): void => {
    minFocused.current = false;
    maxFocused.current = false;
    const min = parseFloat(minText);
    const max = parseFloat(maxText);
    if (Number.isNaN(min)) setMinText(String(config.min));
    else onChange({ min });
    if (Number.isNaN(max)) setMaxText(String(config.max));
    else onChange({ max });
    onBlur?.();
  };

  return (
    <div className="flex flex-col space-y-5 mt-1">
      <TextField
        inputProps={{ inputMode: 'decimal' }}
        label={t(formTranslations.minimum)}
        onBlur={handleBlur}
        onChange={(e) => {
          setMinText(e.target.value);
          const v = parseFloat(e.target.value);
          if (!Number.isNaN(v)) onChange({ min: v });
        }}
        onFocus={() => {
          minFocused.current = true;
        }}
        size="small"
        value={minText}
      />
      <TextField
        inputProps={{ inputMode: 'decimal' }}
        label={t(formTranslations.maximum)}
        onBlur={handleBlur}
        onChange={(e) => {
          setMaxText(e.target.value);
          const v = parseFloat(e.target.value);
          if (!Number.isNaN(v)) onChange({ max: v });
        }}
        onFocus={() => {
          maxFocused.current = true;
        }}
        size="small"
        value={maxText}
      />
      <FormControlLabel
        componentsProps={{
          typography: { variant: 'subtitle2', fontWeight: 'normal' },
        }}
        control={
          <Checkbox
            checked={config.roundToInteger}
            className="p-2 pl-4"
            onChange={(e) => onChange({ roundToInteger: e.target.checked })}
            size="small"
          />
        }
        label={t(translations.roundToInteger)}
      />
    </div>
  );
};

export default NumericRandomizationManager;
