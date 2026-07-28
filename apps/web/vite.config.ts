import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icon.svg"],
      manifest: {
        name: "Paradox Arena",
        short_name: "Paradox",
        description: "Read the grid. Predict the rival. Commit on the pulse.",
        theme_color: "#070b12",
        background_color: "#070b12",
        display: "standalone",
        orientation: "any",
        start_url: "/",
        icons: [
          {
            src: "/icon.svg",
            sizes: "any",
            type: "image/svg+xml",
            purpose: "any maskable"
          }
        ]
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,woff2}"]
      }
    })
  ],
  server: {
    host: "0.0.0.0",
    port: 7319,
    strictPort: true
  },
  preview: {
    host: "0.0.0.0",
    port: 7319,
    strictPort: true
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          phaser: ["phaser"],
          react: ["react", "react-dom"]
        }
      }
    }
  }
});
