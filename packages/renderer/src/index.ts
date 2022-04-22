// import "svelte-devtools-standalone"
import "./Global.css"

import App from "./App.svelte"

const app = new App({
  //@ts-expect-error
  target: document.getElementById("app"),
})

export default app
