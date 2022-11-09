import { FC } from 'react';
import SearchIcon from '@mui/icons-material/Search';
import Divider from '@mui/material/Divider';
import InputBase from '@mui/material/InputBase';
import Paper from '@mui/material/Paper';

interface Props {
  placeholder: string;
  width?: number;
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
  const { placeholder, width, onChange } = props;

  return (
    <Paper
      component="form"
      sx={{
        p: '2px 4px',
        display: 'flex',
        alignItems: 'center',
        width: width ?? 400,
      }}
    >
      <InputBase
        onChange={onChange}
        placeholder={placeholder}
        sx={{ ml: 1, flex: 1 }}
      />
      <SearchIcon />

      <Divider orientation="vertical" sx={{ height: 28, m: 0.5 }} />
    </Paper>
  );
};

export default SearchBar;
