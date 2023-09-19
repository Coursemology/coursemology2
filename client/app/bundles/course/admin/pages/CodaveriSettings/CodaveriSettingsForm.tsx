import { useState } from 'react';
import { RadioGroup } from '@mui/material';
import { produce } from 'immer';
import { CodaveriSettingsData } from 'types/course/admin/codaveri';

import RadioButton from 'lib/components/core/buttons/RadioButton';
import Section from 'lib/components/core/layouts/Section';
import Subsection from 'lib/components/core/layouts/Subsection';
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

  const toggleSetting = (
    setting: keyof CodaveriSettingsData,
    enabled: boolean,
  ): void => {
    const newEnabledComponents = produce(codaveriSetting, (draft) => {
      draft[setting] = enabled;
    });

    props.onSubmit(newEnabledComponents, (newData) => {
      setCodaveriSetting(newData);
    });
  };

  return (
    <Section
      contentClassName="flex flex-col space-y-3"
      sticksToNavbar
      subtitle={t(translations.codaveriSettingsSubtitle)}
      title={t(translations.codaveriSettings)}
    >
      <Subsection
        className="!mt-12"
        subtitle={t(translations.codaveriEngineDescription)}
        title={t(translations.codaveriEngine)}
      >
        <RadioGroup
          className="space-y-5"
          onChange={(_, value): void =>
            toggleSetting('isOnlyITSP', value === 'itsp')
          }
          value={codaveriSetting.isOnlyITSP ? 'itsp' : 'default'}
        >
          <RadioButton
            className="my-0"
            description={t(translations.defaultEngineDescription)}
            disabled={props.disabled}
            label={t(translations.defaultEngine)}
            value="default"
          />

          <RadioButton
            className="my-0"
            description={t(translations.itspEngineDescription)}
            disabled={props.disabled}
            label={t(translations.itspEngine)}
            value="itsp"
          />
        </RadioGroup>
      </Subsection>
    </Section>
  );
};

export default CodaveriSettingsForm;
