import { FC } from 'react';
import { injectIntl, WrappedComponentProps } from 'react-intl';
import { Pagination } from '@mui/material';

interface Props extends WrappedComponentProps {
  rowCount: number;
  rowsPerPage: number;
  pageNum: number;
  handlePageChange: (arg1: number) => void;
}

const BackendPagination: FC<Props> = (props) => {
  const { rowCount, rowsPerPage, pageNum, handlePageChange } = props;

  const count = Math.ceil(rowCount / rowsPerPage);
  const handleChange: (_, pageNum: number) => void = (_, newPageNumber) => {
    // Prevent multiple calls when spam clicking
    if (newPageNumber !== pageNum) {
      handlePageChange(newPageNumber);
    }
  };
  if (count <= 1) return null;
  return (
    <Pagination
      color="primary"
      count={count}
      onChange={handleChange}
      page={pageNum}
      style={{ padding: 10, display: 'flex', justifyContent: 'center' }}
      variant="outlined"
    />
  );
};

export default injectIntl(BackendPagination);
