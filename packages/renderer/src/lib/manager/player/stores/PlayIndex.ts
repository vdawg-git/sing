import { add, subtract } from "fp-ts-std/Number"
import { writable } from "svelte/store"

function createIndexStore() {
  const { set, update, subscribe } = writable(-1)

  return { set, update, subscribe, increment, decrement }

  function increment() {
    update(add(1))
  }

  function decrement() {
    update(subtract(1))
  }
}

export default createIndexStore()
