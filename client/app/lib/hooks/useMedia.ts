import { useMediaQuery } from '@mui/material';
import { Breakpoint, useTheme } from '@mui/material/styles';

const PointerCoarse = (): boolean => useMediaQuery('(pointer: coarse)');
const PointerFine = (): boolean => useMediaQuery('(pointer: fine)');

const MinWidth = (breakpoint: Breakpoint): boolean => {
  const theme = useTheme();
  return useMediaQuery(theme.breakpoints.down(breakpoint));
};

const MaxWidth = (breakpoint: Breakpoint): boolean => {
  const theme = useTheme();
  return useMediaQuery(theme.breakpoints.up(breakpoint));
};

export default { PointerCoarse, PointerFine, MinWidth, MaxWidth };
