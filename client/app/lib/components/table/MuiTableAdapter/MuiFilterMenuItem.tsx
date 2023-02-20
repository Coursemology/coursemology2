import { CheckBox, CheckBoxOutlineBlank } from '@mui/icons-material';
import { MenuItem, Typography } from '@mui/material';

interface FilterMenuItemProps {
  selected: boolean;
  label: string;
  onSelect: () => void;
  onDeselect: () => void;
}

const MuiFilterMenuItem = (props: FilterMenuItemProps): JSX.Element => {
  const { selected, onSelect: select, onDeselect: deselect } = props;

  return (
    <MenuItem
      className="space-x-2"
      onClick={selected ? deselect : select}
      selected={selected}
    >
      {selected ? (
        <CheckBox color="primary" />
      ) : (
        <CheckBoxOutlineBlank color="inherit" />
      )}

      <Typography variant="body2">{props.label}</Typography>
    </MenuItem>
  );
};

export default MuiFilterMenuItem;
