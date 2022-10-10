import { useState } from 'react';
import { toast } from 'react-toastify';

import { LeaderboardSettingsData } from 'types/course/admin/leaderboard';
import useTranslation from 'lib/hooks/useTranslation';
import translations from 'lib/translations/form';
import { FormEmitter } from 'lib/components/form/Form';
import LoadingIndicator from 'lib/components/LoadingIndicator';
import Preload from 'lib/components/Preload';
import { setReactHookFormError } from 'lib/helpers/react-hook-form-helper';
import LeaderboardSettingsForm from './LeaderboardSettingsForm';
import {
  fetchLeaderboardSettings,
  updateLeaderboardSettings,
} from './operations';
import { useOptionsReloader } from '../../components/SettingsNavigation';

const LeaderboardSettings = (): JSX.Element => {
  const reloadOptions = useOptionsReloader();
  const { t } = useTranslation();
  const [form, setForm] = useState<FormEmitter>();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (data: LeaderboardSettingsData): void => {
    setSubmitting(true);

    updateLeaderboardSettings(data)
      .then((newData) => {
        if (!newData) return;
        form?.resetTo?.(newData);
        reloadOptions();
        toast.success(t(translations.changesSaved));
      })
      .catch((errors) => {
        setReactHookFormError(form?.setError, errors);
      })
      .finally(() => setSubmitting(false));
  };

  return (
    <Preload while={fetchLeaderboardSettings} render={<LoadingIndicator />}>
      {(data): JSX.Element => (
        <LeaderboardSettingsForm
          data={data}
          onSubmit={handleSubmit}
          emitsVia={setForm}
          disabled={submitting}
        />
      )}
    </Preload>
  );
};

export default LeaderboardSettings;
