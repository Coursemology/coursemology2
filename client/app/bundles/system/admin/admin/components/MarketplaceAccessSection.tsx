import { useEffect, useState } from 'react';
import { defineMessages } from 'react-intl';
import { Button, Chip, Typography } from '@mui/material';
import {
  AllowedByRule,
  MarketplaceAccessUser,
} from 'types/system/marketplaceAccess';
import { AllowlistRuleData } from 'types/system/marketplaceAllowlist';

import SystemAPI from 'api/system';
import Link from 'lib/components/core/Link';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import Table, { ColumnTemplate } from 'lib/components/table';
import { DEFAULT_TABLE_ROWS_PER_PAGE } from 'lib/constants/sharedConstants';
import toast from 'lib/hooks/toast';
import useTranslation from 'lib/hooks/useTranslation';

import MarketplaceAccessFilter, { RuleOption } from './MarketplaceAccessFilter';

/**
 * Filter id for the synthetic "System admin" option. Negative so it can never collide with a real
 * allow-list rule id, which is what the other options carry.
 */
const SYSTEM_ADMIN_OPTION_ID = -1;

interface Props {
  /** Owned by the page, not this section: the toggle and this list must never disagree. */
  openToEveryone: boolean;
  /** Bumped by the page on every rule mutation; a change refetches the list. */
  ruleVersion: number;
  /** The page's current scoped rules, used to label the filter's rule checkboxes. */
  rules: AllowlistRuleData[];
  /**
   * Published after each fetch: rule id => number of listed users that rule grants access to. The
   * rules table above the section consumes it to flag rules that match nobody. A rule granting zero
   * people contributes no key, so a zero-match rule is simply absent from the map.
   */
  onMatchCounts?: (counts: Map<number, number>) => void;
}

