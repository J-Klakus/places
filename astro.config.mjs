// @ts-check
import { defineConfig, fontProviders } from "astro/config";
import cloudflare from "@astrojs/cloudflare";
import tailwindcss from "@tailwindcss/vite";

import svelte from "@astrojs/svelte";

import icon from "astro-icon";




// https://astro.build/config

export default defineConfig({
  experimental: {
    fonts: [
      {
        provider: fontProviders.fontsource(),
        name: "Plus Jakarta Sans",
        cssVariable: "--font-jakarta",
      },
    ],
  },
  image: {
    responsiveStyles: false,
  },
  vite: {
    plugins: [tailwindcss()],
  },
  adapter: cloudflare({
    platformProxy: {
      enabled: true,
    },
      imageService: 'cloudflare'
  }),
  output: "server",
  integrations: [
    svelte(),
    icon({
      include: {
        heroicons: [
          "information-circle",
          "document-plus-16-solid",
          "bookmark-square-solid",
          "arrow-right-start-on-rectangle-16-solid",
          "x-mark-16-solid",
          "trash",
          "pencil",
          "building-office-2",
          "cake",
          "wifi-20-solid",
          "map-pin-16-solid",
          "puzzle-piece-20-solid",
          "bars-3",
          "plus-sm",
          "minus-sm",
          "star",
        ],
      },
    }),
  ],
});                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           