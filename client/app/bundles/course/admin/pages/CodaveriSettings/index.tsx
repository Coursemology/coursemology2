import { useState } from 'react';
import { toast } from 'react-toastify';

import { CodaveriSettingsData } from 'types/course/admin/codaveri';
import useTranslation from 'lib/hooks/useTranslation';
import formTranslations from 'lib/translations/form';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import Preload from 'lib/components/wrappers/Preload';
import translations from './translations';
import CodaveriSettingsForm from './CodaveriSettingsForm';
import { fetchCodaveriSettings, updateCodaveriSettings } from './operations';
import { useItemsReloader } from '../../components/SettingsNavigation';

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
    <Preload while={fetchCodaveriSettings} render={<LoadingIndicator />}>
      {(data): JSX.Element => (
        <CodaveriSettingsForm
          data={data}
          onSubmit={handleSubmit}
          disabled={submitting}
        />
      )}
    </Preload>
  );
};

export default CodaveriSettings;
