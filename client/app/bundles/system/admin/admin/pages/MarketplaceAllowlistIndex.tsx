import { FC, useEffect, useState } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
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
import MarketplaceAllowlistTable from '../components/tables/MarketplaceAllowlistTable';

type Props = WrappedComponentProps;

const translations = defineMessages({
  header: {
    id: 'system.admin.admin.MarketplaceAllowlistIndex.header',
    defaultMessage: 'Marketplace Access',
  },
  addRule: {
    id: 'system.admin.admin.MarketplaceAllowlistIndex.addRule',
    defaultMessage: 'Add rule',
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
});

const MarketplaceAllowlistIndex: FC<Props> = ({ intl }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [rules, setRules] = useState<AllowlistRuleData[]>([]);

  useEffect(() => {
    SystemAPI.admin
      .indexMarketplaceAllowlistRules()
      .then((response) => setRules(response.data.rules))
      .catch(() => toast.error(intl.formatMessage(translations.fetchFailure)))
      .finally(() => setIsLoading(false));
  }, []);

  const handleCreate = async (data: AllowlistRuleFormData): Promise<void> => {
    try {
      const response =
        await SystemAPI.admin.createMarketplaceAllowlistRule(data);
      setRules((current) => [...current, response.data]);
      toast.success(intl.formatMessage(translations.createSuccess));
      setIsFormOpen(false);
    } catch {
      toast.error(intl.formatMessage(translations.createFailure));
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

  if (isLoading) return <LoadingIndicator />;

  return (
    <Page title={intl.formatMessage(translations.header)}>
      <AddButton
        className="float-right"
        fixed
        id="add-allowlist-rule-button"
        onClick={(): void => setIsFormOpen(true)}
      >
        {intl.formatMessage(translations.addRule)}
      </AddButton>

      <MarketplaceAllowlistTable onDelete={handleDelete} rules={rules} />

      <MarketplaceAllowlistRuleForm
        onClose={(): void => setIsFormOpen(false)}
        onSubmit={handleCreate}
        open={isFormOpen}
      />
    </Page>
  );
};

export default injectIntl(MarketplaceAllowlistIndex);
