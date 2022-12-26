import "./Global.css"

import App from "./App.svelte"

const app = new App({
  // @ts-expect-error
  target: document.querySelector("#app"),
})

export default app
