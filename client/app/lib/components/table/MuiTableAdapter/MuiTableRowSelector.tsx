import { Checkbox } from '@mui/material';

import { RowSelector } from '../adapters';

const MuiTableRowSelector = (props: RowSelector): JSX.Element => (
  <Checkbox
    checked={props.selected}
    className="p-0"
    disabled={props.disabled}
    indeterminate={props.indeterminate}
    onChange={props.onChange}
  />
);

export default MuiTableRowSelector;
