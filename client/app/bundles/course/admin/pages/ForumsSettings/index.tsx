import { useState } from 'react';
import { ForumsSettingsData } from 'types/course/admin/forums';

import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import { FormEmitter } from 'lib/components/form/Form';
import Preload from 'lib/components/wrappers/Preload';
import toast from 'lib/hooks/toast';
import useTranslation from 'lib/hooks/useTranslation';
import translations from 'lib/translations/form';

import { useItemsReloader } from '../../components/SettingsNavigation';

import ForumsSettingsForm from './ForumsSettingsForm';
import { fetchForumsSettings, updateForumsSettings } from './operations';

const ForumsSettings = (): JSX.Element => {
  const reloadItems = useItemsReloader();
  const { t } = useTranslation();
  const [form, setForm] = useState<FormEmitter<ForumsSettingsData>>();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (data: ForumsSettingsData): void => {
    setSubmitting(true);

    updateForumsSettings(data)
      .then((newData) => {
        if (!newData) return;
        form?.resetTo?.(newData);
        reloadItems();
        toast.success(t(translations.changesSaved));
      })
      .catch(form?.receiveErrors)
      .finally(() => setSubmitting(false));
  };

  return (
    <Preload render={<LoadingIndicator />} while={fetchForumsSettings}>
      {(data): JSX.Element => (
        <ForumsSettingsForm
          data={data}
          disabled={submitting}
          emitsVia={setForm}
          onSubmit={handleSubmit}
        />
      )}
    </Preload>
  );
};

export default ForumsSettings;