const translations = defineMessages({
  heading: {
    id: 'system.admin.admin.MarketplaceAccessSection.heading',
    defaultMessage: 'People with access',
  },
  summary: {
    id: 'system.admin.admin.MarketplaceAccessSection.summary',
    defaultMessage: 'Total with access: {count} · {mode}',
  },
  summaryWithBlocked: {
    id: 'system.admin.admin.MarketplaceAccessSection.summaryWithBlocked',
    defaultMessage:
      'Total with access: {count} · Total blocked: {blocked} · {mode}',
  },
  filteredCounts: {
    id: 'system.admin.admin.MarketplaceAccessSection.filteredCounts',
    defaultMessage: 'Filtered: {count} with access · {blocked} blocked',
  },
  modeOpen: {
    id: 'system.admin.admin.MarketplaceAccessSection.modeOpen',
    defaultMessage: 'Open to everyone',
  },
  modeScoped: {
    id: 'system.admin.admin.MarketplaceAccessSection.modeScoped',
    defaultMessage: 'Scoped to the rules above',
  },
  fetchFailure: {
    id: 'system.admin.admin.MarketplaceAccessSection.fetchFailure',
    defaultMessage: 'Failed to load the marketplace access list.',
  },
  colName: {
    id: 'system.admin.admin.MarketplaceAccessSection.colName',
    defaultMessage: 'Name',
  },
  colEmail: {
    id: 'system.admin.admin.MarketplaceAccessSection.colEmail',
    defaultMessage: 'Email',
  },
  colEligibleVia: {
    id: 'system.admin.admin.MarketplaceAccessSection.colEligibleVia',
    defaultMessage: 'Eligible via',
  },
  colAllowedBy: {
    id: 'system.admin.admin.MarketplaceAccessSection.colAllowedBy',
    defaultMessage: 'Allowed by',
  },
  colStatus: {
    id: 'system.admin.admin.MarketplaceAccessSection.colStatus',
    defaultMessage: 'Status',
  },
  colActions: {
    id: 'system.admin.admin.MarketplaceAccessSection.colActions',
    defaultMessage: 'Actions',
  },
  managesCourses: {
    id: 'system.admin.admin.MarketplaceAccessSection.managesCourses',
    defaultMessage: 'Manages {count, plural, one {# course} other {# courses}}',
  },
  instanceInstructor: {
    id: 'system.admin.admin.MarketplaceAccessSection.instanceInstructor',
    defaultMessage: 'Instance instructor',
  },
  instanceAdministrator: {
    id: 'system.admin.admin.MarketplaceAccessSection.instanceAdministrator',
    defaultMessage: 'Instance administrator',
  },
  allowedEveryone: {
    id: 'system.admin.admin.MarketplaceAccessSection.allowedEveryone',
    defaultMessage: 'Everyone',
  },
  allowedNothing: {
    id: 'system.admin.admin.MarketplaceAccessSection.allowedNothing',
    defaultMessage: 'No matching rule',
  },
  systemAdmin: {
    id: 'system.admin.admin.MarketplaceAccessSection.systemAdmin',
    defaultMessage: 'System admin',
  },
  typeUser: {
    id: 'system.admin.admin.MarketplaceAccessSection.typeUser',
    defaultMessage: 'User',
  },
  typeInstance: {
    id: 'system.admin.admin.MarketplaceAccessSection.typeInstance',
    defaultMessage: 'Instance',
  },
  typeEmailDomain: {
    id: 'system.admin.admin.MarketplaceAccessSection.typeEmailDomain',
    defaultMessage: 'Email domain',
  },
  statusActive: {
    id: 'system.admin.admin.MarketplaceAccessSection.statusActive',
    defaultMessage: 'Active',
  },
  statusBlocked: {
    id: 'system.admin.admin.MarketplaceAccessSection.statusBlocked',
    defaultMessage: 'Blocked',
  },
  disable: {
    id: 'system.admin.admin.MarketplaceAccessSection.disable',
    defaultMessage: 'Block',
  },
  reEnable: {
    id: 'system.admin.admin.MarketplaceAccessSection.reEnable',
    defaultMessage: 'Unblock',
  },
  disableSuccess: {
    id: 'system.admin.admin.MarketplaceAccessSection.disableSuccess',
    defaultMessage: 'Access blocked for this user.',
  },
  disableFailure: {
    id: 'system.admin.admin.MarketplaceAccessSection.disableFailure',
    defaultMessage: 'Failed to block access.',
  },
  reEnableSuccess: {
    id: 'system.admin.admin.MarketplaceAccessSection.reEnableSuccess',
    defaultMessage: 'Access unblocked for this user.',
  },
  reEnableFailure: {
    id: 'system.admin.admin.MarketplaceAccessSection.reEnableFailure',
    defaultMessage: 'Failed to unblock access.',
  },
  searchPlaceholder: {
    id: 'system.admin.admin.MarketplaceAccessSection.searchPlaceholder',
    defaultMessage: 'Search by name or email',
  },
  dormantHeading: {
    id: 'system.admin.admin.MarketplaceAccessSection.dormantHeading',
    defaultMessage: 'Dormant blocks ({count})',
  },
  dormantExplanation: {
    id: 'system.admin.admin.MarketplaceAccessSection.dormantExplanation',
    defaultMessage:
      'These people are blocked but no rule currently grants them access. The block denies ' +
      'nothing today — but it would take effect again if a rule starts matching them, so clear ' +
      'it if it is no longer wanted.',
  },
  clearBlock: {
    id: 'system.admin.admin.MarketplaceAccessSection.clearBlock',
    defaultMessage: 'Clear block',
  },
});

