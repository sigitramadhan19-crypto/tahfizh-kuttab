const config = {
  plugins: {
    "@tailwindcss/postcss": {},
    // Tailwind v4's default palette (and our custom theme in globals.css) is
    // defined with oklch(), which older Safari/iOS (<15.4) cannot parse at
    // all — this silently broke the app on older iPhones. This plugin emits
    // an rgb fallback declaration before every oklch one, so old browsers
    // use the fallback while modern browsers keep the original oklch value.
    "@csstools/postcss-oklab-function": { preserve: true },
  },
};

export default config;
