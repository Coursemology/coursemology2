import { useState } from 'react';
import { FormControlLabel, Switch } from '@mui/material';
import { produce } from 'immer';
import { CourseComponents } from 'types/course/admin/components';

import { getComponentTitle } from 'course/translations';
import Section from 'lib/components/core/layouts/Section';
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
      contentClassName="flex flex-col space-y-3"
      sticksToNavbar
      subtitle={t(translations.componentSettingsSubtitle)}
      title={t(translations.componentSettings)}
    >
      {components.map((component, index) => (
        <FormControlLabel
          key={component.id}
          checked={component.enabled}
          className="mb-0"
          control={<Switch />}
          disabled={props.disabled}
          id={`component_${component.id}`}
          label={getComponentTitle(t, component.id)}
          onChange={(_, checked): void => toggleComponent(index, checked)}
        />
      ))}
    </Section>
  );
};

export default ComponentSettingsForm;
