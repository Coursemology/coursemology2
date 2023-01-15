import { useState, useTransition } from 'react';
import { Clear, Search } from '@mui/icons-material';
import { IconButton, InputAdornment } from '@mui/material';

import TextField from 'lib/components/core/fields/TextField';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';

interface SearchFieldProps {
  onChangeKeyword?: (keyword: string) => void;
  placeholder?: string;
}

const SearchField = (props: SearchFieldProps): JSX.Element => {
  const [keyword, setKeyword] = useState('');
  const [isPending, startTransition] = useTransition();

  const changeKeyword = (newKeyword: string): void => {
    setKeyword(newKeyword);
    startTransition(() => props.onChangeKeyword?.(newKeyword));
  };

  const clearKeyword = (): void => {
    setKeyword('');
    props.onChangeKeyword?.('');
  };

  return (
    <TextField
      fullWidth
      hiddenLabel
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <Search color={keyword ? 'primary' : undefined} />
          </InputAdornment>
        ),
        endAdornment: (
          <InputAdornment position="end">
            {isPending && <LoadingIndicator bare size={20} />}

            {keyword && (
              <IconButton edge="end" onClick={clearKeyword}>
                <Clear />
              </IconButton>
            )}
          </InputAdornment>
        ),
      }}
      onChange={(e): void => changeKeyword(e.target.value)}
      placeholder={props.placeholder}
      size="small"
      trims
      value={keyword}
      variant="filled"
    />
  );
};

export default SearchField;
