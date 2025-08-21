import { SliderProps } from '@mui/material';
import { styled } from '@mui/material/styles';

import CustomSlider from 'lib/components/extensions/CustomSlider';

const GetHelpSlider = styled(CustomSlider)<SliderProps>(({ theme }) => ({
  height: 8,
  '& .MuiSlider-mark': {
    // Makes marks bigger
    height: 5,
    width: 5,
    borderRadius: '50%', // Make the marks rounded
    backgroundColor: '#000000', // Tailwind's text-black hex value
  },
  '& .MuiSlider-thumb': {
    height: 20,
    width: 20,
    backgroundColor: '#60a5fa', // Tailwind's bg-blue-400 hex value
    '&:hover': {
      boxShadow: `0 0 0 5px #3b82f633`, // 33 = 20% opacity
    },
    '&.Mui-active': {
      boxShadow: `0 0 0 8px #3b82f633`, // 33 = 20% opacity
    },
  },
  '& .MuiSlider-rail': {
    height: 5,
    backgroundColor: '#b9dcfd', // Tailwind's bg-blue-200 hex value
  },
  '& .MuiSlider-track': {
    height: 5,
    border: 'none',
    backgroundColor: '#93c5fd', // Tailwind's bg-blue-300 hex value
  },
}));

export default GetHelpSlider;
