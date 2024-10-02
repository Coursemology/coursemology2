import { FC } from 'react';
import { Slider, SliderProps } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledSlider = styled(Slider)<SliderProps>(() => ({
  height: 8,
  '& .MuiSlider-mark': {
    height: 4,
    width: 4,
    borderRadius: '50%',
    backgroundColor: '#FFF',
  },
  '& .MuiSlider-thumb': {
    height: 20,
    width: 20,
  },
  '& .MuiSlider-rail': {
    height: 3,
  },
  '& .MuiSlider-track': {
    height: 3,
  },
  '& .MuiSlider-markLabel': {
    top: '40px',
  },
  '& .MuiSlider-valueLabel': {
    backgroundColor: '#00BCD4',
    borderRadius: '5px',
    '&:before': {
      display: 'none',
    },
    '& *': {
      background: 'transparent',
      color: '#FFF',
    },
  },
}));

interface SliderPoint {
  value: number;
  label?: string;
  tooltip?: string;
}

export type SliderElement = SliderPoint | SliderElement[];

interface Props extends Omit<SliderProps, 'marks' | 'min' | 'max' | 'step'> {
  points: SliderElement[];
}

const Bubble = styled('div')<{
  left: string;
  width: string;
  level: number;
}>(({ left, width, level }) => ({
  position: 'absolute',
  left,
  width,
  top: '13px',
  height: '8px',
  backgroundColor: `rgba(0, 188, 212, 0.8)`,
  borderRadius: '5px',
  transition: 'transform 0.2s',
  pointerEvents: 'none',
}));

const CustomSlider: FC<Props> = ({ points, ...sliderProps }) => {
  const flattenPoints = (elements: SliderElement[]): SliderPoint[] => {
    const result: SliderPoint[] = [];
    elements.forEach((element) => {
      if (Array.isArray(element)) {
        result.push(...flattenPoints(element));
      } else {
        result.push(element);
      }
    });
    return result;
  };

  const flattenedPoints = flattenPoints(points);
  const values = flattenedPoints.map((p) => p.value);
  const marks = flattenedPoints.map((p) => ({
    value: p.value,
    label: p.label,
  }));

  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);

  const renderBackgroundBubbles = (
    elements: SliderElement[],
    level: number = 0,
  ): JSX.Element[] => {
    const bubbles: JSX.Element[] = [];
    elements.forEach((element, index) => {
      if (Array.isArray(element)) {
        const childPoints = flattenPoints(element);
        const childValues = childPoints.map((p) => p.value);
        const groupMin = Math.min(...childValues);
        const groupMax = Math.max(...childValues);
        const leftPercent =
          ((groupMin - minValue) / (maxValue - minValue)) * 100;
        const rightPercent =
          ((groupMax - minValue) / (maxValue - minValue)) * 100;
        bubbles.push(
          <Bubble
            // eslint-disable-next-line react/no-array-index-key
            key={`bubble-${level}-${index}`}
            left={`calc(${leftPercent}% - 4px)`}
            level={level}
            width={`calc(${rightPercent - leftPercent}% + 10px)`}
          />,
        );
        bubbles.push(...renderBackgroundBubbles(element, level + 1));
      }
    });
    return bubbles;
  };

  const valueLabelFormat = (index: number): string => {
    const point = flattenedPoints[index];
    return point?.tooltip || '';
  };

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
      }}
    >
      {renderBackgroundBubbles(points)}
      <StyledSlider
        {...sliderProps}
        marks={marks}
        max={maxValue}
        min={minValue}
        step={null}
        style={{ position: 'relative' }}
        track={false}
        valueLabelFormat={valueLabelFormat}
      />
    </div>
  );
};

export default CustomSlider;
