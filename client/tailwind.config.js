const plugin = require('tailwindcss/plugin');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {},
  },
  corePlugins: {
    preflight: false,
  },
  plugins: [
    plugin(({ addVariant }) => {
      addVariant('pointer-none', '@media (pointer: none)');
      addVariant('pointer-fine', '@media (pointer: fine)');
      addVariant('pointer-coarse', '@media (pointer: coarse)');
      addVariant('no-hover', '@media (hover: none)');
      addVariant('hoverable', '@media (hover: hover)');
    }),
  ],
  important: '#root',
};
