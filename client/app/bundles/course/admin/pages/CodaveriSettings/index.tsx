import { useState } from 'react';
import { CodaveriSettingsData } from 'types/course/admin/codaveri';

import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import Preload from 'lib/components/wrappers/Preload';
import toast from 'lib/hooks/toast';
import useTranslation from 'lib/hooks/useTranslation';
import formTranslations from 'lib/translations/form';

import { useItemsReloader } from '../../components/SettingsNavigation';

import CodaveriSettingsForm from './CodaveriSettingsForm';
import { fetchCodaveriSettings, updateCodaveriSettings } from './operations';
import translations from './translations';

const CodaveriSettings = (): JSX.Element => {
  const reloadItems = useItemsReloader();
  const { t } = useTranslation();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (
    data: CodaveriSettingsData,
    action: (data: CodaveriSettingsData) => void,
  ): void => {
    setSubmitting(true);

    updateCodaveriSettings(data)
      .then((newData) => {
        if (!newData) return;
        action(newData);
        reloadItems();
        toast.success(t(formTranslations.changesSaved));
      })
      .catch(() => {
        toast.error(t(translations.errorOccurredWhenUpdating));
      })
      .finally(() => setSubmitting(false));
  };

  return (
    <Preload render={<LoadingIndicator />} while={fetchCodaveriSettings}>
      {(data): JSX.Element => (
        <CodaveriSettingsForm
          data={data}
          disabled={submitting}
          onSubmit={handleSubmit}
        />
      )}
    </Preload>
  );
};

export default CodaveriSettings;
