import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import { LeaderboardSettingsData } from 'types/course/admin/leaderboard';
import useTranslation from 'lib/hooks/useTranslation';
import translations from 'lib/translations/form';
import { FormEmitter } from 'lib/components/form/Form';
import LoadingIndicator from 'lib/components/LoadingIndicator';
import LeaderboardSettingsForm from './LeaderboardSettingsForm';
import {
  fetchLeaderboardSettings,
  updateLeaderboardSettings,
} from './operations';
import { useOptionsReloader } from '../../components/SettingsNavigation';

const LeaderboardSettings = (): JSX.Element => {
  const reloadOptions = useOptionsReloader();
  const { t } = useTranslation();
  const [settings, setSettings] = useState<LeaderboardSettingsData>();
  const [form, setForm] = useState<FormEmitter>();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchLeaderboardSettings().then(setSettings);
  }, []);

  if (!settings) return <LoadingIndicator />;

  const submit = (data: LeaderboardSettingsData): void => {
    setSubmitting(true);

    updateLeaderboardSettings(data)
      .then((newData) => {
        if (!newData) return;
        form?.resetTo?.(newData);
        reloadOptions();
        toast.success(t(translations.changesSaved));
      })
      .catch((error: Error) => {
        toast.error(error.message);
      })
      .finally(() => setSubmitting(false));
  };

  return (
    <LeaderboardSettingsForm
      data={settings}
      onSubmit={submit}
      emitsVia={setForm}
      disabled={submitting}
    />
  );
};

export default LeaderboardSettings;
