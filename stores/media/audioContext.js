// @ts-nocheck
import { writable } from 'svelte/store';

export const audioContextStore = writable(null);

export function getAudioContext() {
  let context;
  audioContextStore.subscribe(value => {
    context = value;
  })();
  return context;
}

export function createAudioContext() {
  let context = getAudioContext()
  if(!context){
    const context = new AudioContext();
    audioContextStore.set(context);
  }
  return context;
}

export async function resumeAudioContext() {
  const context = getAudioContext();
  if (context && context.state === 'suspended') {
    await context.resume();
  }
}