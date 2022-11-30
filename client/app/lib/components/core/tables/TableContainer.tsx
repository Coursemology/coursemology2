import { ReactNode } from 'react';
import {
  Paper as MuiPaper,
  Table as MuiTable,
  TableContainer as MuiTableContainer,
} from '@mui/material';

import { TableContainerProps } from './types';

const TableContainer = (
  props: TableContainerProps & { children: ReactNode },
): JSX.Element => {
  return (
    <MuiTableContainer
      className={`${props.stickyHeader ? 'overflow-x-clip' : ''} ${
        props.className ?? ''
      }`}
      component={MuiPaper}
      variant={props.variant}
    >
      <MuiTable size={props.dense ? 'small' : 'medium'}>
        {props.children}
      </MuiTable>
    </MuiTableContainer>
  );
};

export default TableContainer;
