import { FC } from 'react';
import { FormControlLabel, Switch } from '@mui/material';

import {
  updateIsCourseExpandedSettings,
  updateIsFolderExpandedSettings,
} from 'course/admin/reducers/ragWiseSettings';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';

import { EXPAND_SWITCH_TYPE } from '../../constants';
import {
  getCourseExpandedSettings,
  getFolderExpandedSettings,
} from '../../selectors';
import translations from '../../translations';

interface Props {
  type: keyof typeof EXPAND_SWITCH_TYPE;
}

const ExpandAllSwitch: FC<Props> = (props) => {
  const { type } = props;
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const isFolderExpanded = useAppSelector(getFolderExpandedSettings);
  const isCourseExpanded = useAppSelector(getCourseExpandedSettings);

  const handleSwitch = (isChecked: boolean): void => {
    const handlerFunc =
      type === EXPAND_SWITCH_TYPE.folders
        ? updateIsFolderExpandedSettings
        : updateIsCourseExpandedSettings;

    dispatch(
      handlerFunc({
        isExpanded: isChecked,
      }),
    );
  };

  return (
    <FormControlLabel
      control={
        <Switch
          checked={
            type === EXPAND_SWITCH_TYPE.folders
              ? isFolderExpanded
              : isCourseExpanded
          }
          onChange={(_, isChecked): void => handleSwitch(isChecked)}
        />
      }
      label={t(translations.expandAll, {
        object: type,
      })}
    />
  );
};

export default ExpandAllSwitch;
