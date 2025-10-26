import BodyProps from './Body';
import { HandlersProps } from './Handlers';
import HeaderProps from './Header';
import PaginationProps from './Pagination';
import ToolbarProps from './Toolbar';

interface TableProps<H, B, C> {
  body: BodyProps<B, C>;
  className?: string;
  pagination?: PaginationProps;
  header?: HeaderProps<H>;
  toolbar?: ToolbarProps;
  handles: HandlersProps;
}

export default TableProps;
