const colors = require("tailwindcss/colors")
const { join } = require("path")

module.exports = {
  content: [
    join(__dirname, "./packages/renderer/src/**/*.{html,js,svelte,ts}"),
  ],
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
      white: colors.white,
      black: colors.black,
      green: colors.green,
      red: colors.red,
    },
    extend: {
      boxShadow: {
        inset_light_xl: "inset 8px 8px 12px 0px rgba(255,255,255, 0.04)",
      },
    },
  },
  plugins: [],
}
