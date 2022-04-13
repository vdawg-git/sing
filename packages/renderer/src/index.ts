import App from "./App.svelte"
import "virtual:windi.css"
import "virtual:windi-devtools"
import "./Global.css"

const app = new App({
  //@ts-expect-error
  target: document.getElementById("app"),
})

export default app
