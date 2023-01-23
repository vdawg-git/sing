/**
 * @type {import('vite').UserConfig}
 * @see https://vitest.dev/config/
 */
const config = {
  test: {
    include: ["./*.spec.ts"],
  },
}

// eslint-disable-next-line import/no-default-export
export default config
