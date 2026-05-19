import { ReactNode } from 'react';

import { HeaderRow } from '../builder/buildHeaderRows';

import FilterProps from './Filter';
import RowSelector from './RowSelector';
import SortProps from './Sort';

export interface HeaderRender {
  id: string;
  render: ReactNode | RowSelector;
  className?: string;
  sorting?: SortProps;
  filtering?: FilterProps;
}

interface HeaderProps<H> {
  headers: H[];
  forEach: (header: H, index: number) => HeaderRender;
  rows: HeaderRow<HeaderRender>[];
}

export default HeaderProps;
