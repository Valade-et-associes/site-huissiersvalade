import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://www.huissiersvalade.com",
  output: "static",
  integrations: [sitemap()],
  trailingSlash: "always"
});
