import { Pagination } from '@mui/material';
import { FC } from 'react';
import { injectIntl, WrappedComponentProps } from 'react-intl';

interface Props extends WrappedComponentProps {
  topicCount: number;
  rowsPerPage: number;
  pageNum: number;
  handlePageChange: (page: number) => void;
}

const CommentPagination: FC<Props> = (props) => {
  const { topicCount, rowsPerPage, pageNum, handlePageChange } = props;

  const count = Math.ceil(topicCount / rowsPerPage);

  const handleChange: (
    _e: React.ChangeEvent<unknown>,
    pageNum: number,
  ) => void = (_e, newPageNumber) => {
    // Prevent multiple calls when spam clicking
    if (newPageNumber !== pageNum) {
      handlePageChange(newPageNumber);
    }
  };

  return (
    <>
      {count > 1 && (
        <Pagination
          color="primary"
          variant="outlined"
          style={{ padding: 10, display: 'flex', justifyContent: 'center' }}
          count={count}
          page={pageNum}
          onChange={handleChange}
        />
      )}
    </>
  );
};

export default injectIntl(CommentPagination);
