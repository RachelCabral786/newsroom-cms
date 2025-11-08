/** @type {import('postcss-load-config').Config} */
export default {
  plugins: {
    // These two plugins are mandatory for Tailwind V3 integration with PostCSS
    'tailwindcss': {},
    'autoprefixer': {},
  },
}