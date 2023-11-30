import {derived, writable} from "svelte/store"
export const party = writable({
    client: false,
    connected: false,
    id: ``,
    inStreams: [],
    outStream: false,
    peers: [],
    calls: [],
    getUserMedia: false
})