import { MouseEventHandler } from 'react';

interface SortProps {
  sorted: boolean;
  direction?: 'asc' | 'desc';
  onClickSort?: MouseEventHandler<HTMLElement>;
}

export default SortProps;
