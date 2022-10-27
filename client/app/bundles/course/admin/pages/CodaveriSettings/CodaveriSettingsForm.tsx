import { useState } from 'react';
import produce from 'immer';
import { FormControlLabel, Switch } from '@mui/material';

import Section from 'lib/components/core/layouts/Section';
import { CodaveriSettingsData } from 'types/course/admin/codaveri';
import useTranslation from 'lib/hooks/useTranslation';
import translations from './translations';

interface CodaveriSettingsFormProps {
  data: CodaveriSettingsData;
  onSubmit: (
    components: CodaveriSettingsData,
    action: (data: CodaveriSettingsData) => void,
  ) => void;
  disabled?: boolean;
}

const CodaveriSettingsForm = (
  props: CodaveriSettingsFormProps,
): JSX.Element => {
  const { t } = useTranslation();
  const [codaveriSetting, setCodaveriSetting] = useState(props.data);

  const toggleITSP = (enabled: boolean): void => {
    const newEnabledComponents = produce(codaveriSetting, (draft) => {
      draft.isOnlyITSP = enabled;
    });

    props.onSubmit(newEnabledComponents, (newData) => {
      setCodaveriSetting(newData);
    });
  };

  return (
    <Section title={t(translations.codaveriSettings)} sticksToNavbar>
      <FormControlLabel
        control={<Switch />}
        label={t(translations.enableIsOnlyITSP)}
        checked={codaveriSetting.isOnlyITSP}
        className="mb-0"
        disabled={props.disabled}
        onChange={(_, checked): void => toggleITSP(checked)}
      />
    </Section>
  );
};

export default CodaveriSettingsForm;
