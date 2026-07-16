import { defineMessages } from 'react-intl';
import { AllowlistRuleData } from 'types/system/marketplaceAllowlist';

import DeleteButton from 'lib/components/core/buttons/DeleteButton';
import Table, { ColumnTemplate } from 'lib/components/table';
import useTranslation from 'lib/hooks/useTranslation';

interface Props {
  rules: AllowlistRuleData[];
  onDelete: (id: number) => Promise<void>;
}

const translations = defineMessages({
  colType: {
    id: 'system.admin.admin.MarketplaceAllowlistTable.colType',
    defaultMessage: 'Type',
  },
  colTarget: {
    id: 'system.admin.admin.MarketplaceAllowlistTable.colTarget',
    defaultMessage: 'Grants access to',
  },
  colActions: {
    id: 'system.admin.admin.MarketplaceAllowlistTable.colActions',
    defaultMessage: 'Actions',
  },
  typeUser: {
    id: 'system.admin.admin.MarketplaceAllowlistTable.typeUser',
    defaultMessage: 'User',
  },
  typeInstance: {
    id: 'system.admin.admin.MarketplaceAllowlistTable.typeInstance',
    defaultMessage: 'Instance',
  },
  typeEmailDomain: {
    id: 'system.admin.admin.MarketplaceAllowlistTable.typeEmailDomain',
    defaultMessage: 'Email domain',
  },
  deleteConfirm: {
    id: 'system.admin.admin.MarketplaceAllowlistTable.deleteConfirm',
    defaultMessage: 'Remove this marketplace access rule?',
  },
  empty: {
    id: 'system.admin.admin.MarketplaceAllowlistTable.empty',
    defaultMessage:
      'No access rules yet. The marketplace is hidden from everyone except system administrators.',
  },
});

const MarketplaceAllowlistTable = ({ rules, onDelete }: Props): JSX.Element => {
  const { t } = useTranslation();

  const typeLabels: Record<AllowlistRuleData['ruleType'], string> = {
    user: t(translations.typeUser),
    instance: t(translations.typeInstance),
    email_domain: t(translations.typeEmailDomain),
  };

  const targetOf = (rule: AllowlistRuleData): string => {
    switch (rule.ruleType) {
      case 'user':
        return rule.userName ?? `#${rule.userId}`;
      case 'instance':
        return rule.instanceName ?? `#${rule.instanceId}`;
      default:
        return rule.emailDomain ?? '';
    }
  };

  const columns: ColumnTemplate<AllowlistRuleData>[] = [
    {
      of: 'ruleType',
      title: t(translations.colType),
      cell: (rule) => typeLabels[rule.ruleType],
    },
    {
      id: 'target',
      title: t(translations.colTarget),
      cell: (rule) => targetOf(rule),
    },
    {
      id: 'actions',
      title: t(translations.colActions),
      cell: (rule) => (
        <DeleteButton
          confirmMessage={t(translations.deleteConfirm)}
          disabled={false}
          onClick={(): Promise<void> => onDelete(rule.id)}
        />
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      data={rules}
      getRowId={(rule): string => rule.id.toString()}
      renderEmpty={t(translations.empty)}
    />
  );
};

export default MarketplaceAllowlistTable;
