import { writable } from 'svelte/store';
import { v4 as uuidv4 } from "uuid";

export const clientId = writable(uuidv4());