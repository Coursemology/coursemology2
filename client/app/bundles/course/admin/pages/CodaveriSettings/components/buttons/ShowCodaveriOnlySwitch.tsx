import { FC } from 'react';
import { FormControlLabel, Switch } from '@mui/material';

import { updateCodaveriSettingsPageViewSettings } from 'course/admin/reducers/codaveriSettings';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';

import { getViewSettings } from '../../selectors';
import translations from '../../translations';

const ShowCodaveriOnlySwitch: FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const { showCodaveriEnabled } = useAppSelector(getViewSettings);

  const handleSwitch = (isChecked: boolean): void => {
    dispatch(
      updateCodaveriSettingsPageViewSettings({
        showCodaveriEnabled: isChecked,
      }),
    );
  };

  return (
    <FormControlLabel
      control={
        <Switch
          checked={showCodaveriEnabled}
          onChange={(_, isChecked): void => handleSwitch(isChecked)}
        />
      }
      label={t(translations.showCodaveriOnly)}
    />
  );
};

export default ShowCodaveriOnlySwitch;
