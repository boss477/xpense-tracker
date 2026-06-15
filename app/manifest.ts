import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Cashew Brain",
    short_name: "Cashew",
    description: "Personal expense tracker and automation brain",
    start_url: "/",
    display: "standalone",
    background_color: "#1c1f17",
    theme_color: "#1c1f17",
    icons: [
      {
        src: "/icon.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
