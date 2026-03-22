import type { Config } from "tailwindcss";

const config: Config = {
  content: [
<<<<<<< HEAD
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: { extend: {} },
=======
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {},
  },
>>>>>>> c82d7ec0c3afbc798ab926f91a33a5f81a5b6290
  plugins: [],
};

export default config;
