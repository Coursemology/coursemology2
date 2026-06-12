import {
  KeyboardEvent,
  ReactNode,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { Box, ButtonBase, Tooltip } from '@mui/material';

export interface SegmentedSwitchOption<T> {
  value: T;
  /** Visible content. Keep it short — one word reads best in this control. */
  label: ReactNode;
  /** Optional hint shown on hover/focus of the segment. */
  tooltip?: ReactNode;
  /**
   * Accessible name for the segment. Falls back to `label` when that is a
   * plain string; supply this when `label` is an icon or other non-text node.
   */
  ariaLabel?: string;
}

interface SegmentedSwitchProps<T> {
  /** The currently selected option's value. */
  value: T;
  /** The options, left to right. Designed for 2 but renders any count. */
  options: SegmentedSwitchOption<T>[];
  /** Fired with the next value when a different segment is chosen. */
  onChange: (value: T) => void;
  /** Accessible name for the whole control (the radiogroup). */
  ariaLabel: string;
  disabled?: boolean;
  /**
   * Pass `self-stretch` to grow the switch to a taller row neighbour (e.g. a
   * small `TextField`), so the two align without hardcoding a height.
   */
  className?: string;
}

// Sized to MUI `size="small"` controls: 13px text, ~30.75px tall. Pixels are
// resolved through the theme's `pxToRem` so the switch matches its siblings
// regardless of the app's `htmlFontSize` (Coursemology uses 10, so a hardcoded
// rem would render ~38% too small). `MIN_HEIGHT` is a floor — `self-stretch`
// lets the switch grow to match a taller neighbour in the same flex row.
const FONT_PX = 13;
const PADDING_X = 1.5;
const MIN_HEIGHT = 30.75;

/**
 * A compact, peer-state mode switcher: a pill track with the options side by
 * side and a single elevated thumb that slides to the active one.
 *
 * Unlike a `Switch`, neither option reads as "off" — both are equally valid —
 * and unlike `ToggleButtonGroup` it stays content-width, so it fits a packed
 * toolbar or a dense prompt row. Use it when a binary choice has no default
 * "on" state (e.g. Points vs. Percentage, Equal vs. Custom).
 */
const SegmentedSwitch = <T extends string | number>(
  props: SegmentedSwitchProps<T>,
): JSX.Element => {
  const { value, options, onChange, ariaLabel, disabled, className } = props;

  const containerRef = useRef<HTMLDivElement>(null);
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [thumb, setThumb] = useState<{ left: number; width: number }>({
    left: 0,
    width: 0,
  });

  const activeIndex = Math.max(
    0,
    options.findIndex((o) => o.value === value),
  );

  useLayoutEffect(() => {
    const measure = (): void => {
      const el = optionRefs.current[activeIndex];
      const container = containerRef.current;
      if (!el || !container) return;
      setThumb({
        left: el.offsetLeft - container.clientLeft,
        width: el.offsetWidth,
      });
    };
    measure();
    const observer = new ResizeObserver(measure);
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [activeIndex, options.length]);

  const select = (index: number): void => {
    const next = options[index];
    if (next && next.value !== value) onChange(next.value);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>): void => {
    if (disabled) return;
    const last = options.length - 1;
    let next = activeIndex;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      next = activeIndex === last ? 0 : activeIndex + 1;
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      next = activeIndex === 0 ? last : activeIndex - 1;
    } else {
      return;
    }
    event.preventDefault();
    select(next);
    optionRefs.current[next]?.focus();
  };

  return (
    <Box
      ref={containerRef}
      aria-label={ariaLabel}
      className={className}
      onKeyDown={handleKeyDown}
      role="radiogroup"
      sx={(theme) => ({
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'stretch',
        minHeight: MIN_HEIGHT,
        boxSizing: 'border-box',
        p: '3px',
        borderRadius: 999,
        bgcolor: theme.palette.action.hover,
        border: `1px solid ${theme.palette.divider}`,
        opacity: disabled ? 0.5 : 1,
        pointerEvents: disabled ? 'none' : 'auto',
      })}
    >
      <Box
        aria-hidden
        sx={(theme) => ({
          position: 'absolute',
          top: '3px',
          bottom: '3px',
          left: 0,
          width: thumb.width,
          borderRadius: 999,
          bgcolor: theme.palette.background.paper,
          boxShadow: theme.shadows[1],
          opacity: thumb.width === 0 ? 0 : 1,
          transform: `translateX(${thumb.left}px)`,
          transition: theme.transitions.create(['transform', 'width'], {
            duration: 260,
            easing: 'cubic-bezier(0.34, 1.36, 0.64, 1)',
          }),
          zIndex: 0,
        })}
      />
      {options.map((option, index) => {
        const selected = index === activeIndex;
        const label =
          option.ariaLabel ??
          (typeof option.label === 'string' ? option.label : undefined);
        const segment = (
          <ButtonBase
            ref={(el) => {
              optionRefs.current[index] = el;
            }}
            aria-checked={selected}
            aria-label={label}
            disabled={disabled}
            disableRipple
            onClick={() => select(index)}
            role="radio"
            sx={(theme) => ({
              position: 'relative',
              zIndex: 1,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'inherit',
              fontSize: theme.typography.pxToRem(FONT_PX),
              height: '100%',
              fontWeight: selected ? 650 : 550,
              letterSpacing: '0.01em',
              color: selected
                ? theme.palette.text.primary
                : theme.palette.text.secondary,
              px: PADDING_X,
              py: 0,
              borderRadius: 999,
              whiteSpace: 'nowrap',
              transition: theme.transitions.create('color', { duration: 180 }),
              '&:hover': { color: theme.palette.text.primary },
              '&:focus-visible': {
                outline: `2px solid ${theme.palette.primary.main}`,
                outlineOffset: 2,
              },
            })}
            tabIndex={selected ? 0 : -1}
          >
            {option.label}
          </ButtonBase>
        );

        return option.tooltip ? (
          <Tooltip
            key={String(option.value)}
            placement="bottom"
            title={option.tooltip}
          >
            {segment}
          </Tooltip>
        ) : (
          <Box
            key={String(option.value)}
            component="span"
            sx={{ display: 'inline-flex' }}
          >
            {segment}
          </Box>
        );
      })}
    </Box>
  );
};

export default SegmentedSwitch;
