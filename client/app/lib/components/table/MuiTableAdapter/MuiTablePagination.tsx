import { useMemo } from 'react';
import { TablePagination, TablePaginationProps } from '@mui/material';

import { PaginationProps } from '../adapters';

const MuiTablePagination = (props: PaginationProps): JSX.Element => {
  const rowsPerPageOptions = useMemo(() => {
    const options: TablePaginationProps['rowsPerPageOptions'] =
      props.pages ?? [];

    if (props.allowShowAll)
      options.push({
        value: props.total,
        label: props.showAllLabel ?? 'All',
      });

    return options.length ? options : undefined;
  }, []);

  return (
    <TablePagination
      component="div"
      count={props.total}
      onPageChange={(_, newPage): void => props.onPageChange?.(newPage)}
      onRowsPerPageChange={(e): void => {
        const pageSize = parseInt(e.target.value, 10);
        props.onPageSizeChange?.(pageSize);
      }}
      page={props.page}
      rowsPerPage={props.pageSize}
      rowsPerPageOptions={rowsPerPageOptions}
      showFirstButton
      showLastButton
    />
  );
};

export default MuiTablePagination;
