import { useEffect, useState } from 'react';
import { defineMessages } from 'react-intl';
import {
  Alert,
  Autocomplete,
  Box,
  Chip,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material';
import { AxiosError } from 'axios';
import { AllowlistRulePreviewData } from 'types/system/marketplaceAccess';
import {
  AllowlistRuleFormData,
  AllowlistRuleType,
} from 'types/system/marketplaceAllowlist';

import SystemAPI from 'api/system';
import Prompt from 'lib/components/core/dialogs/Prompt';
import Link from 'lib/components/core/Link';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import Table, { ColumnTemplate } from 'lib/components/table';
import useTranslation from 'lib/hooks/useTranslation';

interface InstanceOption {
  id: number;
  name: string;
}

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
    defaultMessage: 'Specific eligible user',
  },
  typeInstance: {
    id: 'system.admin.admin.MarketplaceAllowlistRuleForm.typeInstance',
    defaultMessage: 'All eligible users in an instance',
  },
  typeEmailDomain: {
    id: 'system.admin.admin.MarketplaceAllowlistRuleForm.typeEmailDomain',
    defaultMessage: 'All eligible users with an email domain',
  },
  userEmail: {
    id: 'system.admin.admin.MarketplaceAllowlistRuleForm.userEmail',
    defaultMessage: 'Eligible user email',
  },
  eligibilityHint: {
    id: 'system.admin.admin.MarketplaceAllowlistRuleForm.eligibilityHint',
    defaultMessage:
      'Eligible users refer to course managers & owners (of any course) and instance instructors & administrators (of any instance).',
  },
  instanceLabel: {
    id: 'system.admin.admin.MarketplaceAllowlistRuleForm.instanceId',
    defaultMessage: 'Instance',
  },
  emailDomain: {
    id: 'system.admin.admin.MarketplaceAllowlistRuleForm.emailDomain',
    defaultMessage: 'Email domain (e.g. schools.gov.sg)',
  },
  next: {
    id: 'system.admin.admin.MarketplaceAllowlistRuleForm.next',
    defaultMessage: 'Next',
  },
  back: {
    id: 'system.admin.admin.MarketplaceAllowlistRuleForm.back',
    defaultMessage: 'Back',
  },
  confirmAdd: {
    id: 'system.admin.admin.MarketplaceAllowlistRuleForm.confirmAdd',
    defaultMessage: 'Confirm add',
  },
  counts: {
    id: 'system.admin.admin.MarketplaceAllowlistRuleForm.counts',
    defaultMessage:
      'Grants access to {matched, plural, one {# eligible user} other {# eligible users}}',
  },
  countsOfMatched: {
    id: 'system.admin.admin.MarketplaceAllowlistRuleForm.countsOfMatched',
    defaultMessage:
      'Grants access to {granted} of {matched, plural, one {# eligible user} other {# eligible users}}',
  },
  countsExistingClause: {
    id: 'system.admin.admin.MarketplaceAllowlistRuleForm.countsExistingClause',
    defaultMessage: '{existing} already had access',
  },
  countsBlockedClause: {
    id: 'system.admin.admin.MarketplaceAllowlistRuleForm.countsBlockedClause',
    defaultMessage: '{blocked} blocked individually',
  },
  noMatches: {
    id: 'system.admin.admin.MarketplaceAllowlistRuleForm.noMatches',
    defaultMessage: 'This rule matches nobody eligible right now.',
  },
  openToEveryone: {
    id: 'system.admin.admin.MarketplaceAllowlistRuleForm.openToEveryone',
    defaultMessage:
      'The marketplace is currently open to everyone; this rule takes effect only if you restrict access again.',
  },
  previewFailure: {
    id: 'system.admin.admin.MarketplaceAllowlistRuleForm.previewFailure',
    defaultMessage: 'Could not preview this rule.',
  },
  markerNew: {
    id: 'system.admin.admin.MarketplaceAllowlistRuleForm.markerNew',
    defaultMessage: 'New',
  },
  markerExisting: {
    id: 'system.admin.admin.MarketplaceAllowlistRuleForm.markerExisting',
    defaultMessage: 'Already has access',
  },
  markerBlocked: {
    id: 'system.admin.admin.MarketplaceAllowlistRuleForm.markerBlocked',
    defaultMessage: 'Blocked',
  },
  managesCourses: {
    id: 'system.admin.admin.MarketplaceAllowlistRuleForm.managesCourses',
    defaultMessage: 'Manages {count, plural, one {# course} other {# courses}}',
  },
  colName: {
    id: 'system.admin.admin.MarketplaceAllowlistRuleForm.colName',
    defaultMessage: 'Name',
  },
  colEligibleVia: {
    id: 'system.admin.admin.MarketplaceAllowlistRuleForm.colEligibleVia',
    defaultMessage: 'Eligible via',
  },
  colStatus: {
    id: 'system.admin.admin.MarketplaceAllowlistRuleForm.colStatus',
    defaultMessage: 'Status',
  },
  searchPlaceholder: {
    id: 'system.admin.admin.MarketplaceAllowlistRuleForm.searchPlaceholder',
    defaultMessage: 'Search by name or email',
  },
});

