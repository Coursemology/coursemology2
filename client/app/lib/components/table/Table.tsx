import {
  ForwardedRef,
  forwardRef,
  MutableRefObject,
  useImperativeHandle,
} from 'react';

import { HandlersProps } from './adapters/Handlers';
import { Data, TableTemplate } from './builder';
import MuiTableAdapter from './MuiTableAdapter';
import useTanStackTableBuilder from './TanStackTableBuilder';

const TableComponent = <D extends Data>(
  props: TableTemplate<D>,
  ref: ForwardedRef<HandlersProps>,
): JSX.Element => {
  const tableProps = useTanStackTableBuilder(props);

  useImperativeHandle(ref, () => ({
    getPaginationState: tableProps.handles.getPaginationState,
    getRowSelectionState: tableProps.handles.getRowSelectionState,
  }));

  return <MuiTableAdapter {...tableProps} className={props.className} />;
};

export default Object.assign(
  forwardRef(
    TableComponent,
    // https://stackoverflow.com/questions/58469229/react-with-typescript-generics-while-using-react-forwardref
  ) as <D extends Data>(
    props: TableTemplate<D> & { ref?: MutableRefObject<HandlersProps | null> },
  ) => JSX.Element,
  { displayName: 'Table' },
);
