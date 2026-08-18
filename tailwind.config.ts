import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Driven by --color-primary (space-separated RGB channels) so premium
        // members can recolour the app at runtime. The <alpha-value> form is
        // required: a plain var() would silently break bg-primary/20 and
        // border-primary/50.
        primary: 'rgb(var(--color-primary) / <alpha-value>)',
        dark: {
          bg: '#0F0F0F',
          surface: '#1A1A1A',
          border: '#2D2D2D',
          text: '#E0E0E0',
        },
      },
      typography: {
        DEFAULT: {
          css: {
            color: '#E0E0E0',
            a: {
              color: '#00D084',
              '&:hover': {
                color: '#00D084',
              },
            },
          },
        },
      },
    },
  },
  plugins: [],
};

export default config;
