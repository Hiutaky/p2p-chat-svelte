import {derived, writable} from "svelte/store"
export const defaultParty = {
    client: false,
    connected: false,
    id: ``,
    inStreams: {},
    outStream: false,
    peers: [],
    calls: {},
    waiting: [],
    getUserMedia: false,
}
export const party = writable(defaultParty)