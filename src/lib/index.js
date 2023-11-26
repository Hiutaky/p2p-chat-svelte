// place files you want to import through the `$lib` alias in this folder.
import { Peer } from "peerjs"

export const P2PClient = ( peerId = '' ) => {
    const client = new Peer()
    return client
}