const MarketplaceAllowlistRuleForm = ({
  open,
  onClose,
  onSubmit,
}: Props): JSX.Element => {
  const { t } = useTranslation();
  const [step, setStep] = useState<1 | 2>(1);
  const [ruleType, setRuleType] = useState<AllowlistRuleType>('email_domain');
  const [value, setValue] = useState('');
  const [instanceId, setInstanceId] = useState<number | null>(null);
  const [instances, setInstances] = useState<InstanceOption[]>([]);
  const [instancesLoaded, setInstancesLoaded] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [preview, setPreview] = useState<AllowlistRulePreviewData | null>(null);
  // A validation verdict (400) blocks the add; a transport failure does not.
  const [rejection, setRejection] = useState<string | null>(null);
  const [previewFailed, setPreviewFailed] = useState(false);

  // The instance list is only needed for the `instance` rule type, so fetch it lazily the first
  // time that type is selected — keeps the page's initial load free of an unused request.
  useEffect(() => {
    if (ruleType !== 'instance' || instancesLoaded) return;
    SystemAPI.admin.indexInstances().then((response) => {
      setInstances(
        response.data.instances.map((instance) => ({
          id: instance.id,
          name: instance.name,
        })),
      );
      setInstancesLoaded(true);
    });
  }, [ruleType, instancesLoaded]);

  const buildData = (): AllowlistRuleFormData => {
    switch (ruleType) {
      case 'user':
        return { ruleType, email: value.trim() };
      case 'instance':
        return { ruleType, instanceId: instanceId ?? undefined };
      default:
        return { ruleType, emailDomain: value.trim() };
    }
  };

  const reset = (): void => {
    setStep(1);
    setRuleType('email_domain');
    setValue('');
    setInstanceId(null);
    setPreview(null);
    setRejection(null);
    setPreviewFailed(false);
  };

  const handleClose = (): void => {
    reset();
    onClose();
  };

  const goToPreview = async (): Promise<void> => {
    setStep(2);
    setPreviewing(true);
    setPreview(null);
    setRejection(null);
    setPreviewFailed(false);

    try {
      const response =
        await SystemAPI.admin.previewMarketplaceAllowlistRule(buildData());
      setPreview(response.data);
    } catch (error) {
      const response = error instanceof AxiosError ? error.response : undefined;
      const message = response?.data?.errors;
      if (response?.status === 400 && message) setRejection(message);
      else setPreviewFailed(true);
    } finally {
      setPreviewing(false);
    }
  };

  const submit = async (): Promise<void> => {
    setSubmitting(true);
    await onSubmit(buildData()).finally(() => setSubmitting(false));
    reset();
  };

  const valueLabel = {
    user: t(translations.userEmail),
    instance: t(translations.instanceLabel),
    email_domain: t(translations.emailDomain),
  }[ruleType];

  const missingValue =
    ruleType === 'instance' ? instanceId === null : value.trim() === '';

  const marker = (user: AllowlistRulePreviewData['users'][number]): string => {
    if (user.blocked) return t(translations.markerBlocked);
    if (user.alreadyHasAccess) return t(translations.markerExisting);
    return t(translations.markerNew);
  };

  // Blocked is the one status that means the rule does not reach this person, so it is the one
  // worth colouring; New and Already-has-access are both benign and stay neutral.
  const markerColor = (
    user: AllowlistRulePreviewData['users'][number],
  ): 'warning' | 'default' => (user.blocked ? 'warning' : 'default');

  const previewColumns: ColumnTemplate<
    AllowlistRulePreviewData['users'][number]
  >[] = [
    {
      of: 'name',
      title: t(translations.colName),
      searchable: true,
      cell: (user) => (
        <div className="flex flex-col">
          <Link to={`/users/${user.id}`} underline="hover">
            {user.name}
          </Link>

          <Typography color="text.secondary" variant="caption">
            {user.email}
          </Typography>
        </div>
      ),
    },
    {
      id: 'eligibleVia',
      title: t(translations.colEligibleVia),
      cell: (user) =>
        t(translations.managesCourses, { count: user.courseCount }),
    },
    {
      id: 'status',
      title: t(translations.colStatus),
      // Fixed width, wide enough for the longest marker: the table sizes columns from the rows on
      // the CURRENT page, so a page holding a Blocked chip was laying out differently from a page
      // of nothing but New, and the whole table shifted as the admin paged through.
      className: 'w-[16rem]',
      cell: (user) => (
        <Chip
          className="whitespace-nowrap"
          color={markerColor(user)}
          label={marker(user)}
          size="small"
          variant="outlined"
        />
      ),
    },
  ];

  const renderCounts = (): JSX.Element => {
    if (preview === null) return <span />;
    if (preview.openToEveryone) {
      return <Alert severity="info">{t(translations.openToEveryone)}</Alert>;
    }
    if (preview.matchedCount === 0) {
      return <Alert severity="warning">{t(translations.noMatches)}</Alert>;
    }

    // "N are new" was noise when everyone is new (the common case); the useful signal is who the
    // rule does NOT reach, so name those groups only when there IS one. A blocked user keeps their
    // individual block — the rule grants them nothing — so they are neither granted nor "existing".
    const blocked = preview.blockedCount;
    const existing = preview.matchedCount - preview.newCount - blocked;
    const clauses = [
      existing > 0 && t(translations.countsExistingClause, { existing }),
      blocked > 0 && t(translations.countsBlockedClause, { blocked }),
    ].filter(Boolean);

    const headline =
      clauses.length > 0
        ? t(translations.countsOfMatched, {
            granted: preview.newCount,
            matched: preview.matchedCount,
          })
        : t(translations.counts, { matched: preview.matchedCount });

    return (
      <Typography variant="body2">
        {[headline, ...clauses].join(' · ')}
      </Typography>
    );
  };

  const renderStepTwo = (): JSX.Element => {
    if (previewing) return <LoadingIndicator />;
    if (rejection !== null) return <Alert severity="error">{rejection}</Alert>;
    if (previewFailed) {
      return <Alert severity="warning">{t(translations.previewFailure)}</Alert>;
    }

    // The prebuilt Table, not a hand-rolled list: a domain or instance rule routinely matches
    // hundreds of people, which needs pagination and search, and its real columns keep the three
    // headers aligned for free. With nobody matched there is nothing to page or search, so the
    // headers and pagination chrome would be furniture around an empty box — the counts line
    // already says what happened.
    const users = preview?.users ?? [];

    return (
      <div className="space-y-3">
        {renderCounts()}

        {users.length > 0 && (
          <Table
            columns={previewColumns}
            data={users}
            getRowId={(user): string => user.id.toString()}
            pagination={{ initialPageSize: 10, rowsPerPage: [10, 20, 50, 100] }}
            search={{
              searchPlaceholder: t(translations.searchPlaceholder),
              searchProps: {
                shouldInclude: (user, filterValue?: string): boolean => {
                  if (!filterValue) return true;
                  const query = filterValue.toLowerCase().trim();
                  return (
                    user.name.toLowerCase().includes(query) ||
                    user.email.toLowerCase().includes(query)
                  );
                },
              },
            }}
          />
        )}
      </div>
    );
  };

  return (
    <Prompt
      cancelDisabled={submitting}
      onClickPrimary={step === 1 ? goToPreview : submit}
      onClickSecondary={(): void => setStep(1)}
      onClose={handleClose}
      open={open}
      primaryDisabled={
        step === 1
          ? missingValue
          : submitting || previewing || rejection !== null
      }
      primaryLabel={
        step === 1 ? t(translations.next) : t(translations.confirmAdd)
      }
      secondaryLabel={step === 2 ? t(translations.back) : undefined}
      title={t(translations.title)}
    >
      {step === 1 ? (
        <div className="mt-2 space-y-4">
          <TextField
            fullWidth
            label={t(translations.ruleType)}
            onChange={(e): void => {
              setRuleType(e.target.value as AllowlistRuleType);
              setValue('');
              setInstanceId(null);
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

          {ruleType === 'instance' ? (
            <Autocomplete
              fullWidth
              getOptionLabel={(instance): string => instance.name}
              isOptionEqualToValue={(instance, chosen): boolean =>
                instance.id === chosen.id
              }
              onChange={(_, instance): void =>
                setInstanceId(instance?.id ?? null)
              }
              options={instances}
              renderInput={(inputProps): JSX.Element => (
                <TextField
                  {...inputProps}
                  label={t(translations.instanceLabel)}
                  variant="standard"
                />
              )}
              renderOption={(optionProps, instance): JSX.Element => (
                <Box component="li" {...optionProps} key={instance.id}>
                  {instance.name}
                </Box>
              )}
              value={
                instances.find((instance) => instance.id === instanceId) ?? null
              }
            />
          ) : (
            <TextField
              fullWidth
              label={valueLabel}
              onChange={(e): void => setValue(e.target.value)}
              value={value}
            />
          )}

          {/* `caption` renders inline by default, which drops the parent's vertical rhythm. */}
          <Typography color="text.secondary" component="p" variant="caption">
            {t(translations.eligibilityHint)}
          </Typography>
        </div>
      ) : (
        <div className="mt-2">{renderStepTwo()}</div>
      )}
    </Prompt>
  );
};

export default MarketplaceAllowlistRuleForm;
