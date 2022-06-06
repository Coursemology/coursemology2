import Paper from '@mui/material/Paper';
import InputBase from '@mui/material/InputBase';
import Divider from '@mui/material/Divider';
import SearchIcon from '@mui/icons-material/Search';
import { FC } from 'react';

interface Props {
  placeholder: string;
  onChange: (
    event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>,
  ) => void;
}

/* 
Can refer to CourseDisplay.tsx on how to implement onChange.
Or refer to:
https://mui.com/material-ui/api/input-base/

This search bar will update the search everytime a change is detected
*/

const SearchBar: FC<Props> = (props) => {
  const { placeholder, onChange } = props;

  return (
    <Paper
      component="form"
      sx={{ p: '2px 4px', display: 'flex', alignItems: 'center', width: 400 }}
    >
      <InputBase
        sx={{ ml: 1, flex: 1 }}
        placeholder={placeholder}
        onChange={onChange}
      />
      <SearchIcon />

      <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
    </Paper>
  );
};

export default SearchBar;
