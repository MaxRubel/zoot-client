import { writable } from 'svelte/store';

export const peerStates = writable({});

export const clearPeerStates = () => {
    peerStates.set({})
}
export function updatePeerState(peerId, newState) {
    peerStates.update(states => ({
      ...states,
      [peerId]: {
        ...states[peerId],
        ...newState
      }
    }));
  }