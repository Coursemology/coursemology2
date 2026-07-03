import { KeyboardEvent, ReactNode, useRef } from 'react';
import { Box, ButtonBase, Tooltip } from '@mui/material';
import { alpha } from '@mui/material/styles';

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
 * A compact, peer-state mode switcher: a connected row of segments, the active
 * one filled in the primary color and the rest outlined. It mirrors the
 * `ButtonGroup` toggle used elsewhere in the app (e.g. the submission
 * Timeline/Sequence switch) so the two read as the same control.
 *
 * Unlike a `Switch`, neither option reads as "off" — both are equally valid —
 * and it stays content-width, so it fits a packed toolbar or a dense prompt
 * row. Use it when a binary choice has no default "on" state (e.g. Points vs.
 * Percentage, Equal vs. Custom).
 */
const SegmentedSwitch = <T extends string | number>(
  props: SegmentedSwitchProps<T>,
): JSX.Element => {
  const { value, options, onChange, ariaLabel, disabled, className } = props;

  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const activeIndex = Math.max(
    0,
    options.findIndex((o) => o.value === value),
  );

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
      aria-label={ariaLabel}
      className={className}
      onKeyDown={handleKeyDown}
      role="radiogroup"
      sx={{
        display: 'inline-flex',
        alignItems: 'stretch',
        minHeight: MIN_HEIGHT,
        boxSizing: 'border-box',
        opacity: disabled ? 0.5 : 1,
        pointerEvents: disabled ? 'none' : 'auto',
      }}
    >
      {options.map((option, index) => {
        const selected = index === activeIndex;
        const isFirst = index === 0;
        const isLast = index === options.length - 1;
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
            sx={(theme) => {
              // Use the `borderRadius` shorthand, never per-corner longhands:
              // MUI's `ButtonBase` base style sets `border-radius: 0` as a
              // shorthand, and under `injectFirst` that shorthand wins over
              // longhand corner overrides — collapsing the corners to 0. A
              // shorthand from `sx` overrides it reliably. Build it as a string
              // so `sx` doesn't re-scale it by `theme.shape.borderRadius`.
              const r = `${theme.shape.borderRadius}px`;
              const borderRadius =
                // eslint-disable-next-line no-nested-ternary
                isFirst && isLast
                  ? r
                  : // eslint-disable-next-line no-nested-ternary
                    isFirst
                    ? `${r} 0 0 ${r}`
                    : isLast
                      ? `0 ${r} ${r} 0`
                      : 0;
              return {
                position: 'relative',
                // Keep the active (filled) segment's border above its
                // neighbours' overlapping borders; a focus ring wins over both.
                zIndex: selected ? 1 : 0,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'inherit',
                fontSize: theme.typography.pxToRem(FONT_PX),
                // No explicit `height`: a percentage height would resolve
                // against the radiogroup's `minHeight` (not a definite height)
                // and collapse to the text's line height, *and* setting any
                // height cancels the parent's `alignItems: 'stretch'`. Letting
                // the segment stretch fills it to `MIN_HEIGHT` and lets it grow
                // with a taller `self-stretch` neighbour.
                fontWeight: 600,
                letterSpacing: '0.01em',
                px: PADDING_X,
                py: 0,
                whiteSpace: 'nowrap',
                border: `1px solid ${theme.palette.primary.main}`,
                borderRadius,
                // Collapse the shared edge between adjacent segments, the way
                // MUI's `ButtonGroup` does, so the divider stays 1px wide.
                ml: isFirst ? 0 : '-1px',
                color: selected
                  ? theme.palette.primary.contrastText
                  : theme.palette.primary.main,
                bgcolor: selected ? theme.palette.primary.main : 'transparent',
                transition: theme.transitions.create(
                  ['background-color', 'color'],
                  { duration: 180 },
                ),
                '&:hover': {
                  bgcolor: selected
                    ? theme.palette.primary.dark
                    : alpha(
                        theme.palette.primary.main,
                        theme.palette.action.hoverOpacity,
                      ),
                },
                '&:focus-visible': {
                  outline: `2px solid ${theme.palette.primary.main}`,
                  outlineOffset: 2,
                  zIndex: 2,
                },
              };
            }}
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
