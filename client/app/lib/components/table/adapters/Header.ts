import { ReactNode } from 'react';

import FilterProps from './Filter';
import RowSelector from './RowSelector';
import SortProps from './Sort';

interface HeaderRender {
  id: string;
  render: ReactNode | RowSelector;
  className?: string;
  sorting?: SortProps;
  filtering?: FilterProps;
}

interface HeaderProps<H> {
  headers: H[];
  forEach: (header: H, index: number) => HeaderRender;
}

export default HeaderProps;
