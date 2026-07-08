import { useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { MenuItem, TextField } from '@mui/material';

import Link from 'lib/components/core/Link';
import Table, { ColumnTemplate } from 'lib/components/table';

import translations from '../../translations';
import { MarketplaceListing } from '../../types';

type SortMode = 'adoptions' | 'newest';

interface Props {
  listings: MarketplaceListing[];
  onDuplicate: (rows: MarketplaceListing[]) => void;
}

const MarketplaceTable = ({ listings, onDuplicate }: Props): JSX.Element => {
  const { formatMessage: t } = useIntl();
  const [sortMode, setSortMode] = useState<SortMode>('adoptions');

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
      id: 'actions',
      title: t(translations.colActions),
      cell: (l) => (
        <>
          <Link opensInNewTab to={l.previewUrl}>
            {t(translations.preview)}
          </Link>
          {/* Row-level Duplicate button wired in Task 18 */}
        </>
      ),
    },
  ];

  return (
    <>
      <TextField
        label={t(translations.sortLabel)}
        onChange={(e): void => setSortMode(e.target.value as SortMode)}
        select
        size="small"
        value={sortMode}
      >
        <MenuItem value="adoptions">{t(translations.sortMostAdopted)}</MenuItem>
        <MenuItem value="newest">{t(translations.sortNewest)}</MenuItem>
      </TextField>
      <Table
        columns={columns}
        data={sorted}
        getRowId={(l): string => l.id.toString()}
        indexing={{ rowSelectable: true }}
        search={{
          searchPlaceholder: t(translations.searchPlaceholder),
          searchProps: {
            shouldInclude: (l, filter): boolean =>
              !filter || l.title.toLowerCase().includes(filter.toLowerCase()),
          },
        }}
        toolbar={{
          show: true,
          activeToolbar: (rows) => (
            <button onClick={(): void => onDuplicate(rows)} type="button">
              {t(translations.duplicateN, { n: rows.length })}
            </button>
          ),
        }}
      />
    </>
  );
};

export default MarketplaceTable;
