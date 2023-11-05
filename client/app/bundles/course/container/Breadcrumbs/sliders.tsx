import {
  RefObject,
  UIEventHandler,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import { IconButton, Slide } from '@mui/material';
import ResizeObserver from 'utilities/ResizeObserver';

interface UseSlidersHook {
  ref: RefObject<HTMLDivElement>;
  showStart: boolean;
  showEnd: boolean;
  handleScroll: UIEventHandler<Element>;
  onClickStart: () => void;
  onClickEnd: () => void;
}

export const useSliders = (): UseSlidersHook => {
  const ref = useRef<HTMLDivElement>(null);
  const [showSliders, setShowSliders] = useState([false, false]);

  const resetShowSliders = (element: Element): void => {
    const start = element.scrollLeft;
    const end = element.clientWidth + start;

    const isStartOfScroll = start === 0;
    const isEndOfScroll = end >= element.scrollWidth;

    setShowSliders([!isStartOfScroll, !isEndOfScroll]);
  };

  useLayoutEffect(() => {
    if (!ref.current) return undefined;

    const observer = new ResizeObserver((entries) => {
      const target = entries[0]?.target;
      if (!target) return;

      ref.current?.scrollTo({ left: target.scrollWidth });
      resetShowSliders(target);
    });

    observer.observe(ref.current);

    return () => observer.disconnect();
  }, []);

  return {
    ref,
    showStart: showSliders[0],
    showEnd: showSliders[1],
    handleScroll: (e) => resetShowSliders(e.currentTarget),
    onClickStart: () =>
      ref.current?.scrollBy({
        left: -((ref.current?.scrollWidth || 100) / 2),
        behavior: 'smooth',
      }),
    onClickEnd: (): void =>
      ref.current?.scrollBy({
        left: (ref.current?.scrollWidth || 100) / 2,
        behavior: 'smooth',
      }),
  };
};

interface SliderProps {
  in?: boolean;
  start?: boolean;
  onClick?: () => void;
}

export const Slider = (props: SliderProps): JSX.Element => (
  <Slide direction={props.start ? 'right' : 'left'} in={props.in}>
    <div
      className={`absolute top-0 flex h-full items-center ${
        props.start
          ? 'left-0 pl-2 pr-5 bg-fade-to-r-white'
          : 'right-0 pl-5 pr-2 bg-fade-to-l-white'
      }`}
    >
      <IconButton onClick={props.onClick} size="small">
        {props.start ? <ChevronLeft /> : <ChevronRight />}
      </IconButton>
    </div>
  </Slide>
);
