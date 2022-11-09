import { useState } from 'react';
import { FormControlLabel, Switch } from '@mui/material';
import produce from 'immer';
import { CodaveriSettingsData } from 'types/course/admin/codaveri';

import Section from 'lib/components/core/layouts/Section';
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
    <Section
      sticksToNavbar={true}
      subtitle={t(translations.codaverSettingsSubtitle)}
      title={t(translations.codaveriSettings)}
    >
      <FormControlLabel
        checked={codaveriSetting.isOnlyITSP}
        className="mb-0"
        control={<Switch />}
        disabled={props.disabled}
        label={t(translations.enableIsOnlyITSP)}
        onChange={(_, checked): void => toggleITSP(checked)}
      />
    </Section>
  );
};

export default CodaveriSettingsForm;
