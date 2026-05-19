import { SxProps, Theme } from '@mui/material';
import { TABLE_BORDER, TABLE_BORDER_STRONG, white } from 'theme/colors';

interface GridSxOpts {
  hasGroupedHeaders: boolean;
  hasPinnedColumns: boolean;
}

export const gridSx = (opts: GridSxOpts): SxProps<Theme> => ({
  // borderSpacing: 0 collapses default cell gaps so borders are flush.
  // borderCollapse: collapse is intentionally avoided — it merges adjacent
  // borders into one, which breaks sticky columns (they need independent
  // borders to stay visible as they overlap scrolled content).
  borderSpacing: 0,

  '& .MuiTableCell-root': {
    borderBottom: `1px solid ${TABLE_BORDER}`,
    // borderLeft not borderRight: in sticky contexts borderRight on cell N
    // is painted over by cell N+1's white background. borderLeft is owned
    // by the cell's own stacking layer and always visible.
    borderLeft: `1px solid ${TABLE_BORDER}`,
    // Solid background is required for sticky cells to cover scrolled
    // content beneath them.
    backgroundColor: white,
  },

  // MUI sets background-color: inherit on sticky header cells in some theme
  // configurations, making them transparent so scrolled body content shows
  // through. Explicitly override to white.
  '& .MuiTableCell-stickyHeader': { backgroundColor: white },

  ...(opts.hasGroupedHeaders && {
    // Multi-row sticky headers are composited row-by-row. Put separators on
    // the lower row's borderTop, not the upper row's borderBottom, so the
    // separator stays visible when sticky.
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
      // Row-spanning pinned headers live in the first row but visually reach
      // the bottom of the header, so restore the header/body separator.
      '& .MuiTableHead-root .MuiTableRow-root .MuiTableCell-root.grid-pin-rowspan':
        {
          borderBottom: `2px solid ${TABLE_BORDER_STRONG}`,
        },
    }),

  ...(opts.hasPinnedColumns && {
    // Reassert the final border when sticky columns cause MUI to drop it.
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
  const out = new Array<number>(widths.length);

  if (side === 'left') {
    let acc = 0;
    for (let i = 0; i < widths.length; i += 1) {
      out[i] = acc;
      acc += widths[i];
    }
    return out;
  }

  let acc = 0;
  for (let i = widths.length - 1; i >= 0; i -= 1) {
    out[i] = acc;
    acc += widths[i];
  }
  return out;
};
