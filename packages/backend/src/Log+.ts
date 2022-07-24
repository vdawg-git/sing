// ? Only use when getting logs without good information (like numbers) from the process
// Import in index.ts like this: "    import "./LoggerEnhance""   "
import c from "ansicolor"
import path from "node:path"

// https://stackoverflow.com/a/60305881/9578667

const methods = ["debug", "log", "warn", "error"] as const

for (const methodName of methods) {
  const originalLoggingMethod = console[methodName]
  console[methodName] = (firstArgument, ...otherArguments) => {
    const originalPrepareStackTrace = Error.prepareStackTrace
    Error.prepareStackTrace = (_, stack) => stack
    // @ts-ignore
    const callee = new Error("Tmp").stack[1]
    Error.prepareStackTrace = originalPrepareStackTrace
    // @ts-ignore
    const relativeFileName = path.relative(process.cwd(), callee.getFileName())
    // @ts-ignore
    const prefix = c.dim(`${relativeFileName}:${callee.getLineNumber()}:`)
    if (typeof firstArgument === "string") {
      originalLoggingMethod(`${prefix} ${firstArgument}`, ...otherArguments)
    } else {
      originalLoggingMethod(prefix, firstArgument, ...otherArguments)
    }
  }
}
