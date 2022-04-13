import { defineConfig } from "windicss/helpers"
import colors from "windicss/colors"

export default defineConfig({
  extract: {
    include: ["./packages/renderer/src/**/*.{html,js,svelte,ts}"],
  },
  theme: {
    fontFamily: {
      sans: ["Outfit"],
      serif: ["ui-serif", "Georgia", "Cambria", "Times, serif"],
      mono: [
        "ui-monospace",
        "SFMono-Regular",
        "Menlo",
        "Monaco",
        "Consolas",
        "Courier New",
        "monospace",
      ],
    },
    colors: {
      transparent: "transparent",
      current: "currentColor",
      grey: {
        900: "#131211",
        800: "#161413",
        700: "#222120",
        600: "#2F2E2D",
        500: "#4D4B4A",
        400: "#626262",
        300: "#95928E",
        200: "#B0AEAA",
        100: "#D6D3D1",
        50: "#E9E8E7",
      },
    },
  },
  plugins: [],
})
