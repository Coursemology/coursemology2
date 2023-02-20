import { Data, TableTemplate } from './builder';
import MuiTableAdapter from './MuiTableAdapter';
import useTanStackTableBuilder from './TanStackTableBuilder';

const Table = <D extends Data>(props: TableTemplate<D>): JSX.Element => {
  const tableProps = useTanStackTableBuilder(props);

  return <MuiTableAdapter {...tableProps} className={props.className} />;
};

export default Table;
