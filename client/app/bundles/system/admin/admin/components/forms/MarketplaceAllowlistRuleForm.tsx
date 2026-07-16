import { useState } from 'react';
import { defineMessages } from 'react-intl';
import { MenuItem, TextField } from '@mui/material';
import {
  AllowlistRuleFormData,
  AllowlistRuleType,
} from 'types/system/marketplaceAllowlist';

import Prompt from 'lib/components/core/dialogs/Prompt';
import useTranslation from 'lib/hooks/useTranslation';

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: AllowlistRuleFormData) => Promise<void>;
}

const translations = defineMessages({
  title: {
    id: 'system.admin.admin.MarketplaceAllowlistRuleForm.title',
    defaultMessage: 'Add marketplace access rule',
  },
  ruleType: {
    id: 'system.admin.admin.MarketplaceAllowlistRuleForm.ruleType',
    defaultMessage: 'Rule type',
  },
  typeUser: {
    id: 'system.admin.admin.MarketplaceAllowlistRuleForm.typeUser',
    defaultMessage: 'Specific user',
  },
  typeInstance: {
    id: 'system.admin.admin.MarketplaceAllowlistRuleForm.typeInstance',
    defaultMessage: 'All users in an instance',
  },
  typeEmailDomain: {
    id: 'system.admin.admin.MarketplaceAllowlistRuleForm.typeEmailDomain',
    defaultMessage: 'All users with an email domain',
  },
  userId: {
    id: 'system.admin.admin.MarketplaceAllowlistRuleForm.userId',
    defaultMessage: 'User ID',
  },
  instanceId: {
    id: 'system.admin.admin.MarketplaceAllowlistRuleForm.instanceId',
    defaultMessage: 'Instance ID',
  },
  emailDomain: {
    id: 'system.admin.admin.MarketplaceAllowlistRuleForm.emailDomain',
    defaultMessage: 'Email domain (e.g. schools.gov.sg)',
  },
  add: {
    id: 'system.admin.admin.MarketplaceAllowlistRuleForm.add',
    defaultMessage: 'Add',
  },
});

const MarketplaceAllowlistRuleForm = ({
  open,
  onClose,
  onSubmit,
}: Props): JSX.Element => {
  const { t } = useTranslation();
  const [ruleType, setRuleType] = useState<AllowlistRuleType>('email_domain');
  const [value, setValue] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const reset = (): void => {
    setRuleType('email_domain');
    setValue('');
  };

  const handleClose = (): void => {
    reset();
    onClose();
  };

  const buildData = (): AllowlistRuleFormData => {
    switch (ruleType) {
      case 'user':
        return { ruleType, userId: parseInt(value, 10) };
      case 'instance':
        return { ruleType, instanceId: parseInt(value, 10) };
      default:
        return { ruleType, emailDomain: value.trim() };
    }
  };

  const submit = async (): Promise<void> => {
    setSubmitting(true);
    await onSubmit(buildData()).finally(() => setSubmitting(false));
    reset();
  };

  const valueLabel = {
    user: t(translations.userId),
    instance: t(translations.instanceId),
    email_domain: t(translations.emailDomain),
  }[ruleType];

  return (
    <Prompt
      disabled={submitting || value.trim() === ''}
      onClickPrimary={submit}
      onClose={handleClose}
      open={open}
      primaryLabel={t(translations.add)}
      title={t(translations.title)}
    >
      <div className="mt-2 space-y-4">
        <TextField
          fullWidth
          label={t(translations.ruleType)}
          onChange={(e): void => {
            setRuleType(e.target.value as AllowlistRuleType);
            setValue('');
          }}
          select
          value={ruleType}
        >
          <MenuItem value="user">{t(translations.typeUser)}</MenuItem>
          <MenuItem value="instance">{t(translations.typeInstance)}</MenuItem>
          <MenuItem value="email_domain">
            {t(translations.typeEmailDomain)}
          </MenuItem>
        </TextField>

        <TextField
          fullWidth
          label={valueLabel}
          onChange={(e): void => setValue(e.target.value)}
          type={ruleType === 'email_domain' ? 'text' : 'number'}
          value={value}
        />
      </div>
    </Prompt>
  );
};

export default MarketplaceAllowlistRuleForm;
