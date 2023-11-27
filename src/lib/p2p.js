import { p2p } from "../store/p2p"

export const connect = (id, label = false) => {
    console.log( 'conneecting' )
    p2p.update( (s) => ({
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
    $p2p.outcoming[peerId] = peer
    return peer*/
}
export const keysIncludes = (state, value) => {
    return Object.keys(state).includes(value)
}