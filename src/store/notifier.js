import {derived, writable} from "svelte/store"
export const notifier = writable({
    notifications: [{
        peer: 'hiutaky-123',
        type: 'message', // message, incoming-call
        content: 'hiutaky-123 sent a message.',
        actions: () => alert('Yeeee')
    },{
        peer: 'jon-123',
        type: 'incoming-call', // message, incoming-call
        content: 'jon-123 is calling.',
        actions: [{
            label: 'Accept',
            onClick: () => alert('Accept'),
            class: "bg-success"
        },{
            label: 'Reject',
            onClick: () => alert('Decline'),
            class: "bg-danger"
        }]
    }],
    open: false
})

export const composeNotification = ({
    peer = 'system',
    type = 'message',
    content = '',
    actions = [],
}) => {
    return {
        peer: peer,
        type: type,
        content: content,
        actions: actions,
        timestamp: new Date().getTime()
    }
}