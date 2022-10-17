import { useState } from 'react';
import produce from 'immer';
import { FormControlLabel, Switch } from '@mui/material';

import Section from 'lib/components/core/layouts/Section';
import { CourseComponents } from 'types/course/admin/components';
import useTranslation from 'lib/hooks/useTranslation';
import translations from './translations';

interface ComponentSettingsFormProps {
  data: CourseComponents;
  onChangeComponents: (
    components: CourseComponents,
    action: (data: CourseComponents) => void,
  ) => void;
  disabled?: boolean;
}

const ComponentSettingsForm = (
  props: ComponentSettingsFormProps,
): JSX.Element => {
  const { t } = useTranslation();
  const [components, setComponents] = useState(props.data);

  const toggleComponent = (index: number, enabled: boolean): void => {
    const newEnabledComponents = produce(components, (draft) => {
      draft[index].enabled = enabled;
    });

    props.onChangeComponents(newEnabledComponents, (newData) => {
      setComponents(newData);
    });
  };

  return (
    <Section
      title={t(translations.componentSettings)}
      subtitle={t(translations.componentSettingsSubtitle)}
      sticksToNavbar
      contentClassName="flex flex-col space-y-3"
    >
      {components.map((component, index) => (
        <FormControlLabel
          key={component.id}
          control={<Switch />}
          label={component.displayName}
          checked={component.enabled}
          className="mb-0"
          disabled={props.disabled}
          onChange={(_, checked): void => toggleComponent(index, checked)}
        />
      ))}
    </Section>
  );
};

export default ComponentSettingsForm;
