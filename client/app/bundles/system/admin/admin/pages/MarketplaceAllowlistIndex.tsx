import { FC, useEffect, useState } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { Typography } from '@mui/material';
import { AxiosError } from 'axios';
import {
  AllowlistRuleData,
  AllowlistRuleFormData,
} from 'types/system/marketplaceAllowlist';

import SystemAPI from 'api/system';
import AddButton from 'lib/components/core/buttons/AddButton';
import Page from 'lib/components/core/layouts/Page';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import toast from 'lib/hooks/toast';

import MarketplaceAllowlistRuleForm from '../components/forms/MarketplaceAllowlistRuleForm';
import MarketplaceAllowlistModeBanner from '../components/MarketplaceAllowlistModeBanner';
import MarketplaceAllowlistTable from '../components/tables/MarketplaceAllowlistTable';

type Props = WrappedComponentProps;

const translations = defineMessages({
  addRule: {
    id: 'system.admin.admin.MarketplaceAllowlistIndex.addRule',
    defaultMessage: 'Add access rule',
  },
  eligibility: {
    id: 'system.admin.admin.MarketplaceAllowlistIndex.eligibility',
    defaultMessage:
      'Available to course managers & owners (of any course) and instance instructors & administrators (of any instance). They must also match one of the rules below.',
  },
  fetchFailure: {
    id: 'system.admin.admin.MarketplaceAllowlistIndex.fetchFailure',
    defaultMessage: 'Failed to load marketplace access rules.',
  },
  createSuccess: {
    id: 'system.admin.admin.MarketplaceAllowlistIndex.createSuccess',
    defaultMessage: 'Access rule added.',
  },
  createFailure: {
    id: 'system.admin.admin.MarketplaceAllowlistIndex.createFailure',
    defaultMessage: 'Failed to add access rule.',
  },
  deleteSuccess: {
    id: 'system.admin.admin.MarketplaceAllowlistIndex.deleteSuccess',
    defaultMessage: 'Access rule removed.',
  },
  deleteFailure: {
    id: 'system.admin.admin.MarketplaceAllowlistIndex.deleteFailure',
    defaultMessage: 'Failed to remove access rule.',
  },
  openSuccess: {
    id: 'system.admin.admin.MarketplaceAllowlistIndex.openSuccess',
    defaultMessage: 'Marketplace opened to all course managers.',
  },
  openFailure: {
    id: 'system.admin.admin.MarketplaceAllowlistIndex.openFailure',
    defaultMessage: 'Failed to open the marketplace to everyone.',
  },
  restrictSuccess: {
    id: 'system.admin.admin.MarketplaceAllowlistIndex.restrictSuccess',
    defaultMessage: 'Marketplace restricted to the scoped rules.',
  },
  restrictFailure: {
    id: 'system.admin.admin.MarketplaceAllowlistIndex.restrictFailure',
    defaultMessage: 'Failed to restrict the marketplace.',
  },
});

const MarketplaceAllowlistIndex: FC<Props> = ({ intl }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [rules, setRules] = useState<AllowlistRuleData[]>([]);
  const [everyoneRuleId, setEveryoneRuleId] = useState<number | null>(null);

  useEffect(() => {
    SystemAPI.admin
      .indexMarketplaceAllowlistRules()
      .then((response) => {
        setRules(response.data.rules);
        setEveryoneRuleId(response.data.everyoneRuleId ?? null);
      })
      .catch(() => toast.error(intl.formatMessage(translations.fetchFailure)))
      .finally(() => setIsLoading(false));
  }, []);

  const openToEveryone = everyoneRuleId !== null;

  const handleCreate = async (data: AllowlistRuleFormData): Promise<void> => {
    try {
      const response =
        await SystemAPI.admin.createMarketplaceAllowlistRule(data);
      setRules((current) => [...current, response.data]);
      toast.success(intl.formatMessage(translations.createSuccess));
      setIsFormOpen(false);
    } catch (error) {
      // Surface the server's reason (e.g. the duplicate-rule message) — the generic fallback
      // would discard exactly the message that was written for this case.
      const message =
        error instanceof AxiosError ? error.response?.data?.errors : undefined;
      toast.error(message ?? intl.formatMessage(translations.createFailure));
    }
  };

  const handleDelete = async (id: number): Promise<void> => {
    try {
      await SystemAPI.admin.deleteMarketplaceAllowlistRule(id);
      setRules((current) => current.filter((rule) => rule.id !== id));
      toast.success(intl.formatMessage(translations.deleteSuccess));
    } catch {
      toast.error(intl.formatMessage(translations.deleteFailure));
    }
  };

  const handleOpenToEveryone = async (): Promise<void> => {
    try {
      const response = await SystemAPI.admin.openMarketplaceToEveryone();
      setEveryoneRuleId(response.data.id);
      toast.success(intl.formatMessage(translations.openSuccess));
    } catch {
      toast.error(intl.formatMessage(translations.openFailure));
    }
  };

  const handleRestrict = async (): Promise<void> => {
    if (everyoneRuleId === null) return;
    try {
      await SystemAPI.admin.deleteMarketplaceAllowlistRule(everyoneRuleId);
      setEveryoneRuleId(null);
      toast.success(intl.formatMessage(translations.restrictSuccess));
    } catch {
      toast.error(intl.formatMessage(translations.restrictFailure));
    }
  };

  if (isLoading) return <LoadingIndicator />;

  return (
    <Page>
      <Typography className="mb-4" color="text.secondary" variant="body2">
        {intl.formatMessage(translations.eligibility)}
      </Typography>
      <MarketplaceAllowlistModeBanner
        onOpenToEveryone={handleOpenToEveryone}
        onRestrict={handleRestrict}
        openToEveryone={openToEveryone}
      />

      <MarketplaceAllowlistTable
        action={
          <AddButton
            disabled={openToEveryone}
            fixed
            id="add-allowlist-rule-button"
            onClick={(): void => setIsFormOpen(true)}
          >
            {intl.formatMessage(translations.addRule)}
          </AddButton>
        }
        disabled={openToEveryone}
        onDelete={handleDelete}
        rules={rules}
      />

      <MarketplaceAllowlistRuleForm
        onClose={(): void => setIsFormOpen(false)}
        onSubmit={handleCreate}
        open={isFormOpen}
      />
    </Page>
  );
};

export default injectIntl(MarketplaceAllowlistIndex);
