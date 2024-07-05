import { writable } from 'svelte/store';

const getInitialState = () => {
    const stored = localStorage.getItem('userPrefs');
    return stored ? JSON.parse(stored) : { hideSelf: false };
};

export const userPreferences = writable(getInitialState());

export const updateUserPreferences = (prefs) => {
    userPreferences.set(prefs);
    localStorage.setItem('userPrefs', JSON.stringify(prefs));
};

userPreferences.subscribe(value => {
    localStorage.setItem('userPrefs', JSON.stringify(value));
});