import { FC } from 'react';
import { Pagination as MUIPagination } from '@mui/material';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  handlePageChange: (page: number) => void;
}

const Pagination: FC<PaginationProps> = (props) => {
  const { currentPage, totalPages, handlePageChange } = props;

  return (
    <MUIPagination
      className="my-4 flex justify-center"
      color="primary"
      count={totalPages}
      onChange={(_, pageNumber): void => handlePageChange(pageNumber)}
      page={currentPage}
      variant="outlined"
    />
  );
};

export default Pagination;
