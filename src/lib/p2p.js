import { main } from "../store/main"

export const connect = (id, label = false) => {
    console.log( 'conneecting' )
    main.update( (s) => ({
        ...s,
        outcoming: {
            ...s.outcoming,
            [id]: s.client.connect(id, {
                label: label ? label : id
            })
        }
    }))
    return id
    /*
    p2p.client.connect(id, {
        label: $user.name
    })
    $main.outcoming[peerId] = peer
    return peer*/
}
export const keysIncludes = (state, value) => {
    return Object.keys(state).includes(value)
}