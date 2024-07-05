import { writable } from 'svelte/store';

export const userMediaStore = writable(null)

export const updateUserMediaStore = (value) => {
  userMediaStore.set(value)
}