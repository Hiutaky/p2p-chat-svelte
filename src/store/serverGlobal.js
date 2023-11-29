import {derived, writable} from "svelte/store"
export const serverGlobal = writable({
    client: false,
    current: false,
    incoming: {},
    outcoming: {},
    messages: {}, //object that have as key the peer id
    incomingStream: false,
    outcomingStream: false,
    calls: {},
    //explore
    peers: []
})