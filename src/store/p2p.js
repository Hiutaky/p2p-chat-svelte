import {derived, writable} from "svelte/store"
export const p2p = writable({
    client: false,
    current: 0,
    incoming: {},
    outcoming: {},
    messages: {}, //object that have as key the peer id
    incomingStream: false,
    outcomingStream: false,
    calls: {},
})