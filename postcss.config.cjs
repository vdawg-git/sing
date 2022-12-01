const { join } = require("node:path")

module.exports = {
  plugins: {
    "tailwindcss/nesting": {},
    tailwindcss: {
      config: join(__dirname, "tailwind.config.cjs"),
    },
  },
}
