import { writable, type Unsubscriber } from "svelte/store"

function createIndexStore() {
  const { set, update, subscribe } = writable(0)

  return { set, update, subscribe, increment, decrement }

  function increment() {
    update(($index) => $index + 1)
  }

  function decrement() {
    update(($index) => $index - 1)
  }
}

export default createIndexStore()
