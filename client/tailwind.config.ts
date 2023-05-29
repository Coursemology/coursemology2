/* eslint-disable import/no-extraneous-dependencies */
import containerQueries from '@tailwindcss/container-queries';
import type { Config } from 'tailwindcss';
import flattenColorPalette from 'tailwindcss/lib/util/flattenColorPalette';
import plugin from 'tailwindcss/plugin';

import palette from './app/theme/palette';

const SLOTTED_COLOR_VAR = '--tw-slotted-color';

export default {
  content: ['./app/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      scale: {
        200: '2',
      },
      transitionProperty: {
        position: 'opacity, left, right, top, bottom, visibility',
        margin: 'margin, margin-left, margin-right, margin-top, margin-bottom',
        outline:
          'outline, outline-width, outline-style, outline-color, outline-offset',
      },
      animation: {
        shake: 'shake 0.82s cubic-bezier(.36,.07,.19,.97) both',
        flash: 'flash 1s ease-in-out',
      },
      keyframes: {
        shake: {
          '10%, 90%': { transform: 'translate3d(-1px, 0, 0)' },
          '20%, 80%': { transform: 'translate3d(2px, 0, 0)' },
          '30%, 50%, 70%': { transform: 'translate3d(-4px, 0, 0)' },
          '40%, 60%': { transform: 'translate3d(4px, 0, 0)' },
        },
        flash: {
          '0%': { backgroundColor: `var(${SLOTTED_COLOR_VAR}-1)` },
          '100%': { backgroundColor: 'transparent' },
        },
      },
      colors: {
        primary: palette.primary.main,
      },
    },
  },
  corePlugins: {
    preflight: false,

    // TODO: Re-enable once Bootstrap components are purged
    // Temporarily disabled because Tailwind 3.2.0 adds a new `collapse` utility
    // that conflicts with Bootstrap's Collapse component used in our sidebar.
    visibility: false,
  },
  plugins: [
    plugin(({ addVariant }) => {
      addVariant('pointer-none', '@media (pointer: none)');
      addVariant('pointer-fine', '@media (pointer: fine)');
      addVariant('pointer-coarse', '@media (pointer: coarse)');
      addVariant('no-hover', '@media (hover: none)');
      addVariant('hoverable', '@media (hover: hover)');
    }),
    plugin(({ addVariant }) => {
      addVariant('hover?', '@media (hover: hover) { &:hover }');
      addVariant(
        'group-hover?',
        '@media (hover: hover) { :merge(.group):hover & }',
      );
    }),
    containerQueries,
    plugin(({ matchUtilities, theme }) => {
      matchUtilities(
        {
          'bg-fade-to-l': (value) => ({
            background: `linear-gradient(90deg, transparent 0%, ${value} 25%)`,
          }),
          'bg-fade-to-r': (value) => ({
            background: `linear-gradient(-90deg, transparent 0%, ${value} 25%)`,
          }),
        },
        { values: flattenColorPalette(theme('colors')), type: 'color' },
      );
    }),
    plugin(({ matchUtilities, theme }) => {
      matchUtilities(
        {
          'border-only-t': (value) => ({ borderTop: `1px solid ${value}` }),
          'border-only-b': (value) => ({ borderBottom: `1px solid ${value}` }),
          'border-only-l': (value) => ({ borderLeft: `1px solid ${value}` }),
          'border-only-r': (value) => ({ borderRight: `1px solid ${value}` }),
          'border-only-x': (value) => ({
            borderLeft: `1px solid ${value}`,
            borderRight: `1px solid ${value}`,
          }),
          'border-only-y': (value) => ({
            borderTop: `1px solid ${value}`,
            borderBottom: `1px solid ${value}`,
          }),
        },
        { values: flattenColorPalette(theme('colors')), type: 'color' },
      );
    }),
    plugin(({ matchUtilities, theme }) => {
      matchUtilities(
        { wh: (value) => ({ width: value, height: value }) },
        { values: theme('spacing'), type: 'number' },
      );
    }),
    plugin(
      ({ matchUtilities, theme }) => {
        matchUtilities(
          {
            'slot-1': (value) => ({ [`${SLOTTED_COLOR_VAR}-1`]: value }),
            'slot-2': (value) => ({ [`${SLOTTED_COLOR_VAR}-2`]: value }),
            'slot-3': (value) => ({ [`${SLOTTED_COLOR_VAR}-3`]: value }),
            'slot-4': (value) => ({ [`${SLOTTED_COLOR_VAR}-4`]: value }),
          },
          { values: flattenColorPalette(theme('colors')), type: 'color' },
        );
      },
      {
        theme: {
          extend: {
            colors: {
              'slot-1': `var(${SLOTTED_COLOR_VAR}-1)`,
              'slot-2': `var(${SLOTTED_COLOR_VAR}-2)`,
              'slot-3': `var(${SLOTTED_COLOR_VAR}-3)`,
              'slot-4': `var(${SLOTTED_COLOR_VAR}-4)`,
            },
          },
        },
      },
    ),
  ],
  important: '#root',
} satisfies Config;
