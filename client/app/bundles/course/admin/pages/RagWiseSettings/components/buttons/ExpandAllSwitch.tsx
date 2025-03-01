import { FC } from 'react';
import { FormControlLabel, Switch } from '@mui/material';

import { updateIsFolderExpandedSettings } from 'course/admin/reducers/ragWiseSettings';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';

import { getExpandedSettings } from '../../selectors';
import translations from '../../translations';

const ExpandAllSwitch: FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const isFolderExpanded = useAppSelector(getExpandedSettings);

  const handleSwitch = (isChecked: boolean): void => {
    dispatch(
      updateIsFolderExpandedSettings({
        isExpanded: isChecked,
      }),
    );
  };

  return (
    <FormControlLabel
      control={
        <Switch
          checked={isFolderExpanded}
          onChange={(_, isChecked): void => handleSwitch(isChecked)}
        />
      }
      label={t(translations.expandAll)}
    />
  );
};

export default ExpandAllSwitch;
