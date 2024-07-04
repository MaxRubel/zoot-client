import { writable } from 'svelte/store';

const getInitialState = () => {
    const stored = localStorage.getItem('userSelection');
    return stored ? JSON.parse(stored) : { audioOn: false, videoOn: false};
};

export const userSelection = writable(getInitialState());

export const updateUserSelection = (audioOn, videoOn) => {
    userSelection.set({ audioOn, videoOn });
    localStorage.setItem('userSelection', JSON.stringify({ audioOn, videoOn }));
};

userSelection.subscribe(value => {
    localStorage.setItem('userSelection', JSON.stringify(value));
});