// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import config from './src/config/config.json';
import strapiMedia from './integrations/strapi-media.mjs';

// https://astro.build/config
export default defineConfig({
  site: config.site.base_url,
  trailingSlash: config.site.trailing_slash ? 'always' : 'ignore',
  integrations: [strapiMedia()],
  fonts: [
    // The template loads Geist and Instrument Serif from Google Fonts; Astro self-hosts them.
    // BDO Grotesk (headings) lives in public/fonts and is declared in src/styles/axiomet.css.
    {
      provider: fontProviders.google(),
      name: 'Geist',
      cssVariable: '--font-geist',
      weights: [300, 400, 500, 600, 700],
      styles: ['normal'],
      fallbacks: ['sans-serif'],
    },
    {
      provider: fontProviders.google(),
      name: 'Instrument Serif',
      cssVariable: '--font-instrument-serif',
      weights: [400],
      styles: ['normal'],
      fallbacks: ['sans-serif'],
    },
  ],
  vite: {
    // pre-bundle the animation libraries so the first dev page load registers
    // GSAP plugins before the interaction runtime (public/js/webflow.js) starts
    optimizeDeps: {
      include: ['gsap', 'gsap/ScrollTrigger', 'gsap/SplitText', 'lenis'],
    },
    server: {
      // the bundled Strapi backend lives in ./strapi and has its own toolchain
      watch: { ignored: ['**/strapi/**'] },
    },
  },
});
