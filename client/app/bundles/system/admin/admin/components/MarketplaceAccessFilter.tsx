import { useState } from 'react';
import { defineMessages } from 'react-intl';
import { FilterList } from '@mui/icons-material';
import {
  Badge,
  Button,
  Checkbox,
  Divider,
  FormControlLabel,
  IconButton,
  Menu,
  Tooltip,
  Typography,
} from '@mui/material';

import useTranslation from 'lib/hooks/useTranslation';

export interface RuleOption {
  id: number;
  label: string;
}

interface Props {
  showActive: boolean;
  showBlocked: boolean;
  onToggleActive: () => void;
  onToggleBlocked: () => void;
  /** Empty when the marketplace is open to everyone — the rule group is then meaningless. */
  ruleOptions: RuleOption[];
  /**
   * Ids the admin has UNchecked. Tracking exclusions rather than inclusions means a newly added
   * rule is filtered in by default, with no state to resynchronise when `ruleOptions` changes.
   */
  uncheckedRuleIds: Set<number>;
  onToggleRule: (id: number) => void;
  onClear: () => void;
}

const translations = defineMessages({
  trigger: {
    id: 'system.admin.admin.MarketplaceAccessFilter.trigger',
    defaultMessage: 'Filter',
  },
  status: {
    id: 'system.admin.admin.MarketplaceAccessFilter.status',
    defaultMessage: 'Status',
  },
  active: {
    id: 'system.admin.admin.MarketplaceAccessFilter.active',
    defaultMessage: 'Active',
  },
  blocked: {
    id: 'system.admin.admin.MarketplaceAccessFilter.blocked',
    defaultMessage: 'Blocked',
  },
  allowedByRule: {
    id: 'system.admin.admin.MarketplaceAccessFilter.allowedByRule',
    defaultMessage: 'Allowed by rule',
  },
  clearAll: {
    id: 'system.admin.admin.MarketplaceAccessFilter.clearAll',
    defaultMessage: 'Clear all',
  },
});

/**
 * A bespoke filter popover rather than the shared table's built-in per-column filtering
 * (`filterable` + `filterProps`). The built-in machinery could in fact handle both the array-valued
 * rules column (via `filterProps.getValue`/`shouldInclude`) and the synthetic System-admin option
 * (`getValue` is arbitrary) — those two objections are false. The real reason is that built-in
 * filtering is table-internal in the three respects this feature needs externalised:
 *
 *   1. The filtered result never leaves the table. `TableTemplate` exposes no callback for it, and
 *      the count feeds pagination internally — yet the section renders a
 *      "Filtered: N with access · M blocked" line that needs the filtered set outside the table.
 *      (Decisive.)
 *   2. Render location. `MuiFilterMenu` renders inside a column header; the design is one filter
 *      icon in the toolbar spanning Status AND rules, with a single badge and one "Clear all" —
 *      built-in yields two header icons, two badges, two independent clears.
 *   3. Checked-by-default is unreachable. In the built-in filter the selection array IS the filter,
 *      so a both-on Status default would need the selection inverted, putting checkmarks on exactly
 *      the wrong items. This component instead tracks EXCLUSIONS, so a newly added rule filters in
 *      by default with no state to resynchronise.
 */
const MarketplaceAccessFilter = ({
  showActive,
  showBlocked,
  onToggleActive,
  onToggleBlocked,
  ruleOptions,
  uncheckedRuleIds,
  onToggleRule,
  onClear,
}: Props): JSX.Element => {
  const { t } = useTranslation();
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);

  const activeCount =
    (showActive ? 0 : 1) + (showBlocked ? 0 : 1) + uncheckedRuleIds.size;

  const label = t(translations.trigger);

  return (
    <>
      <Tooltip title={label}>
        <Badge badgeContent={activeCount} className="shrink-0" color="primary">
          <IconButton
            aria-label={label}
            color="primary"
            onClick={(event): void => setAnchor(event.currentTarget)}
          >
            <FilterList />
          </IconButton>
        </Badge>
      </Tooltip>

      <Menu
        anchorEl={anchor}
        onClose={(): void => setAnchor(null)}
        open={Boolean(anchor)}
      >
        <div className="flex min-w-[16rem] flex-col px-4 py-2">
          <Typography color="text.secondary" variant="caption">
            {t(translations.status)}
          </Typography>

          <FormControlLabel
            control={
              <Checkbox checked={showActive} onChange={onToggleActive} />
            }
            label={t(translations.active)}
          />

          <FormControlLabel
            control={
              <Checkbox checked={showBlocked} onChange={onToggleBlocked} />
            }
            label={t(translations.blocked)}
          />

          {ruleOptions.length > 0 && (
            <>
              <Divider className="my-2" />

              <Typography color="text.secondary" variant="caption">
                {t(translations.allowedByRule)}
              </Typography>

              {ruleOptions.map((option) => (
                <FormControlLabel
                  key={option.id}
                  control={
                    <Checkbox
                      checked={!uncheckedRuleIds.has(option.id)}
                      onChange={(): void => onToggleRule(option.id)}
                    />
                  }
                  label={option.label}
                />
              ))}
            </>
          )}

          <Button className="mt-2 self-end" onClick={onClear} size="small">
            {t(translations.clearAll)}
          </Button>
        </div>
      </Menu>
    </>
  );
};

export default MarketplaceAccessFilter;
