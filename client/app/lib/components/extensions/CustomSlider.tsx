import { FC } from 'react';
import { Slider, SliderProps } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledSlider = styled(Slider)<SliderProps>(() => ({
  height: 8,
  '& .MuiSlider-mark': {
    height: 4,
    width: 4,
    borderRadius: '50%',
    backgroundColor: '#333',
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
}));

interface SliderPoint {
  value: number;
  label?: string;
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
  height: '34px',
  backgroundColor: `rgba(0, 200, 200, ${0.2 * (level + 1)})`,
  borderRadius: '17px',
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
            key={`bubble-${level}`}
            left={`calc(${leftPercent}% - 18px)`}
            level={level}
            width={`calc(${rightPercent - leftPercent}% + 36px)`}
          />,
        );

        bubbles.push(...renderBackgroundBubbles(element, level + 1));
      }
    });

    return bubbles;
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
        sx={{
          '& .MuiSlider-markLabel': {
            top: '40px',
          },
        }}
      />
    </div>
  );
};

export default CustomSlider;
