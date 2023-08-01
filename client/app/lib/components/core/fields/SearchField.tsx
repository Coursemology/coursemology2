import {
  ComponentProps,
  useEffect,
  useRef,
  useState,
  useTransition,
} from 'react';
import { Clear, Search } from '@mui/icons-material';
import { IconButton, InputAdornment } from '@mui/material';

import TextField from 'lib/components/core/fields/TextField';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';

type SearchFieldProps = ComponentProps<typeof TextField> & {
  onChangeKeyword?: (keyword: string) => void;
  placeholder?: string;
  className?: string;
  noIcon?: boolean;
};

const SearchField = (props: SearchFieldProps): JSX.Element => {
  const { onChangeKeyword, noIcon, ...otherProps } = props;

  const [keyword, setKeyword] = useState('');
  const [isPending, startTransition] = useTransition();
  const ref = useRef<HTMLInputElement>(null);

  const changeKeyword = (newKeyword: string): void => {
    setKeyword(newKeyword);
    startTransition(() => onChangeKeyword?.(newKeyword));
  };

  const clearKeyword = (): void => {
    setKeyword('');
    onChangeKeyword?.('');
  };

  useEffect(() => {
    if (!props.autoFocus) return;

    ref.current?.focus();
  }, []);

  return (
    <TextField
      ref={ref}
      fullWidth
      hiddenLabel
      InputProps={{
        startAdornment: !noIcon && (
          <InputAdornment position="start">
            <Search color={keyword ? 'primary' : undefined} />
          </InputAdornment>
        ),
        endAdornment: (
          <InputAdornment position="end">
            {isPending && <LoadingIndicator bare size={20} />}

            {keyword && (
              <IconButton edge="end" onClick={clearKeyword} tabIndex={-1}>
                <Clear />
              </IconButton>
            )}
          </InputAdornment>
        ),
      }}
      size="small"
      trims
      variant="filled"
      {...otherProps}
      onChange={(e): void => changeKeyword(e.target.value)}
      value={keyword}
    />
  );
};

export default SearchField;
