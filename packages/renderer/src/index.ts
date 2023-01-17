import "./Global.css"

import App from "./App.svelte"

const app = new App({
  // @ts-expect-error
  target: document.querySelector("#app"),
})

// eslint-disable-next-line import/no-default-export
export default app
