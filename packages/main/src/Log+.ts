//? Only use when getting logs without information from the main process
// Import in index.ts like this: "    import "./LoggerEnhance""   "

import c from "ansicolor"
import { relative } from "path"

// https://stackoverflow.com/a/60305881/9578667
;(["debug", "log", "warn", "error"] as const).forEach((methodName) => {
  const originalLoggingMethod = console[methodName]
  console[methodName] = (firstArgument, ...otherArguments) => {
    const originalPrepareStackTrace = Error.prepareStackTrace
    Error.prepareStackTrace = (_, stack) => stack
    //@ts-ignore
    const callee = new Error().stack[1]
    Error.prepareStackTrace = originalPrepareStackTrace
    //@ts-ignore
    const relativeFileName = relative(process.cwd(), callee.getFileName())
    //@ts-ignore
    const prefix = c.dim(`${relativeFileName}:${callee.getLineNumber()}:`)
    if (typeof firstArgument === "string") {
      originalLoggingMethod(prefix + " " + firstArgument, ...otherArguments)
    } else {
      originalLoggingMethod(prefix, firstArgument, ...otherArguments)
    }
  }
})
