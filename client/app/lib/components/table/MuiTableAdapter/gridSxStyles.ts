import { SxProps, Theme } from '@mui/material';
import { TABLE_BORDER, TABLE_BORDER_STRONG, white } from 'theme/colors';

interface GridSxOpts {
  hasGroupedHeaders: boolean;
  hasPinnedColumns: boolean;
}

export const gridSx = (opts: GridSxOpts): SxProps<Theme> => ({
  borderSpacing: 0,

  '& .MuiTableCell-root': {
    borderBottom: `1px solid ${TABLE_BORDER}`,
    borderLeft: `1px solid ${TABLE_BORDER}`,
    backgroundColor: white,
  },

  '& .MuiTableCell-stickyHeader': { backgroundColor: white },

  ...(opts.hasGroupedHeaders && {
    '& .MuiTableHead-root .MuiTableRow-root:not(:last-child) .MuiTableCell-root':
      {
        borderBottom: 'none',
      },
    '& .MuiTableHead-root .MuiTableRow-root:not(:first-child) .MuiTableCell-root':
      {
        borderTop: `1px solid ${TABLE_BORDER}`,
      },
    '& .MuiTableHead-root .MuiTableRow-root:last-child .MuiTableCell-root': {
      borderBottom: `2px solid ${TABLE_BORDER_STRONG}`,
    },
  }),

  ...(opts.hasGroupedHeaders &&
    opts.hasPinnedColumns && {
      '& .grid-pin-rowspan': {
        borderBottom: `2px solid ${TABLE_BORDER_STRONG} !important`,
      },
    }),

  ...(opts.hasPinnedColumns && {
    '& .MuiTableBody-root .MuiTableRow-root:last-child .MuiTableCell-root': {
      borderBottom: `1px solid ${TABLE_BORDER}`,
      borderLeft: `1px solid ${TABLE_BORDER}`,
    },
  }),
});

export const pinCellSx = (opts: {
  side: 'left' | 'right';
  offsetPx: number;
  widthPx: number;
  isHeader: boolean;
}): SxProps<Theme> => ({
  position: 'sticky',
  [opts.side]: opts.offsetPx,
  width: opts.widthPx,
  minWidth: opts.widthPx,
  maxWidth: opts.widthPx,
  backgroundColor: white,
  zIndex: opts.isHeader ? 40 : 20,
});

export const computePinOffsets = (
  widths: number[],
  side: 'left' | 'right',
): number[] => {
  if (side === 'left') {
    return widths.reduce<{ out: number[]; acc: number }>(
      ({ out, acc }, w) => ({ out: [...out, acc], acc: acc + w }),
      { out: [], acc: 0 },
    ).out;
  }
  return widths.reduceRight<{ out: number[]; acc: number }>(
    ({ out, acc }, w) => ({ out: [acc, ...out], acc: acc + w }),
    { out: [], acc: 0 },
  ).out;
};
