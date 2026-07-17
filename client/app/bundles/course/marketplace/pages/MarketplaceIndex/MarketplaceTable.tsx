import { useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import {
  ContentCopy,
  PlayArrow,
  StorefrontOutlined,
  VisibilityOutlined,
} from '@mui/icons-material';
import {
  Button,
  CircularProgress,
  IconButton,
  MenuItem,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';

import Link from 'lib/components/core/Link';
import Table, { ColumnTemplate } from 'lib/components/table';
import { formatLongDate } from 'lib/moment';

import { withFromTab } from '../../fromTab';
import translations from '../../translations';
import { MarketplaceListing } from '../../types';

type SortMode = 'adoptions' | 'newest';

interface Props {
  fromTab?: string | null;
  listings: MarketplaceListing[];
  onDuplicate: (rows: MarketplaceListing[]) => void;
}

const MarketplaceTable = ({
  fromTab = null,
  listings,
  onDuplicate,
}: Props): JSX.Element => {
  const { formatMessage: t } = useIntl();
  const [sortMode, setSortMode] = useState<SortMode>('adoptions');
  const [attemptingListingId, setAttemptingListingId] = useState<number | null>(
    null,
  );

  const sorted = useMemo(() => {
    const copy = [...listings];
    if (sortMode === 'newest') {
      copy.sort((a, b) =>
        (b.firstPublishedAt ?? '').localeCompare(a.firstPublishedAt ?? ''),
      );
    } else {
      copy.sort((a, b) => b.adoptions - a.adoptions);
    }
    return copy;
  }, [listings, sortMode]);

  const columns: ColumnTemplate<MarketplaceListing>[] = [
    {
      of: 'title',
      title: t(translations.colTitle),
      searchable: true,
      cell: (l) => l.title,
    },
    {
      of: 'questionCount',
      title: t(translations.colQuestions),
      cell: (l) => l.questionCount,
    },
    {
      of: 'adoptions',
      title: t(translations.colAdoptions),
      cell: (l) => l.adoptions,
    },
    {
      of: 'firstPublishedAt',
      title: t(translations.colPublished),
      cell: (l) => formatLongDate(l.firstPublishedAt),
    },
    {
      id: 'actions',
      title: t(translations.colActions),
      cell: (l) => (
        <div className="flex items-center">
          <Tooltip disableInteractive title={t(translations.preview)}>
            <IconButton
              aria-label={t(translations.preview)}
              component={Link}
              size="small"
              to={withFromTab(l.previewUrl, fromTab)}
            >
              <VisibilityOutlined />
            </IconButton>
          </Tooltip>
          <Tooltip disableInteractive title={t(translations.attempt)}>
            <IconButton
              aria-label={t(translations.attempt)}
              component={Link}
              onClick={(): void => setAttemptingListingId(l.id)}
              size="small"
              to={withFromTab(`${l.previewUrl}/attempt`, fromTab)}
            >
              {attemptingListingId === l.id ? (
                <CircularProgress size={24} />
              ) : (
                <PlayArrow />
              )}
            </IconButton>
          </Tooltip>
          <Tooltip disableInteractive title={t(translations.duplicateConfirm)}>
            <IconButton
              aria-label={t(translations.duplicateConfirm)}
              onClick={(): void => onDuplicate([l])}
              size="small"
            >
              <ContentCopy />
            </IconButton>
          </Tooltip>
        </div>
      ),
    },
  ];

  // Rendered in BOTH toolbar states (idle `buttons` and active `activeToolbar`),
  // because `buttons` are hidden once a row is selected. Value is controlled by
  // parent state, so remounting across states preserves the chosen sort.
  const sortControl = (
    <TextField
      key="marketplace-sort"
      className="shrink-0"
      label={t(translations.sortLabel)}
      onChange={(e): void => setSortMode(e.target.value as SortMode)}
      select
      size="small"
      value={sortMode}
    >
      <MenuItem value="adoptions">{t(translations.sortMostAdopted)}</MenuItem>
      <MenuItem value="newest">{t(translations.sortNewest)}</MenuItem>
    </TextField>
  );

  // Idle state: disabled, same position/style as the active button (must not move).
  const idleDuplicateButton = (
    <Button
      key="marketplace-duplicate-idle"
      color="primary"
      disabled
      variant="contained"
    >
      {t(translations.selectToDuplicate)}
    </Button>
  );

  const emptyState = (
    <div className="flex flex-col items-center gap-2 p-10 text-center">
      <StorefrontOutlined className="text-neutral-400" fontSize="large" />
      <Typography color="text.secondary" variant="body2">
        {t(
          listings.length === 0
            ? translations.emptyNoListings
            : translations.emptyNoMatch,
        )}
      </Typography>
    </div>
  );

  return (
    <Table
      columns={columns}
      data={sorted}
      getRowId={(l): string => l.id.toString()}
      indexing={{ rowSelectable: true, hideSelectAll: true }}
      pagination={{ initialPageSize: 20, rowsPerPage: [10, 20, 50] }}
      renderEmpty={emptyState}
      search={{
        searchPlaceholder: t(translations.searchPlaceholder),
        searchProps: {
          shouldInclude: (l, filter): boolean =>
            !filter || l.title.toLowerCase().includes(filter.toLowerCase()),
        },
      }}
      toolbar={{
        show: true,
        keepNative: true,
        buttons: [sortControl, idleDuplicateButton],
        activeToolbar: (rows) => (
          <div className="flex shrink-0 items-center gap-4">
            {sortControl}
            <Button
              color="primary"
              onClick={(): void => onDuplicate(rows)}
              variant="contained"
            >
              {t(translations.duplicateN, { n: rows.length })}
            </Button>
          </div>
        ),
      }}
    />
  );
};

export default MarketplaceTable;
