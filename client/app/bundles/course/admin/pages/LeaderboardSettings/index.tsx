import { useState } from 'react';
import { LeaderboardSettingsData } from 'types/course/admin/leaderboard';

import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import { FormEmitter } from 'lib/components/form/Form';
import Preload from 'lib/components/wrappers/Preload';
import toast from 'lib/hooks/toast';
import useTranslation from 'lib/hooks/useTranslation';
import translations from 'lib/translations/form';

import { useItemsReloader } from '../../components/SettingsNavigation';

import LeaderboardSettingsForm from './LeaderboardSettingsForm';
import {
  fetchLeaderboardSettings,
  updateLeaderboardSettings,
} from './operations';

const LeaderboardSettings = (): JSX.Element => {
  const reloadItems = useItemsReloader();
  const { t } = useTranslation();
  const [form, setForm] = useState<FormEmitter<LeaderboardSettingsData>>();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (data: LeaderboardSettingsData): void => {
    setSubmitting(true);

    updateLeaderboardSettings(data)
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
    <Preload render={<LoadingIndicator />} while={fetchLeaderboardSettings}>
      {(data): JSX.Element => (
        <LeaderboardSettingsForm
          data={data}
          disabled={submitting}
          emitsVia={setForm}
          onSubmit={handleSubmit}
        />
      )}
    </Preload>
  );
};

export default LeaderboardSettings;
