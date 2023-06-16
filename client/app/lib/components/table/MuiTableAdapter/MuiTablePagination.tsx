import { useMemo } from 'react';
import { TablePagination, TablePaginationProps } from '@mui/material';

import useTranslation from 'lib/hooks/useTranslation';

import { PaginationProps } from '../adapters';

import translations from './translations';

const MuiTablePagination = (props: PaginationProps): JSX.Element => {
  const { t } = useTranslation();

  const rowsPerPageOptions = useMemo(() => {
    const options: TablePaginationProps['rowsPerPageOptions'] =
      props.pages ?? [];

    if (props.allowShowAll)
      options.push({
        value: props.total,
        label: props.showAllLabel ?? t(translations.all),
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
