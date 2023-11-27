import {writable} from "svelte/store"
export const instance = writable({
    view: 'chats', //chats, messages, settings
})