import { serverGlobal } from "../store/serverGlobal"

export const connect = (id, label = false) => {
    console.log( 'conneecting' )
    serverGlobal.update( (s) => ({
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
    $serverGlobal.outcoming[peerId] = peer
    return peer*/
}
export const keysIncludes = (state, value) => {
    return Object.keys(state).includes(value)
}