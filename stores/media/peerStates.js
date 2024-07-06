import { writable } from 'svelte/store';

export const peerStates = writable({});

export const clearPeerStates = () => {
  peerStates.set({})
}
export function updatePeerState(peerId, updater) {
  peerStates.update(states => ({
    ...states,
    [peerId]: updater(states[peerId] || {})
  }));
}

export const deletePeerState = (peerId) => {
  peerStates.update(currentPeerStates => {
    const { [peerId]: _, ...newPeerStates } = currentPeerStates;
    return newPeerStates;
  });
};