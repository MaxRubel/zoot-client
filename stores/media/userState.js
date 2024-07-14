import { writable } from 'svelte/store';

const DEFAULT_PREFERENCES = {
    hideSelf: false,
    view: "speaker",
    debug: false,
    audioOn: false,
    videoOn: true,
    inRoom: false
};

const getInitialState = () => {
    const stored = localStorage.getItem('user_state');
    return stored ? JSON.parse(stored) : DEFAULT_PREFERENCES
};

export const userState = writable(getInitialState());

export function updateUserState(key, value) {
    userState.update(states => {
        const updatedStates = { ...states, [key]: value };
        const updateStateNoSharing = { ...updatedStates, sharing_screen: null, inRoom: null }
        localStorage.setItem('user_state', JSON.stringify(updateStateNoSharing));
        return updatedStates;
    });
}