import { add, subtract } from "fp-ts-std/Number"
import { writable } from "svelte/store"

function createIndexStore() {
  const { set, update, subscribe } = writable(-1)

  return { set, update, subscribe, increment, decrement, reset }

  /**
   * Add `1` to the current index
   */
  function increment() {
    update(add(1))
  }

  /**
   * Subtract `1` to the current index
   */
  function decrement() {
    update(subtract(1))
  }

  /**
   * Set the index to `0`.
   */
  function reset() {
    set(0)
  }
}

export default createIndexStore()
