const colors = require("tailwindcss/colors")
// eslint-disable-next-line unicorn/prefer-node-protocol
const path = require("path")

module.exports = {
  content: [
    path.join(__dirname, "./packages/renderer/src/**/*.{html,js,svelte,ts}"),
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
        900: "#151414",
        800: "#171515",
        700: "#1A1919",
        600: "#242323",
        500: "#343332",
        400: "#4D4D4D",
        300: "#7E7A77",
        200: "#B0AEAA",
        100: "#D6D3D1",
        50: "#E9E8E7",
      },
      orange: {
        500: "#FF6C2D",
        800: "#A74B17",
      },
      amber: {
        500: "#FF9D29",
      },
      yellow: {
        300: "#F7D560",
        500: "#FFCF29",
        700: "#AD7B19",
      },
      white: "#F3F2EA",
      green: colors.green,
      red: colors.red,
      pureBlack: "#0000",
    },
    extend: {
      boxShadow: {},
      transitionTimingFunction: {
        bounce: "cubic-bezier(0.375, 0.055, 0.195, 1.535)",
      },
      fontSize: {
        xs2: ["10px", "12px"],
      },
    },
  },
  plugins: [],
}
