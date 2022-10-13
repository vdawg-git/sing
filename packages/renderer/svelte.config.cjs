/* eslint-disable no-undef */
const sveltePreprocess = require("svelte-preprocess")

module.exports = {
  // Consult https://github.com/sveltejs/svelte-preprocess
  // for more information about preprocessors

  /** @see https://github.com/sveltejs/language-tools/issues/650#issuecomment-1181354795  */
  preprocess: [sveltePreprocess({ postcss: true })],
  onwarn: (warning, handler) => {
    if (warning.code.startsWith("a11y-")) {
      return
    }
    handler(warning)
  },
}
