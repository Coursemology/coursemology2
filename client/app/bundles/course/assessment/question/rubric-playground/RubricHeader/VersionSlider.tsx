import { SliderProps } from '@mui/material';
import { styled } from '@mui/material/styles';

import CustomSlider from 'lib/components/extensions/CustomSlider';

const VersionSlider = styled(CustomSlider)<SliderProps>(({ theme }) => ({
  height: 8,
  '& .MuiSlider-mark': {
    // Makes marks bigger
    height: 8,
    width: 8,
    borderRadius: '50%', // Make the marks rounded
    backgroundColor: '#3b82f6', // Tailwind's bg-blue-500 hex value
  },
  '& .MuiSlider-thumb': {
    height: 18,
    width: 18,
    backgroundColor: '#1d4ed8', // Tailwind's bg-blue-700 hex value
    '&:hover': {
      boxShadow: `0 0 0 5px #2563eb33`, // 33 = 20% opacity
    },
    '&.Mui-active': {
      boxShadow: `0 0 0 8px #2563eb33`, // 33 = 20% opacity
    },
    '&.Mui-focusVisible': {
      boxShadow: `0 0 0 8px #2563eb33`, // 33 = 20% opacity
    },
  },
  '& .MuiSlider-rail': {
    height: 5,
    backgroundColor: '#bfdbfe', // Tailwind's bg-blue-200 hex value
  },
  '& .MuiSlider-track': {
    height: 5,
    border: 'none',
    backgroundColor: '#60a5fa', // Tailwind's bg-blue-400 hex value
  },
  '& .MuiSlider-valueLabel': {
    backgroundColor: `transparent`,
    color: theme.palette.text.primary,
    fontWeight: 'normal',
    top: '45px',
  },
  '& .MuiSlider-markLabel': {
    color: theme.palette.text.primary,
    fontWeight: 'normal',
    top: '-15px',
  },
}));

export default VersionSlider;
