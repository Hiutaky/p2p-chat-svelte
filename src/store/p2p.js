import {writable} from "svelte/store"
export const p2p = writable({
    client: false,
    current: 0,
    incoming: {},
    outcoming: {},
    waiting: {},
    messages: {}, //object that have as key the peer id
})