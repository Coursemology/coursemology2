import { Slider, SliderProps } from '@mui/material';
import { styled } from '@mui/material/styles';

const CustomSlider = styled(Slider)<SliderProps>(({ theme }) => ({
  height: 8,
  '& .MuiSlider-mark': {
    // Makes marks bigger
    height: 6,
    width: 6,
    borderRadius: '50%', // Make the marks rounded
    backgroundColor: '#555',
  },
  '& .MuiSlider-thumb': {
    height: 20,
    width: 20,
  },
  '& .MuiSlider-rail': {
    height: 5,
  },
  '& .MuiSlider-track': {
    height: 5,
  },
}));

export default CustomSlider;
