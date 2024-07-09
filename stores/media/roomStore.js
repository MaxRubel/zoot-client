// @ts-nocheck
import { writable } from 'svelte/store';

// Create writable stores for peerConnections and dataChannels
export const peerConnectionsStore = writable({});
export const dataChannelsStore = writable({});

// Helper function to update a specific peer connection
export function updatePeerConnectionStore(peerId, connection) {
  peerConnectionsStore.update(connections => ({
    ...connections,
    [peerId]: connection
  }));
}

// Helper function to update a specific data channel
export function updateDataChannelStore(peerId, channel) {
  dataChannelsStore.update(channels => ({
    ...channels,
    [peerId]: channel
  }));
}

// Helper function to remove a peer connection
export function removePeerConnection(peerId) {
  peerConnectionsStore.update(connections => {
    const { [peerId]: _, ...rest } = connections;
    return rest;
  });
}

// Helper function to remove a data channel
export function removeDataChannel(peerId) {
  dataChannelsStore.update(channels => {
    const { [peerId]: _, ...rest } = channels;
    return rest;
  });
}