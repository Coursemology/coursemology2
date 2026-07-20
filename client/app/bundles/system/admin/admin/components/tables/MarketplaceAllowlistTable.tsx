import { ReactNode } from 'react';
import { defineMessages } from 'react-intl';
import { StorefrontOutlined, WarningAmber } from '@mui/icons-material';
import { Tooltip, Typography } from '@mui/material';
import { AllowlistRuleData } from 'types/system/marketplaceAllowlist';

import DeleteButton from 'lib/components/core/buttons/DeleteButton';
import Link from 'lib/components/core/Link';
import Table, { ColumnTemplate } from 'lib/components/table';
import useTranslation from 'lib/hooks/useTranslation';

interface Props {
  rules: AllowlistRuleData[];
  onDelete: (id: number) => Promise<void>;
  disabled?: boolean;
  action?: ReactNode;
  /**
   * Rule id => number of listed users that rule grants access to. Null until the access list below
   * has loaded — an unknown count must NOT render as zero, or every rule flashes a warning on load.
   * A loaded map with no entry for a rule means it genuinely matches nobody: that is the warning.
   */
  matchCounts?: Map<number, number> | null;
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
  emptyTitle: {
    id: 'system.admin.admin.MarketplaceAllowlistTable.emptyTitle',
    defaultMessage: 'No access rules yet',
  },
  emptyHint: {
    id: 'system.admin.admin.MarketplaceAllowlistTable.emptyHint',
    defaultMessage:
      'The marketplace stays hidden from everyone except system administrators. Add a rule to grant access.',
  },
  zeroMatchWarning: {
    id: 'system.admin.admin.MarketplaceAllowlistTable.zeroMatchWarning',
    defaultMessage:
      'No eligible staff currently match this rule, so it grants access to nobody.',
  },
});

const MarketplaceAllowlistTable = ({
  rules,
  onDelete,
  disabled = false,
  action,
  matchCounts = null,
}: Props): JSX.Element => {
  const { t } = useTranslation();

  const typeLabels: Record<AllowlistRuleData['ruleType'], string> = {
    user: t(translations.typeUser),
    instance: t(translations.typeInstance),
    email_domain: t(translations.typeEmailDomain),
  };

  const targetOf = (rule: AllowlistRuleData): string => {
    switch (rule.ruleType) {
      case 'instance':
        return rule.instanceName ?? `#${rule.instanceId}`;
      default:
        return rule.emailDomain ?? '';
    }
  };

  const renderUserTarget = (rule: AllowlistRuleData): JSX.Element => (
    <span>
      <Link to={`/users/${rule.userId}`} underline="hover">
        {rule.userName ?? `#${rule.userId}`}
      </Link>
      {rule.userEmail && ` (${rule.userEmail})`}
    </span>
  );

  // A loaded map (not null) with no entry for this rule means no listed user is granted by it, i.e.
  // it matches nobody. Null is "not loaded yet", which must stay silent.
  const matchesNobody = (rule: AllowlistRuleData): boolean =>
    matchCounts !== null && !matchCounts.has(rule.id);

  const renderTarget = (rule: AllowlistRuleData): JSX.Element => (
    <span className="inline-flex items-center">
      {matchesNobody(rule) && (
        <Tooltip title={t(translations.zeroMatchWarning)}>
          <WarningAmber
            aria-label={t(translations.zeroMatchWarning)}
            className="mr-1 shrink-0"
            color="warning"
            fontSize="small"
          />
        </Tooltip>
      )}
      {rule.ruleType === 'user' ? renderUserTarget(rule) : targetOf(rule)}
    </span>
  );

  const columns: ColumnTemplate<AllowlistRuleData>[] = [
    {
      of: 'ruleType',
      title: t(translations.colType),
      cell: (rule) => typeLabels[rule.ruleType],
    },
    {
      id: 'target',
      title: t(translations.colTarget),
      cell: (rule) => renderTarget(rule),
    },
    {
      id: 'actions',
      title: t(translations.colActions),
      cell: (rule) => (
        <DeleteButton
          confirmMessage={t(translations.deleteConfirm)}
          disabled={disabled}
          onClick={(): Promise<void> => onDelete(rule.id)}
        />
      ),
    },
  ];

  const emptyState = (
    <div className="flex flex-col items-center gap-1 px-6 py-10 text-center">
      <StorefrontOutlined sx={{ fontSize: '3rem', color: 'action.disabled' }} />

      <Typography color="text.secondary" variant="body2">
        {t(translations.emptyTitle)}
      </Typography>

      <Typography className="max-w-md" color="text.disabled" variant="caption">
        {t(translations.emptyHint)}
      </Typography>
    </div>
  );

  return (
    <div className="relative">
      {action && <div className="absolute right-3 top-2.5 z-10">{action}</div>}

      <div className={disabled ? 'opacity-50' : undefined}>
        <Table
          className={action ? 'pt-14' : undefined}
          columns={columns}
          data={rules}
          getRowId={(rule): string => rule.id.toString()}
          renderEmpty={emptyState}
        />
      </div>
    </div>
  );
};

export default MarketplaceAllowlistTable;
