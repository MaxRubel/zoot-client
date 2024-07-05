import { writable } from 'svelte/store';

export const localStreamStore = writable(null)

export const updateUserMediaStore = (value) => {
  localStreamStore.set(value)
}