const MarketplaceAccessSection = ({
  openToEveryone,
  ruleVersion,
  rules,
  onMatchCounts,
}: Props): JSX.Element => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [users, setUsers] = useState<MarketplaceAccessUser[]>([]);
  const [showActive, setShowActive] = useState(true);
  const [showBlocked, setShowBlocked] = useState(true);
  const [uncheckedRuleIds, setUncheckedRuleIds] = useState<Set<number>>(
    new Set(),
  );

  useEffect(() => {
    let cancelled = false;
    setIsRefreshing(true);

    SystemAPI.admin
      .indexMarketplaceAccess()
      .then((response) => {
        if (cancelled) return;
        setUsers(response.data.users);
        // Publish per-rule grant counts for the rules table above. Built from rows, so a rule that
        // grants access to nobody contributes no key at all — its absence is the zero-match signal.
        const counts = new Map<number, number>();
        response.data.users.forEach((user) => {
          user.allowedByRules.forEach((rule) => {
            counts.set(rule.id, (counts.get(rule.id) ?? 0) + 1);
          });
        });
        onMatchCounts?.(counts);
      })
      .catch(() => toast.error(t(translations.fetchFailure)))
      .finally(() => {
        if (cancelled) return;
        setIsLoading(false);
        setIsRefreshing(false);
      });

    return () => {
      cancelled = true;
    };
  }, [ruleVersion]);

  const handleDisable = async (user: MarketplaceAccessUser): Promise<void> => {
    try {
      const response = await SystemAPI.admin.blockMarketplaceUser(user.id);
      setUsers((current) =>
        current.map((u) =>
          u.id === user.id
            ? { ...u, blocked: true, blockId: response.data.id }
            : u,
        ),
      );
      toast.success(t(translations.disableSuccess));
    } catch {
      toast.error(t(translations.disableFailure));
    }
  };

  /**
   * Whether anything currently grants this person access, ignoring any block. Mirrors the server's
   * own notion of "allowed": the role, the everyone-mode, or at least one matching rule. Note that
   * everyone-mode deliberately sends no per-row rules, so an empty `allowedByRules` is NOT on its
   * own a signal that someone has no access.
   */
  const isAllowed = (user: MarketplaceAccessUser): boolean =>
    user.systemAdmin || openToEveryone || user.allowedByRules.length > 0;

  /** Blocked, but nothing would grant them access anyway — the block denies nothing today. */
  const isDormantBlock = (user: MarketplaceAccessUser): boolean =>
    user.blocked && !isAllowed(user);

  const handleReEnable = async (user: MarketplaceAccessUser): Promise<void> => {
    if (user.blockId === null) return;
    try {
      await SystemAPI.admin.unblockMarketplaceUser(user.blockId);
      setUsers((current) =>
        // Someone listed ONLY because they were blocked has no reason to stay once the block goes —
        // patching the row in place would leave them as "Active · No matching rule", counted as
        // having access they do not have. Mirrors the server: listed iff allowed OR blocked.
        current.flatMap((u) => {
          if (u.id !== user.id) return [u];
          return isAllowed(u) ? [{ ...u, blocked: false, blockId: null }] : [];
        }),
      );
      toast.success(t(translations.reEnableSuccess));
    } catch {
      toast.error(t(translations.reEnableFailure));
    }
  };

  const eligibleVia = (user: MarketplaceAccessUser): string => {
    // A system admin's eligibility comes from the role, not from courses or instance membership —
    // and they are listed even when they have neither, where the other branches say nothing.
    if (user.systemAdmin) return t(translations.systemAdmin);

    const parts: string[] = [];
    if (user.courseCount > 0) {
      parts.push(t(translations.managesCourses, { count: user.courseCount }));
    }
    if (user.instanceRole === 'instructor') {
      parts.push(t(translations.instanceInstructor));
    }
    if (user.instanceRole === 'administrator') {
      parts.push(t(translations.instanceAdministrator));
    }
    return parts.length > 0 ? parts.join('; ') : '—';
  };

  const typeLabels: Record<AllowedByRule['ruleType'], string> = {
    user: t(translations.typeUser),
    instance: t(translations.typeInstance),
    email_domain: t(translations.typeEmailDomain),
  };

  const ruleLabel = (rule: AllowedByRule): string =>
    `${typeLabels[rule.ruleType]} (${rule.labelValue ?? `#${rule.id}`})`;

  // Every reason, not one winner: the admin reads this column to decide which rules are safe to
  // delete, and a single reason answers that question wrongly.
  const renderAllowedBy = (user: MarketplaceAccessUser): JSX.Element => {
    // Ahead of both other branches: the role is why they have access, and it outlives any rule
    // change — saying "Everyone" or naming a rule would misattribute it.
    if (user.systemAdmin) return <span>{t(translations.systemAdmin)}</span>;
    if (openToEveryone) return <span>{t(translations.allowedEveryone)}</span>;
    if (user.allowedByRules.length === 0) {
      return <span>{t(translations.allowedNothing)}</span>;
    }

    return (
      <div className="flex flex-col">
        {user.allowedByRules.map((rule) => (
          <span key={rule.id}>{ruleLabel(rule)}</span>
        ))}
      </div>
    );
  };

  const ruleOptionLabel = (rule: AllowlistRuleData): string => {
    switch (rule.ruleType) {
      case 'user':
        return `${typeLabels.user} (${rule.userName ?? `#${rule.userId}`})`;
      case 'instance':
        return `${typeLabels.instance} (${
          rule.instanceName ?? `#${rule.instanceId}`
        })`;
      default:
        return `${typeLabels.email_domain} (${rule.emailDomain ?? ''})`;
    }
  };

  // Open to everyone means every row is granted by the mode, not by a rule, so the group is hidden.
  // System admin is a reason in its own right, so it gets an option whenever any listed user is
  // one — including in everyone-mode, where their access still comes from the role, not the mode.
  const ruleOptions: RuleOption[] = [
    ...(users.some((user) => user.systemAdmin)
      ? [{ id: SYSTEM_ADMIN_OPTION_ID, label: t(translations.systemAdmin) }]
      : []),
    ...(openToEveryone
      ? []
      : rules.map((rule) => ({ id: rule.id, label: ruleOptionLabel(rule) }))),
  ];

  const toggleRule = (id: number): void =>
    setUncheckedRuleIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const clearFilters = (): void => {
    setShowActive(true);
    setShowBlocked(true);
    setUncheckedRuleIds(new Set());
  };

  const matchesFilter = (user: MarketplaceAccessUser): boolean => {
    if (user.blocked ? !showBlocked : !showActive) return false;
    if (uncheckedRuleIds.size === 0) return true;

    // Being a system admin is a reason alongside the rules, so an admin survives the filter while
    // that option stays checked — without this they carry no reasons at all and would vanish the
    // moment any rule box is unchecked.
    const reasonIds = user.allowedByRules.map((rule) => rule.id);
    if (user.systemAdmin) reasonIds.push(SYSTEM_ADMIN_OPTION_ID);
    // Everyone-mode grants access outside the rules, so only the admin option can filter there.
    if (openToEveryone && !user.systemAdmin) return true;

    return reasonIds.some((id) => !uncheckedRuleIds.has(id));
  };

  const columns: ColumnTemplate<MarketplaceAccessUser>[] = [
    {
      of: 'name',
      title: t(translations.colName),
      searchable: true,
      cell: (user) => (
        <Link to={`/users/${user.id}`} underline="hover">
          {user.name}
        </Link>
      ),
    },
    {
      of: 'email',
      title: t(translations.colEmail),
      searchable: true,
      cell: (user) => user.email,
    },
    {
      id: 'eligibleVia',
      title: t(translations.colEligibleVia),
      cell: (user) => eligibleVia(user),
    },
    {
      id: 'allowedBy',
      title: t(translations.colAllowedBy),
      cell: (user) => renderAllowedBy(user),
    },
    {
      id: 'status',
      title: t(translations.colStatus),
      // This column's content changes with row STATE (Active↔Blocked), so its intrinsic width
      // changes as people are blocked, shifting every column to its left. A width on the cell
      // itself does NOT fix that: under table-layout:auto a cell width is only a suggestion, and
      // the browser still distributes slack using each column's max-content width. Pinning the
      // width on a wrapper INSIDE the cell makes that max-content constant, which is what actually
      // holds the layout still. `whitespace-nowrap` keeps an overlong translation overflowing
      // visibly rather than wrapping and silently reintroducing the shift.
      className: 'whitespace-nowrap',
      cell: (user) => (
        <div className="w-28">
          <Chip
            color={user.blocked ? 'default' : 'success'}
            label={
              user.blocked
                ? t(translations.statusBlocked)
                : t(translations.statusActive)
            }
            size="small"
            variant={user.blocked ? 'outlined' : 'filled'}
          />
        </div>
      ),
    },
    {
      id: 'action',
      title: t(translations.colActions),
      // Same reasoning as `status` above: Block↔Unblock. Sized to `Unblock`, the wider of the
      // two, so flipping a row never moves its neighbours.
      className: 'whitespace-nowrap',
      cell: (user) =>
        // No action for a system admin: `can :manage, :all` outranks the allow-list, so a block
        // would not actually revoke anything — the row would read "Blocked" while they kept full
        // access. Better to offer nothing than an action that silently does nothing.
        user.systemAdmin ? null : (
          <div className="w-24">
            {/*
            `min-w-0 px-0` on both: MUI gives a Button horizontal padding and a 64px min-width, so
            the label sits inset from the cell edge (misaligned with the `Actions` header) by an
            amount that DIFFERS per label — `Block` is narrower than the min-width and gets
            centred in the leftover space, `Unblock` is not. Stripping both makes the button hug
            its text, so header and both states start at the same x.
          */}
            {user.blocked ? (
              <Button
                className="min-w-0 px-0"
                color="primary"
                onClick={(): Promise<void> => handleReEnable(user)}
                size="small"
              >
                {t(translations.reEnable)}
              </Button>
            ) : (
              <Button
                className="min-w-0 px-0"
                color="error"
                onClick={(): Promise<void> => handleDisable(user)}
                size="small"
              >
                {t(translations.disable)}
              </Button>
            )}
          </div>
        ),
    },
  ];

  // No status or reason columns: every row here is dormant-blocked and allowed by nothing, so
  // those cells would repeat the section heading on every line.
  const dormantColumns: ColumnTemplate<MarketplaceAccessUser>[] = [
    {
      of: 'name',
      title: t(translations.colName),
      cell: (user) => (
        <Link to={`/users/${user.id}`} underline="hover">
          {user.name}
        </Link>
      ),
    },
    {
      of: 'email',
      title: t(translations.colEmail),
      cell: (user) => user.email,
    },
    {
      id: 'action',
      title: t(translations.colActions),
      className: 'whitespace-nowrap',
      cell: (user) => (
        <div className="w-28">
          <Button
            className="min-w-0 px-0"
            color="primary"
            onClick={(): Promise<void> => handleReEnable(user)}
            size="small"
          >
            {t(translations.clearBlock)}
          </Button>
        </div>
      ),
    },
  ];

  if (isLoading) return <LoadingIndicator />;

  // Derived from the rows, not the server summary: block/unblock patch rows locally without a
  // refetch, so a summary-bound count would drift the moment an admin disables someone.
  // Split first: a dormant block is not a person with access, so it is counted out of the headline
  // totals and out of the main table, and gets its own section below.
  const dormantUsers = users.filter(isDormantBlock);
  const accessUsers = users.filter((user) => !isDormantBlock(user));
  const totalWithAccess = accessUsers.filter((user) => !user.blocked).length;
  const totalBlocked = accessUsers.filter((user) => user.blocked).length;
  const filteredUsers = accessUsers.filter(matchesFilter);
  // Only the filter menu is observable here — the search box lives inside Table and narrows the
  // rows after this point, so a search alone does not surface the line.
  const isFiltered = filteredUsers.length < accessUsers.length;
  const mode = openToEveryone
    ? t(translations.modeOpen)
    : t(translations.modeScoped);

  // Remount the main table when the filter state changes so pagination snaps back to the first
  // page: an admin on page 2 who narrows the filter below one page of results would otherwise be
  // stranded on an empty page. The shared Table keeps pagination internal with no external setter
  // and does not auto-reset the page index on a data change, so a key change is the only in-section
  // lever. Keyed on the filter state alone (not the fetched data), so a background refetch does not
  // disturb the current page. The dormant table below is unfiltered and needs none of this.
  const filterKey = `${showActive}:${showBlocked}:${[...uncheckedRuleIds]
    .sort((a, b) => a - b)
    .join(',')}`;

  return (
    <div className="mt-8">
      <Typography variant="h6">{t(translations.heading)}</Typography>

      <Typography color="text.secondary" variant="body2">
        {totalBlocked > 0
          ? t(translations.summaryWithBlocked, {
              count: totalWithAccess,
              blocked: totalBlocked,
              mode,
            })
          : t(translations.summary, { count: totalWithAccess, mode })}
      </Typography>

      {/*
        Only while the filter is narrowing: unfiltered, this line would repeat the totals verbatim.
        The totals above stay put as the audit anchor — this answers the narrower question the
        filter poses ("of the people this rule lets in, how many are blocked?"), which nothing else
        on the page reports.
      */}
      {isFiltered && (
        <Typography color="text.secondary" variant="body2">
          {t(translations.filteredCounts, {
            count: filteredUsers.filter((user) => !user.blocked).length,
            blocked: filteredUsers.filter((user) => user.blocked).length,
          })}
        </Typography>
      )}

      <div className={`mt-3 ${isRefreshing ? 'opacity-50' : ''}`}>
        <Table
          key={filterKey}
          columns={columns}
          data={filteredUsers}
          getRowId={(user): string => user.id.toString()}
          pagination={{
            initialPageSize: 20,
            rowsPerPage: [10, 20, 50, DEFAULT_TABLE_ROWS_PER_PAGE],
            showAllRows: true,
          }}
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
          toolbar={{
            show: true,
            buttons: [
              <MarketplaceAccessFilter
                key="marketplace-access-filter"
                onClear={clearFilters}
                onToggleActive={(): void => setShowActive((on) => !on)}
                onToggleBlocked={(): void => setShowBlocked((on) => !on)}
                onToggleRule={toggleRule}
                ruleOptions={ruleOptions}
                showActive={showActive}
                showBlocked={showBlocked}
                uncheckedRuleIds={uncheckedRuleIds}
              />,
            ],
          }}
        />
      </div>

      {dormantUsers.length > 0 && (
        <div className="mt-8">
          <Typography variant="h6">
            {t(translations.dormantHeading, { count: dormantUsers.length })}
          </Typography>

          <Typography className="mb-3" color="text.secondary" variant="body2">
            {t(translations.dormantExplanation)}
          </Typography>

          <div className={isRefreshing ? 'opacity-50' : undefined}>
            <Table
              columns={dormantColumns}
              data={dormantUsers}
              getRowId={(user): string => user.id.toString()}
              pagination={{
                initialPageSize: 10,
                rowsPerPage: [10, 20, 50, DEFAULT_TABLE_ROWS_PER_PAGE],
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketplaceAccessSection;
